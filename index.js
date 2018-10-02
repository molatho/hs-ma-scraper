//Professors:
//https://www.hs-mannheim.de/professorenliste/professoren.php
//Timetable:
//https://services.informatik.hs-mannheim.de/stundenplan/index.php
//Faculties:
//https://www.hs-mannheim.de/die-hochschule/fakultaeten-und-institute.html
//Institutes:
//https://www.hs-mannheim.de/die-hochschule/fakultaeten-und-institute/institute.html

const cheerio = require('cheerio');
const Scraper = require("./logic/scraper")
const DataExport = require("./logic/data-export");

console.log("Scraping...");
Scraper.fetch((err, res) => {
    if (err) {
        return console.error(err);
    }
    var faculties = res[0];
    var professors = res[1];
    console.log("Resolving names...");
    Scraper.resolveFacultyNames(faculties, professors);

    for (var f in faculties){
        console.log(`> "${faculties[f].token}" \t(` +
        `${faculties[f].getMajorCount()} majors, \t` +
        `${faculties[f].getTotalSemesterCount()} semesters, \t` +
        `${faculties[f].getTotalCourseCount()} courses, \t` +
        `${faculties[f].getTotalCourseDateCount()} dates)`);
    }
    console.log("Number of requests made:", Scraper.getNumberOfRequests());

    console.log("Exporting...");
    var dataExport = new DataExport("./data");
    dataExport.export(faculties, professors);

    console.log("Done");
});