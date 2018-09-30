const cheerio = require('cheerio');

class Date {
    constructor(location, prof, dayOfWeek, timeSlot){
        this.dayOfWeek = dayOfWeek;
        this.timeSlot = timeSlot;
        this.prof = prof;
        this.location;
    }
}

module.exports = Date;