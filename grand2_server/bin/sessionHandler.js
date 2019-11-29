let utils = require('./utils.js');
let cli = require('./cli.js');

class sessionHandler {

    constructor(id, eventDispatcher) {
        this.id = id;
        this.eventDispatcher = eventDispatcher;
        this.clientResponses = [];
        this.timeoutIds = [];
        // 
        this.users = [];
        
    }

    getStatus() {
        var outUsers = [];
        for (var user of this.users) {

        }
        
        return {
            users: outUsers,
        };
    }

    startSession(req, res) {
        this.users.push({
            login: req.body['login'],
            nickname: req.body['nick'],
            token: utils.uuidv4(),
            isAdmin: (this.users.length == 0), // boolean
        });
    }

    registerListener(req, res) {
        let id = utils.uuidv4();
        if (req.session.views) {
            console.log(req.sessionID);
            console.log('updates: ' + req.session.views);
            console.log('expires in: ' + (req.session.cookie.maxAge / 1000) + 's');
            req.session.views++;
        } else {
            req.session.views = 1;
        }
        res.setHeader('Content-Type', 'text/plain;charset=utf-8');
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
        this.clientResponses[id] = { login: req.query['login'] || null, response: res };

        let self = this;
        req.on('close', function (err) {
            if (req.session.views) {
                req.session.views++;
                console.log(req.session.views);
            } else {
                req.session.views = 1;
                console.log(req.session.views);
            }

            if (self.clientResponses.hasOwnProperty(id)) {
                console.log(self.clientResponses.keys);
                delete self.clientResponses[id];
            }
        });
    }


    /**
     * @param {*} req 
     * @param {*} res 
     */
    sendMessage(req, res) {
        let login = req.query['login'] || "none";
        let message = req.query['msg'] || req.body['data'] || "{}";
        req.session.cookie.expires = new Date(Date.now() + 30000);
        req.session.cookie.maxAge = 60000;
        for (let client in this.clientResponses) {
            console.log("sending", this.clientResponses[client].login);
            // if (this.clientResponses[client].login !== login) {
            this.clientResponses[client].response.send(message);
            delete this.clientResponses[client];
            // }
        }

        res.send("ok.");
    }
}

module.exports = sessionHandler; 
