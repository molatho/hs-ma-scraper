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

Scraper.fetch((err, res) => {
    if (err) {
        return console.error(err);
    }
    var faculties = res[0];
    var professors = res[1];
    Scraper.resolveFacultyNames(faculties, professors);

    var dataExport = new DataExport("./data");
    dataExport.export(faculties, professors);

    return console.log(res);
});