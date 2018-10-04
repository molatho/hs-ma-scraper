var firstBy = require('thenby');

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

module.exports = Day;