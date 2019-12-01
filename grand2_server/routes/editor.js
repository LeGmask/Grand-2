let router = require('express').Router();
let sessionHandler = require(`../bin/sessionHandler.js`);
let utils = require('../bin/utils.js');
let cli = require('../bin/cli.js');
let chalk = require('chalk');
let config = require('../config');
let editorSession = [];
let users = {};

function getUserByToken(token) {
    var objKey = Object.keys(users).find(key => {
        return users[key].token === token;
    });
    return users[objKey];
}


/**
 * middleware for ensuring connected client is from maniaplanet
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function ensureManiaplanet(req, res, next) {
    if (req.useragent.browser === "ManiaPlanet") {
        if (req.headers.authorization === config.serverPassword) {
            next();
        } else {
            res.sendStatus(403);
            res.end();
        }
    } else {
        res.render('error', { message: "Error", error: { status: "Not Maniaplanet", stack: "" } });
    }
}

function ensureValidId(req, res, next) {
    let id = parseInt(req.params.id);
    req.instanceId = id;
    req.user = getUserByToken(req.body['token']);
    if (req.user !== null) {
        if (editorSession[id] !== undefined) {
            next();
        } else {
            res.sendStatus(403);
            res.end();
        }
    } else {
        // end 
        res.sendStatus(404);
        res.end();
    }
}

module.exports = function (eventDispatcher) {
    // this route requires maniaplanet!




    router.use(ensureManiaplanet);

    // create new instances of sessionHandler
    for (var id = 0; id < config.editorInstances; id++) {
        editorSession[id] = new sessionHandler(id, eventDispatcher);
    }
    cli.success(`start of ${config.editorInstances} sessionhandlers`);

    router.post('/lobby', function (req, res, next) {
        let token = utils.uuidv4();

        users[req.body['login']] = {
            token: token,
            login: req.body['login'],
            nickname: req.body['nickname']
        };

        let jsonResponse = {
            Token: token,
            Sessions: [],
        };

        for (let session of editorSession) {
            jsonResponse.Sessions.push(session.getStatus());
        }

        res.send(JSON.stringify(jsonResponse));
    });

    router.post('/:id/join', ensureValidId, function (req, res, next) {
        editorSession[req.instanceId].startSession(req, res);
    });

    router.post('/:id/listener', ensureValidId, function (req, res, next) {
        editorSession[req.instanceId].registerListener(req, res);
    });

    router.post('/:id/push', ensureValidId, function (req, res, next) {
        editorSession[req.instanceId].sendMessage(req, res);
    });

    router.get('/:id/push', ensureValidId, function (req, res, next) {
        editorSession[req.instanceId].sendMessage(req, res);
    });

    return router;
};
