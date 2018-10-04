
const request = require("request");
const Faculty = require("./faculty");
const Major = require("./major");
const Semester = require("./semester");


class HSMA {
    constructor() {
        this.faculties = [];
        this.professors = [];
        this.rooms = [];
    }

    getFaculty(token) {
        for (var f in this.faculties) {
            if (this.faculties[f].token == token) return this.faculties[f];
        }
        return null;
    }

    getProfessor(token) {
        for (var p in this.professors) {
            if (this.professors[p].token == token) return this.professors[p];
        }
        return null;
    }

    getRoom(token) {
        for (var r in this.rooms) {
            if (this.rooms[r].token == token) return this.rooms[r];
        }
        return null;
    }
}

module.exports = HSMA;