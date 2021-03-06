var firstBy = require('thenby');
const Room = require("../model/room");
const Day = require("../model/day");
const Block = require("../model/block");

var ROOM_REGEX1 = /([A-Z])([0-9]+)\/([0-9]+)/; //B101/102
var ROOM_REGEX2 = /([A-Z])([0-9]+)\\([0-9]+)/; //B101\102
var ROOM_REGEX3 = /([A-Z])([0-9]+),([0-9]+)/; //B101,102
var ROOM_REGEX4 = /([A-Z])([0-9]+)\/([A-Z])([0-9]+)/; //B101/B102
var ROOM_REGEX5 = /([A-Z])([0-9]+)\\([A-Z])([0-9]+)/; //B101\B102
var ROOM_REGEX6 = /([A-Z])([0-9]+),([A-Z])([0-9]+)/; //B101,B102
var ROOM_REGEX7 = /([A-Z])-([0-9]+)/; //B-101

function splitRoomNamesByRegexes(name) {
    var match = ROOM_REGEX1.exec(name);
    if (match != null) return [match[1] + match[2], match[1] + match[3]];
    match = ROOM_REGEX2.exec(name);
    if (match != null) return [match[1] + match[2], match[1] + match[3]];
    match = ROOM_REGEX3.exec(name)
    if (match != null) return [match[1] + match[2], match[1] + match[3]];

    match = ROOM_REGEX4.exec(name);
    if (match != null) return [match[1] + match[2], match[3] + match[4]];
    match = ROOM_REGEX5.exec(name);
    if (match != null) return [match[1] + match[2], match[3] + match[4]];
    match = ROOM_REGEX6.exec(name);
    if (match != null) return [match[1] + match[2], match[3] + match[4]];

    match = ROOM_REGEX7.exec(name);
    if (match != null) return [match[1] + match[2]];

    return null;
}


class RoomProcessor {
    static splitRoomNames(name) {
        var newNames = [];
        name = name.trim();
        var arr = splitRoomNamesByRegexes(name);
        if (arr == null) {
            if (name.indexOf(',') !== -1) {
                arr = name.split(',');
            } else if (name.indexOf('/') !== -1) {
                arr = name.split('/');
            } else if (name.indexOf('\\') !== -1) {
                arr = name.split('\\');
            } else {
                newNames.push(name);
            }
        }
        if (arr != null) {
            for (var i = 0; i < arr.length; i++) newNames.push(arr[i].trim());
        } else {
            newNames = [name];
        }
        return newNames;
    }

    static populateRooms(hsma) {
        for (var f in hsma.faculties) {
            for (var m in hsma.faculties[f].majors) {
                for (var s in hsma.faculties[f].majors[m].semesters) {
                    var semester = hsma.faculties[f].majors[m].semesters[s]; 
                    for (var c in semester.courses) {
                        var course = semester.courses[c];
                        for (var d in course.dates) {
                            var date = course.dates[d];
                            //var roomNames = RoomProcessor.splitRoomNames(date.location);
                            //for (var r in roomNames) {
                            //    var roomName = roomNames[r];
                            for (var l in date.locations) {
                                var roomName = date.locations[l];
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