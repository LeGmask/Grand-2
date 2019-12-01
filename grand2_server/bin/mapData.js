let utils = require('./utils.js');
let cli = require('./cli.js');


class mapData {
    constructor() {
        this.blocks = {};
    }

    modifyMap(jsonBlock) {
        for (let block of jsonBlock) {
            this.blocks[block.CoordStart] = block;
        }
    }

    getMapData() {
        let mapData = [];
        for (let i in this.blocks) {
            mapData.push(this.blocks[i]);
        }

        return mapData.sort((a, b) => parseInt(a.TimeStamp) - parseInt(b.TimeStamp)).reverse();
    }
}


module.exports = mapData;