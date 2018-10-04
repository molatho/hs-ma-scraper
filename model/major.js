var firstBy = require('thenby');

class Major {
    constructor(name, token){
        this.token = token;
        this.name = name;
        this.semesters = [];
    }

    getSemester(token) {
        for (var s in this.semesters) {
            if (this.semester[s].token == token) return this.semesters[s];
        }
        return null;
    }

    sort() {
        this.semesters.sort(
            firstBy("token")
        );
        for (var s in this.semesters){
            this.semesters[s].sort();
        }
    }

    getTotalCourseDateCount(){
        var sum = 0;
        for (var c in this.semesters) sum += this.semesters[c].getTotalCourseDateCount();
        return sum;
    }

    getTotalCourseCount(){
        var sum = 0;
        for (var c in this.semesters) sum += this.semesters[c].getCourseCount();
        return sum;
    }

    getSemesterCount() {
        return this.semesters ? this.semesters.length : 0;
    }
}

module.exports = Major;