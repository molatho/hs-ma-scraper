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

module.exports = Room;