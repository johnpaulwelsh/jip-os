/**
* Created by JP on 10/9/14.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.fillMemoryWithProgram = function (blockNum, code) {
            switch (blockNum) {
                case 0:
                    this.baseRegister = 0;
                    this.limitRegister = 255;
                    break;
                case 1:
                    this.baseRegister = 256;
                    this.limitRegister = 511;
                    break;
                case 2:
                    this.baseRegister = 512;
                    this.limitRegister = 1023;
                    break;
            }

            for (var i = 0; i < code.length; i++) {
                this.updateMemoryAtLocation(blockNum, i, code[i]);
            }
        };

        MemoryManager.prototype.getMemoryFromLocation = function (blockNum, loc) {
            return _Memory.getMemBlock(blockNum)[loc];
        };

        MemoryManager.prototype.updateMemoryAtLocation = function (blockNum, loc, newCode) {
            var currBlock = _Memory.getMemBlock(blockNum);
            if (newCode.length < 2) {
                newCode = "0" + newCode;
            }
            currBlock[loc] = newCode;
            TSOS.Control.updateMemTableAtLoc(Math.floor(loc / 8), loc % 8, newCode);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
