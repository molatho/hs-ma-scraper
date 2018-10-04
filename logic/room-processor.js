var firstBy = require('thenby');

class Room {
    constructor(token) {
        this.token = token;
        this.days = [];
    }

    sort() {
        this.days.sort(
            firstBy("dayOfWeek")
        );
        for (var d in this.days) {
            this.days[d].sort();
        }
    }

    getDay(dayOfWeek) {
        for (var d in this.days) {
            if (this.days[d].dayOfWeek == dayOfWeek) return this.days[d];
        }
        return null;
    }
}

class Day {
    constructor(dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
        this.blocks = [];
    }

    sort() {
        this.blocks.sort(
            firstBy("number")
            .thenBy("course")
            .thenBy("professor")
            .thenBy("semester")
        );
    }

    getBlock(number) {
        for (var b in this.blocks) {
            if (this.blocks[b].number == number) return this.blocks[b];
        }
        return null;
    }
}

class Block {
    constructor(number, professor, course, semester) {
        this.number = number;
        this.professor = professor;
        this.course = course;
        this.semester = semester;
    }
}

var ROOM_REGEX1 = /([A-Z])([0-9]+)\/([0-9]+)/;
function splitRoomNames(name) {
    var newNames = [];
    name = name.trim();
    if (name.indexOf(',') !== -1) {
        var arr = name.split(',');
        for (var i = 0; i < arr.length; i++) newNames.push(arr[i].trim());
    } else if (name.indexOf('/') !== -1) {
        var match = ROOM_REGEX1.exec(name);
        var arr = [];
        if (match != null) {
            arr = [match[1] + match[2], match[1] + match[3]];
        } else {
            arr = name.split('/');
        }
        for (var i = 0; i < arr.length; i++) newNames.push(arr[i].trim());
    } else if (name.indexOf('\\') !== -1) {
        var arr = name.split('\\');
        for (var i = 0; i < arr.length; i++) newNames.push(arr[i].trim());
    } else {
        newNames.push(name);
    }
    return newNames;
}

class RoomProcessor {
    static populateRooms(hsma) {
        for (var f in hsma.faculties) {
            for (var m in hsma.faculties[f].majors) {
                for (var s in hsma.faculties[f].majors[m].semesters) {
                    var semester = hsma.faculties[f].majors[m].semesters[s]; 
                    for (var c in semester.courses) {
                        var course = semester.courses[c];
                        for (var d in course.dates) {
                            var date = course.dates[d];
                            var roomNames = splitRoomNames(date.location);
                            for (var r in roomNames) {
                                var roomName = roomNames[r];
                                var room = hsma.getRoom(roomName);
                                if (room == null) {
                                    room = new Room(roomName);
                                    hsma.rooms.push(room);
                                }
                                var day = room.getDay(date.dayOfWeek);
                                if (day == null) {
                                    day = new Day(date.dayOfWeek);
                                    room.days.push(day);
                                }
                                day.blocks.push(new Block(date.timeSlot, date.prof, course.token, semester.token));
                            }
                        }
                    }
                }
            }
        }
        
        hsma.rooms.sort(
            firstBy("token")
        );
        for (var r in hsma.rooms) {
            hsma.rooms[r].sort();
        }
    }
}

module.exports = RoomProcessor;