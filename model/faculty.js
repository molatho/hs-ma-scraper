var firstBy = require('thenby');

class Faculty {
    constructor(token){
        this.token = token;
        this.name = "";
        this.majors = [];
    }

    sort() {
        this.majors.sort(
            firstBy("token")
            .thenBy("name")
        );
        for (var m in this.majors){
            this.majors[m].sort();
        }
    }

    getTotalCourseDateCount(){
        var sum = 0;
        for (var c in this.majors) sum += this.majors[c].getTotalCourseDateCount();
        return sum;
    }

    getTotalCourseCount(){
        var sum = 0;
        for (var c in this.majors) sum += this.majors[c].getTotalCourseCount();
        return sum;
    }

    getTotalSemesterCount() {
        var sum = 0;
        for (var c in this.majors) sum += this.majors[c].getSemesterCount();
        return sum;
    }

    getMajorCount() {
        return this.majors ? this.majors.length : 0;
    }
}

module.exports = Faculty;