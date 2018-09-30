const cheerio = require('cheerio');
var async = require("async");
const request = require("request");

const Faculty = require("../model/faculty");
const Major = require("../model/major");
const Semester = require("../model/semester");

const SCHEDULE_SEMESTER_URL = "https://services.informatik.hs-mannheim.de/stundenplan/stundenplan.php?xsem=";
const SCHEDULE_BASE_URL = "https://services.informatik.hs-mannheim.de/stundenplan/index.php";
const PROF_LIST_URL = "https://www.hs-mannheim.de/professorenliste/professoren.php";
const REGEX_TOKEN_MAJOR = /xstdg=(.*)/g;
const REGEX_TOKEN_SEMESTER = /xsem=(.*)/g;
const REGEX_PROF_NAME = /([^,]*)?,\s*([^\(]*)?\(([^\)]*)\)?\s*E-Mail:\s*([^\s]*)?/;

class Scraper {
    constructor() {

    }

    static fetch(callback) {
        async.series([
            Scraper.fetchOverview,
            Scraper.fetchProfessors
        ], (err, res) => {
            if (err) console.error("Failed to fetch data:", err);
            callback(err, res);
        });
    }

    static resolveFacultyNames(faculties, professors) {
        for (var f in faculties) {
            var faculty = faculties[f];
            for (var p in professors) {
                var prof = professors[p];
                if (prof.associations.faculty !== null && prof.associations.faculty.token == faculty.token) {
                    faculty.name = prof.associations.faculty.name;
                    break;
                }
            }
        }
    }

    static fetchProfessors(callback) {
        request(PROF_LIST_URL, function (error, response, body) {
            if (error) {
                return callback(error);
            }
            var $ = cheerio.load(body);
            var _rows = [];
            var odd = $('tr[class=row-odd]');
            var even = $('tr[class=row-even]');
            var profs = {};

            for (var i = 0; i < odd.length; i++) {
                Scraper.processProf(profs, odd.get(i), $);
            }
            for (var i = 0; i < even.length; i++) {
                Scraper.processProf(profs, even.get(i), $);
            }
            callback(null, profs);
        }.bind(Scraper));
    }

    static processProf(profs, row, $) {
        var name = $($($(row).find("td")).get(0)).text().trim();
        var data = REGEX_PROF_NAME.exec(name);
        if (data == null) {
            console.error(i, "Failed to regex", name);
            return;
        }
        var website = null;
        if (name.indexOf("Website") !== -1) {
            website = $($($($(row).find("td")).get(0)).find("a")).last()[0].attribs.href;
        }
        var facs = $($($(row).find("td")).get(1)).find("a");
        var assoc = null;
        if (facs.length > 0) {
            var faculty = {
                "token":$(facs[0].children[0]).text().trim(),
                "name":facs[0].attribs.title,
                "link":facs[0].attribs.href
             };
            var institutes = null;
            if (facs.length > 1) {
                institutes = [];
                for (var i = 1; i < facs.length; i++) {
                    institutes.push({
                        "token":$(facs[i].children[0]).text().trim(),
                        "name":facs[i].attribs.title,
                        "link":facs[i].attribs.href
                    });
                }
            }
            assoc = {
                "faculty": faculty,
                "institutes": institutes
            };
        }
        var extra = $($($(row).find("td")).get(2)).text().trim();
        var location = $($($(row).find("td")).get(3)).text().trim();
        var phone = $($($(row).find("td")).get(4)).text().trim();
        var appointments = $($($(row).find("td")).get(5)).text().trim();
        profs[data[3]] = {
            "name": data[2].trim() + " " + data[1],
            "email": data[4] !== undefined ? data[4] : null,
            "website": website,
            "associations": assoc,
            "extra": extra,
            "location": location.length > 0 ? location : null,
            "phone": phone.length > 0 ? "(0621)-" + phone : null,
            "appointments": appointments
        };
    }

    static fetchOverview(callback) {
        request(SCHEDULE_BASE_URL, function (error, response, body) {
            if (error) {
                return callback(error);
            }
            var $ = cheerio.load(body);
            var _rows = [];
            $('tr[class=row-odd]').each((i, elem) => {
                _rows.push(Scraper.extractRowInfoOverview(elem));
            })
            $('tr[class=row-even]').each((i, elem) => {
                _rows.push(Scraper.extractRowInfoOverview(elem));
            });
            Scraper.reduceMajorsToFaculties(_rows, callback);
        }.bind(Scraper));
    }

