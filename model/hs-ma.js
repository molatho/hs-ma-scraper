
const request = require("request");
const Faculty = require("./faculty");
const Major = require("./major");
const Semester = require("./semester");


class HSMA {
    constructor() {
        this.faculties = {};
    }
}

module.exports = HSMA;