const cheerio = require('cheerio');

class Major {
    constructor(name, token){
        this.token = token;
        this.name = name;
        this.semesters = [];
    }
}

module.exports = Major;