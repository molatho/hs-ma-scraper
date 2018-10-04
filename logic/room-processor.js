var firstBy = require('thenby');
const Room = require("../model/room");
const Day = require("../model/day");
const Block = require("../model/block");

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