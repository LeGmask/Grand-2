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
        next();
    };
    // end 
    res.sendStatus(404);
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
}

module.exports = function (eventDispatcher) {

    // this route requires maniaplanet!
    router.use(ensureManiaplanet);

    // create new instances of sessionHandler
    for (var id = 0; id < config.editorInstances; id++) {
        editorSession[id] = new sessionHandler(eventDispatcher);
    }
    cli.success(`start of ${config.editorInstances} sessionhandlers`);

    router.post('lobby', function (req, res, next) {
        let jsonResponse = {
            sessions: [],

        };
        for (let session of editorSession) {
            jsonresponse.sessions.push(session.getStatus());
        }

        res.JSON(jsonResponse);
    });

    router.post(':id/listener', ensureValidId, function (req, res, next) {
        let id = intval(req.params.id);
        editorSession[id].registerListener(req, res);
    });

    router.post(':id/push', ensureValidId, function (req, res, next) {
        let id = intval(req.params.id);
        editorSession[id].sendMessage(req, res);
    });

    router.get(':id/push', ensureValidId, function (req, res, next) {
        editorSession.sendMessage(req, res);
    });

    return router;
};
