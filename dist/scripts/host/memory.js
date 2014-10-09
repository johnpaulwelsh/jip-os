/**
* Created by JP on 10/8/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(divisions, size) {
            this.memBlockSize = size;
            this.memBlocks = new Array(divisions);
            this.initializeMemBlocks(this.memBlockSize);
        }
        Memory.prototype.initializeMemBlocks = function (size) {
            for (var i in this.memBlocks) {
                this.memBlocks[i] = new Array(size);
            }
        };

        Memory.prototype.getMemBlock = function (blockNum) {
            return this.memBlocks[blockNum];
        };

        Memory.prototype.clearMem = function () {
            this.initializeMemBlocks(this.memBlockSize);
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
