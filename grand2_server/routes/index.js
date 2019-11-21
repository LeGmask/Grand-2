let router = require('express').Router();
let sessionHandler = require(`../bin/sessionHandler.js`);
let editorSession;


module.exports = function (eventDispatcher) {

    // create new instance of
    editorSession = new sessionHandler(eventDispatcher);

    router.get('/', function (req, res, next) {
        if (req.useragent.browser === "ManiaPlanet") {
            res.sendfile("public/test.xml");
            return;
        }
        
        res.render('index', {title: 'Express'});
    });

    router.get('/listener', function (req, res, next) {
        editorSession.registerListener(req, res);
        console.log("sent.")
    });

    router.get('/news', function (req, res, next) {
        res.send("                          Latest Version : 1.0             Some UI added, bug fix.");
    });

    router.post('/push', function (req, res, next) {
        // here we compose the message to be sent
        editorSession.sendMessage(req);
        res.send("ok."); // set something better :)
    });

    return router;
};
