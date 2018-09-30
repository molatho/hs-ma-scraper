const cheerio = require('cheerio');

class Course {
    constructor(name, token){
        this.token = token;
        this.name = name;
        this.dates = [];
    }
}

module.exports = Course;