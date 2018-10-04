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

var numRequests = 0;

class Scraper {
    constructor() {

    }

    static getNumberOfRequests() { return numRequests; }

    static makeRequest(url, callback) {
        numRequests++;
        request(url, callback);
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

    /**
     * Populates Faculty.name by traversing the list of professors
     * (The names of faculties is nowhere to be found on the timetable page)
     *
     * @static
     * @param {*} faculties
     * @param {*} professors
     * @memberof Scraper
     */
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
        Scraper.makeRequest(PROF_LIST_URL, function (error, response, body) {
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
                "token": $(facs[0].children[0]).text().trim(),
                "name": facs[0].attribs.title,
                "link": facs[0].attribs.href
            };
            var institutes = null;
            if (facs.length > 1) {
                institutes = [];
                for (var i = 1; i < facs.length; i++) {
                    institutes.push({
                        "token": $(facs[i].children[0]).text().trim(),
                        "name": facs[i].attribs.title,
                        "link": facs[i].attribs.href
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
        Scraper.makeRequest(SCHEDULE_BASE_URL, function (error, response, body) {
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
            var faculty = faculties[row.faculty] !== undefined ? faculties[row.faculty] : faculties[row.faculty] = new Faculty(row.faculty);
            var major = new Major(row.major.text, row.major.token);
            faculty.majors.push(major);
            Scraper.aquireSemesters(major, row.semesters, cb);
        }, err => {
            if (err) console.error("Failed to process rows:", err);
            else {
                for (var f in faculties) faculties[f].sort();
            }
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
        Scraper.makeRequest(SCHEDULE_SEMESTER_URL + token, function (error, response, body) {
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
                    var entries = Scraper.entriesFromCell(cells[c]);
                    if (entries == null || entries.length == 0) continue;
                    for (var e in entries){
                        semester.addCourseEntry(entries[e].name, entries[e].location, entries[e].prof, c - 1, r);
                    }
                }
            }
            callback();
        }.bind(Scraper));
    }

    static entriesFromCell(cell) {
        var children = cell.children.filter(_child => _child.type == "tag" && _child.name == "span");
        var entries = [];
        for (var i = 0; i < children.length; i+=3) {
            entries.push({
                "name": {
                    "text": children[i + 0].attribs.title,
                    "token": children[i + 0].children[0].data
                },
                "location": {
                    "text": children[i + 1].attribs.title,
                    "token": children[i + 1].children[0].data
                },
                "prof": {
                    "text": children[i + 2].attribs.title,
                    "token": children[i + 2].children[0].data
                }
            });
        }
        return entries;
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
        var semesters = [];
        for (var c = 0; c < 7; c++) { //7 semester columns
            var _semesters = Scraper.getCellInfo(children[c + 2], REGEX_TOKEN_SEMESTER);
            for (var s in _semesters) semesters.push(_semesters[s]);  
        }
        return {
            "faculty": children[0].children[0].data.trim(),
            "major": Scraper.getCellInfo(children[1], REGEX_TOKEN_MAJOR)[0],
            "semesters": semesters
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
        var children = node.children.filter(_child => _child.type == "tag" && _child.name == "a");
        var entries = [];
        for (var i = 0; i < children.length; i++) {
            var text = children[i].children[0].data;
            var url = children[i].attribs.href;
            var token = tokenRegex ? tokenRegex.exec(url) : null;
            if (token == null) token = url.split("=");
            entries.push({
                "text" : text,
                "url": url,
                "token": token != null && token.length == 2 ? token[1] : null
            });
        }
        return entries;
    }
}

module.exports = Scraper;