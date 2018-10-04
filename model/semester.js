var firstBy = require('thenby');

const Course = require("./course");
const Date = require("./Date");

class Semester {
    constructor(token){
        this.token = token;
        this.courses = [];
    }

    getCourse(token) {
        for (var c in this.courses) {
            if (this.courses[c].token == token) return this.courses[c];
        }
        return null;
    }

    addCourseEntry(name, location, prof, dayOfWeek, timeSlot) {
        var course = this.getCourse(name.token);
        if (course == null) {
            course = new Course(name.text, name.token);
            this.courses.push(course);
        }
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