class Room {
    constructor(token) {
        this.token = token;
        this.days = {};
        for (var i = 0; i < 5; i++) this.days[i.toString()] = new Day(i);
    }
}


class Day {
    constructor(dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
        this.blocks = {};
        for (var i = 0; i < 6; i++) this.blocks[i.toString()] = null;
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
    static getRooms(faculties) {
        var rooms = {};
        for (var f in faculties) {
            for (var m in faculties[f].majors) {
                for (var s in faculties[f].majors[m].semesters) {
                    var semester = faculties[f].majors[m].semesters[s]; 
                    for (var c in semester.courses) {
                        var course = semester.courses[c];
                        for (var d in course.dates) {
                            var date = course.dates[d];
                            var roomNames = splitRoomNames(date.location);
                            for (var r in roomNames) {
                                var roomName = roomNames[r];
                                var room = rooms[roomName] !== undefined ? rooms[roomName] : rooms[roomName] = new Room(roomName);
                                room.days[date.dayOfWeek].blocks[date.timeSlot] = new Block(date.timeSlot, date.professor, course.token, semester.token);
                            }
                        }
                    }
                }
            }
        }
        return rooms;
    }
}

module.exports = RoomProcessor;