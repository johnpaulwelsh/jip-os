/**
* Created by JP on 10/9/14.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.assignProgramToMemory = function (blockNum, code) {
            switch (blockNum) {
                case 0:
                    this.baseRegister = 0;
                    break;
                case 1:
                    this.baseRegister = 256;
                    break;
                case 2:
                    this.baseRegister = 512;
                    break;
            }

            // the following stays undefined... help
            var currBlock = _Memory.getMemBlock(blockNum);
            for (var i = 0; i < code.length; i++) {
                currBlock[this.baseRegister + i] = code[i];
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
