var firstBy = require('thenby');

const Course = require("./course");
const Date = require("./Date");

class Semester {
    constructor(token){
        this.token = token;
        this.courses = {};
    }

    addCourseEntry(name, location, prof, dayOfWeek, timeSlot) {
        var course = this.courses[name.token] !== undefined ? this.courses[name.token] : this.courses[name.token] = new Course(name.text, name.token);
        course.dates.push(new Date(location.token, prof.token, dayOfWeek, timeSlot));
    }

    sort() {
        for (var c in this.courses){
            this.courses[c].sort();
        }
    }

    getTotalCourseDateCount(){
        var sum = 0;
        for (var c in this.courses) sum += this.courses[c].getDateCount();
        return sum;
    }

    getCourseCount() {
        var sum = 0;
        for (var c in this.courses) sum++;
        return sum;
    }

}

module.exports = Semester;