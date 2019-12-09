let chalk = require('chalk');
let utils = require('./utils');

module.exports = {
    error: function (error, title) {
        if (title == null) {
            title = "";
        }
        this.log(chalk.bold.red("[Error]" + title) + " " + error);
    },

    info: function (string) {
        this.log(chalk.cyan("[Info] ") + string);
    },

    success: function (string) {
        this.log(string + chalk.green(" [Success]"));
    },

    separator: function () {
        console.log(chalk.red("- - - - - - - - - - - - - - - - - - - - - - - - -"));
    },

    log: function (string) {
        console.log(getDateTime() + " " + string);
    },

    welcome: function () {
        this.separator();
        console.log(chalk.whiteBright(`

  ________                         .___________  
 /  _____/___________    ____    __| _/\\_____  \\ 
/   \\  __\\_  __ \\__  \\  /    \\  / __ |  /  ____/ 
\\    \\_\\  \\  | \\// __ \\|   |  \\/ /_/ | /       \\ 
 \\______  /__|  (____  /___|  /\\____ | \\_______ \\
        \\/           \\/     \\/      \\/         \\/

      `));
        this.separator();
        console.log('Starting Grand2 Version ' + chalk.red(utils.version.toString()));
        this.separator();
        console.log();
    },

};

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

}