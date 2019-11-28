let express = require('express');
let router = express.Router();
let config = ('../config');

module.exports = function (eventDispatcher) {
    router.get('/', function (req, res, next) {
        if (req.useragent.browser === "ManiaPlanet") {
            res.sendfile("public/test.xml");
            return;
        }

        res.render('index', { title: 'Express' });
    });

    return router;
};
