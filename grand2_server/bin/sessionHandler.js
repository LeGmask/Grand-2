/** Generate an uuid
 * @url https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#2117523 **/
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class sessionHandler {

    constructor(eventDispatcher) {
        this.eventDispatcher = eventDispatcher;
        this.clientResponses = [];
        this.timeoutIds = [];
    }

    registerListener(req, res) {
        let id = uuidv4();

        res.setHeader('Content-Type', 'text/plain;charset=utf-8');
        res.setHeader("Cache-Control", "no-cache, must-revalidate");

        this.clientResponses[id] = {login: req.query['login'] || null, response: res};

        let self = this;
        req.on('close', function () {
            if (self.clientResponses.hasOwnProperty(id)) {
                delete self.clientResponses[id];
            }
        });
    }

    sendMessage(req) {
        let login = req.query['login'] || "none";
        let message = req.body['data'] || "{}";
        for (let client in this.clientResponses) {
            console.log("sending", this.clientResponses[client].login);
            if (this.clientResponses[client].login !== login) {
                this.clientResponses[client].response.send(message);
                delete this.clientResponses[client];
            }
            
        }
    }
}

module.exports = sessionHandler; 
