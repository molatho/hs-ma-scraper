const cheerio = require('cheerio');

class Date {
    constructor(locations, prof, dayOfWeek, timeSlot){
        this.dayOfWeek = dayOfWeek;
        this.timeSlot = timeSlot;
        this.prof = prof;
        this.locations = locations;
    }
    
    sort() {
        this.locations.sort();
    }
}

module.exports = Date;