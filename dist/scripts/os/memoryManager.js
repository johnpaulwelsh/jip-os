/**
* Created by John Paul Welsh on 10/9/14.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            this.nextFreeBlock = 0;
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

        MemoryManager.prototype.updateNextFreeBlock = function (newlyFreedBlock) {
            if (newlyFreedBlock !== undefined) {
                this.nextFreeBlock = newlyFreedBlock;
            } else {
                this.nextFreeBlock++;
                // This stuff was necessary when we only had three memory segments,
                // but now the file system extends our usable memory so we don't need
                // to enforce this anymore.
                //if (this.nextFreeBlock >= SEGMENT_COUNT) {
                //    this.nextFreeBlock = -1;
                //}
            }
        };

        MemoryManager.prototype.clearBlockOfMem = function (block) {
            _Memory.clearBlock(block);
        };

        MemoryManager.prototype.getMemoryFromLocation = function (blockNum, loc) {
            var memBeforeParse = _Memory.getMemBlock(blockNum)[loc];
            if (TSOS.Utils.isNaNOverride(memBeforeParse)) {
                return memBeforeParse;
            } else {
                return parseInt(memBeforeParse);
            }
        };

        MemoryManager.prototype.updateMemoryAtLocation = function (blockNum, loc, newCode) {
            var newCodeHex = TSOS.Utils.decNumToHexStr(newCode);
            var currBlock = _Memory.getMemBlock(blockNum);
            if (newCodeHex.length < 2)
                newCodeHex = "0" + newCodeHex;
            currBlock[loc] = newCodeHex;
            TSOS.Control.updateMemTableAtLoc(blockNum, Math.floor(loc / 8), loc % 8, newCodeHex);
        };

        MemoryManager.prototype.getProgCodeFromFS = function (fileName) {
            var tsbWithName = _FileSystem.getDirectoryWithName(fileName);
            if (tsbWithName != undefined) {
                var dataTSB = _FileSystem.getTSBBytes(tsbWithName);
                return _FileSystem.getDataBytesWithLinksKeepHex(dataTSB).replace(/~/g, "");
            } else {
                _StdOut.putText("This should never happen");
                return "god dammit";
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
