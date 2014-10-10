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
            debugger;
            for (var i = 0; i < this.memBlocks.length; i++) {
                this.memBlocks[i] = new Array(size);
                var currBlock = this.memBlocks[i];
                for (var j = 0; j < size; j++) {
                    currBlock[j] = "0";
                }
            }
        };

        Memory.prototype.getMemBlock = function (blockNum) {
            return this.memBlocks[blockNum];
        };

        Memory.prototype.clearMem = function () {
            this.initializeMemBlocks(this.memBlockSize);
        };

        Memory.prototype.isEmpty = function () {
            for (var i in this.memBlocks) {
                var currBlock = this.memBlocks[i];
                for (var j in currBlock) {
                    if (currBlock[j] != "0") {
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
