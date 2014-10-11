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
            for (var i = 0; i < this.memBlocks.length; i++) {
                this.memBlocks[i] = new Array(size);
                var currBlock = this.memBlocks[i];
                for (var j = 0; j < size; j++) {
                    currBlock[j] = "00";
                }
            }
        };

        Memory.prototype.getMemBlock = function (blockNum) {
            return this.memBlocks[blockNum];
        };

        Memory.prototype.clearMem = function () {
            this.initializeMemBlocks(this.memBlockSize);
            TSOS.Control.emptyFullMemTable(this.memBlocks.length);
        };

        Memory.prototype.isEmpty = function () {
            for (var i = 0; i < this.memBlocks.length; i++) {
                var currBlock = this.memBlocks[i];
                for (var j = 0; j < currBlock.length; j++) {
                    if (currBlock[j] != "00") {
                        return false;
                    }
                }
            }
            return true;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
