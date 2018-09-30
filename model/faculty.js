const cheerio = require('cheerio');

class Faculty {
    constructor(token){
        this.token = token;
        this.name = "";
        this.majors = [];
    }
}

module.exports = Faculty;