    static reduceMajorsToFaculties(rows, callback) {
        var faculties = {};
        async.forEach(rows, (row, cb) => {
            var faculty = faculties[row.faculty.text] !== undefined ? faculties[row.faculty.text] : faculties[row.faculty.text] = new Faculty(row.faculty.text);
            var major = new Major(row.major.text, row.major.token);
            faculty.majors.push(major);
            Scraper.aquireSemesters(major, row.semesters, cb);
        }, err => {
            if (err) console.error("Failed to process rows:", err);
            callback(err, faculties);
        });
    }

    static aquireSemesters(major, semesters, callback) {
        async.forEach(semesters, (semester, cb) => {
            if (semester.text.length == 0) {
                return cb();
            }
            var _semester = new Semester(semester.text);
            major.semesters.push(_semester);
            Scraper.fetchSemester(_semester, semester.token, cb);
        }, err => {
            if (err) console.error("Failed to process major's semesters:", err);
            callback(err, major);
        });
    }

    static fetchSemester(semester, token, callback) {
        request(SCHEDULE_SEMESTER_URL + token, function (error, response, body) {
            if (error) return callback(error);
            var $ = cheerio.load(body);
            var _rows = [null, null, null, null, null, null];
            $('tr[class=row-odd]').each((i, elem) => {
                _rows[i * 2 + 1] = elem;
            })
            $('tr[class=row-even]').each((i, elem) => {
                _rows[i * 2] = elem;
            });
            for (var r = 0; r < _rows.length; r++) {
                var row = _rows[r];
                var cells = row.children.filter(_child => _child.type == "tag" && _child.name == "td");
                for (var c = 0; c < cells.length; c++) {
                    var entry = Scraper.entryFromCell(cells[c]);
                    if (entry == null) continue;
                    semester.addCourseEntry(entry.name, entry.location, entry.prof, c - 1, r);
                }
            }
            callback();
        }.bind(Scraper));
    }

    static entryFromCell(cell) {
        var children = cell.children.filter(_child => _child.type == "tag" && _child.name == "span");
        if (children.length == 0) return null;
        return {
            "name": {
                "text": children[0].attribs.title,
                "token": children[0].children[0].data
            },
            "location": {
                "text": children[1].attribs.title,
                "token": children[1].children[0].data
            },
            "prof": {
                "text": children[2].attribs.title,
                "token": children[2].children[0].data
            }
        };
    }

    /**
     * Creates a structure containing relevant information of the given row
     *
     * @param {*} row
     * @returns
     * @memberof Scraper
     */
    static extractRowInfoOverview(row) {
        var children = row.children.filter(_child => _child.type == "tag" && _child.name == "td");
        return {
            "faculty": Scraper.getCellInfo(children[0]),
            "major": Scraper.getCellInfo(children[1], REGEX_TOKEN_MAJOR),
            "semesters": [
                Scraper.getCellInfo(children[2], REGEX_TOKEN_SEMESTER),
                Scraper.getCellInfo(children[3], REGEX_TOKEN_SEMESTER),
                Scraper.getCellInfo(children[4], REGEX_TOKEN_SEMESTER),
                Scraper.getCellInfo(children[5], REGEX_TOKEN_SEMESTER),
                Scraper.getCellInfo(children[6], REGEX_TOKEN_SEMESTER),
                Scraper.getCellInfo(children[7], REGEX_TOKEN_SEMESTER),
                Scraper.getCellInfo(children[8], REGEX_TOKEN_SEMESTER)
            ]
        }
    }

    /**
     * Extracts text, url and tokens out of a table-cell (used for the overview page)
     *
     * @param {*} node
     * @param {*} tokenRegex
     * @returns
     * @memberof Scraper
     */
    static getCellInfo(node, tokenRegex) {
        if (node === null || node.children === null || node.children.length == 0) {
            return null;
        }
        if (node.children[0].name == "a") {
            var url = node.children[0].attribs.href;
            var token = tokenRegex ? tokenRegex.exec(url) : null;
            if (token == null) {
                //Hack: if the regex didn't work, perform a simple split
                token = url.split("=");
            }
            return {
                "text": node.children[0].children[0].data,
                "url": url,
                "token": token != null && token.length == 2 ? token[1] : null
            };
        } else {
            return { "text": node.children[0].data.trim() };
        }
    }
}

module.exports = Scraper;