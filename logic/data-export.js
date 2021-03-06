const fs = require("fs");
const path = require("path");

class DataExport {
    constructor(directory) {
        this.directory = directory;
        this.createDirectory(directory);
    }

    export(hsma) {
        this.exportObject(".", "hsma", hsma);
        this.exportFaculties(hsma.faculties);
        this.exportProfessors(hsma.professors);
        this.exportRooms(hsma.rooms);
    }

    exportRooms(rooms) {
        var folder = this.exportObject("rooms", "_all", rooms);
        for (var r in rooms) {
            this.exportObject("rooms", `${rooms[r].token}`, rooms[r], true);
        }
    }
    exportFaculties(faculties) {
        var folder = this.exportObject("timetable", "_all", faculties);
        for (var f in faculties) {
            for (var m in faculties[f].majors) {
                for (var s in faculties[f].majors[m].semesters) {
                    this.exportObject("timetable", `${faculties[f].token}.${faculties[f].majors[m].token}.${faculties[f].majors[m].semesters[s].token}`, faculties[f].majors[m].semesters[s], true);
                }
            }
        }
    }
    exportProfessors(professors) {
        var folder = this.exportObject("professors", "_all", professors);
        for (var p in professors) {
            this.exportObject("professors", `${professors[p].token}`, professors[p], true);
        }
    }

    exportObject(folderName, objectName, object, formatted) {
        var baseFolder = path.join(this.directory, folderName);
        this.createDirectory(baseFolder);

        if (formatted) {
            fs.writeFileSync(path.join(baseFolder, `${objectName}.json`), JSON.stringify(object, null, 4));
        } else {
            fs.writeFileSync(path.join(baseFolder, `${objectName}.json`), JSON.stringify(object));
        }
        return baseFolder;
    }

    createDirectory(directory) {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
    }
}

module.exports = DataExport;