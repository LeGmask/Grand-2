let utils = require('./utils.js');
let cli = require('./cli.js');

class sessionHandler {

    constructor(id, eventDispatcher) {
        this.id = id;
        this.eventDispatcher = eventDispatcher;
        this.clientResponses = [];
        this.timeoutIds = [];
        this.users = [];

    }

    getStatus() {
        let admin = null;
        if (this.users.length > 0) {
            admin = this.users[0].login;
        }

        return {
            Id: this.id,
            Admin: admin,
            Users: this.users
        };
    }

    startSession(req, res) {
        this.users.push({
            Login: req.user.login,
            Nickname: req.user.nickname,
            isAdmin: (this.users.length == 0), // boolean
        });
        res.send("ok");
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
        var login = "n/a";
        if (req.user) {
            login = req.user.login;
        }
        this.clientResponses[id] = { login: login || null, response: res };
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
                delete self.clientResponses[id];
            }
        });
    }


    /**
     * @param {*} req 
     * @param {*} res 
     */
    sendMessage(req, res) {
        let message = req.body['data'] || "{}";
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
