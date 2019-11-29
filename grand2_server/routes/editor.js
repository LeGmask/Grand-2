let router = require('express').Router();
let sessionHandler = require(`../bin/sessionHandler.js`);
let utils = require('../bin/utils.js');
let cli = require('../bin/cli.js');
let config = require('../config');
let editorSession = [];

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

/**
 * middleware for ensuring connected client is from maniaplanet
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function ensureValidId(req, res, next) {
    let id = intval(req.params.id);
    if (editorSession[id] !== void 0) {
        next();
    }
    // end 
    res.sendStatus(404);
    res.end();
}

module.exports = function (eventDispatcher) {
    // this route requires maniaplanet!
    let users = {};

    router.use(ensureManiaplanet);

    // create new instances of sessionHandler
    for (var id = 0; id < config.editorInstances; id++) {
        editorSession[id] = new sessionHandler(id, eventDispatcher);
    }
    cli.success(`start of ${config.editorInstances} sessionhandlers`);

    router.all('/lobby/', function (req, res, next) {
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

        console.log(users);
        console.log(jsonResponse);
        res.send(jsonResponse);
    });

    router.post('/:id/join/', ensureValidId, function (req, res, next) {
        editorSession[req.params.id].startSession(req, res);
    });

    router.post('/:id/listener/', ensureValidId, function (req, res, next) {
        editorSession[req.params.id].registerListener(req, res);
    });

    router.post('/:id/push/', ensureValidId, function (req, res, next) {
        editorSession[req.params.id].sendMessage(req, res);
    });

    router.get('/:id/push/', ensureValidId, function (req, res, next) {
        editorSession[req.params.id].sendMessage(req, res);
    });

    return router;
};
