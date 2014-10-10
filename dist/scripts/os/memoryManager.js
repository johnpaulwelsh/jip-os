/**
* Created by JP on 10/9/14.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.fillMemoryWithProgram = function (blockNum, code) {
            for (var i = 0; i < code.length; i++) {
                this.updateMemoryAtLocation(blockNum, i, code[i]);
            }
        };

        MemoryManager.prototype.updateMemoryAtLocation = function (blockNum, loc, newCode) {
            debugger;
            var currBlock = _Memory.getMemBlock(blockNum);
            currBlock[loc] = newCode;
            TSOS.Control.updateMemTableAtLoc(Math.floor(loc / 8), loc % 8, newCode);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
