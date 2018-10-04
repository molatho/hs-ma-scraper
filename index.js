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
const GitHandler = require("./logic/git-handler");
const RoomProcessor = require("./logic/room-processor");
const path = require("path");
const DATA_DIR = path.join(__dirname, "data");

console.log("Scraping...");
var scraper = new Scraper();
scraper.fetch((err, res) => {
    if (err) {
        return console.error(err);
    }
    var hsma = scraper.hsma;
    //console.log("Resolving names...");
    //scraper.resolveFacultyNames(hsma.faculties, hsma.professors);

    for (var f in hsma.faculties){
        console.log(`> "${hsma.faculties[f].token}" \t(` +
        `${hsma.faculties[f].getMajorCount()} majors, \t` +
        `${hsma.faculties[f].getTotalSemesterCount()} semesters, \t` +
        `${hsma.faculties[f].getTotalCourseCount()} courses, \t` +
        `${hsma.faculties[f].getTotalCourseDateCount()} dates)`);
    }
    console.log("Number of requests made:", scraper.getNumberOfRequests());

    console.log("Exporting...");
    var dataExport = new DataExport(DATA_DIR);
    RoomProcessor.populateRooms(hsma);
    dataExport.export(hsma);

    // console.log("Synchronizing with remote repository...");
    // var handler = new GitHandler(DATA_DIR, "origin", "data");
    // handler.run((err, res)=>{
    //     if (err) {
    //         if (err.message == "Nothing to commit") {
    //             console.log("> Nothing to commit");
    //         } else {
    //             console.error("> Failed to commit:");
    //             console.error(err);
    //         }
    //     } else {
    //         console.log("> Successfully committed to remote repository");
    //     }
    // }, true);
});