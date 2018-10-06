var firstBy = require('thenby');

class Course {
    constructor(name, token){
        this.token = token;
        this.name = name;
        this.dates = [];
    }

    sort() {
        this.dates.sort(
            firstBy("dayOfWeek")
            .thenBy("timeSlot")
            .thenBy("prof")
            .thenBy("location")
        );
        for (var d in this.dates) {
            this.dates[d].sort();
        }
    }

    getDateCount(){
        return this.dates ? this.dates.length : 0;
    }
}

module.exports = Course;