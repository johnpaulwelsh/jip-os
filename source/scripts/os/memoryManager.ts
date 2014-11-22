/**
 * Created by John Paul Welsh on 10/9/14.
 */

module TSOS {
    export class MemoryManager {

        baseRegister: number;
        limitRegister: number;
        nextFreeBlock: number;

        constructor() {
            this.nextFreeBlock = 0;

        }

        public fillMemoryWithProgram(blockNum, code): void {
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
        }

        public updateNextFreeBlock(newlyFreedBlock?): void {
            if (newlyFreedBlock !== undefined) {
                this.nextFreeBlock = newlyFreedBlock;
            } else {
                this.nextFreeBlock++;
                if (this.nextFreeBlock >= SEGMENT_COUNT) {
                    this.nextFreeBlock = -1;
                }
            }
        }

        public clearBlockOfMem(block): void {
            _Memory.clearBlock(block);
        }

        public getMemoryFromLocation(blockNum, loc): any {
            var memBeforeParse = _Memory.getMemBlock(blockNum)[loc];
            if (Utils.isNaNOverride(memBeforeParse)) {
                return memBeforeParse;
            } else {
                return parseInt(memBeforeParse);
            }
        }

        public updateMemoryAtLocation(blockNum, loc, newCode): void {
            var newCodeHex = Utils.decNumToHexStr(newCode);
            var currBlock = _Memory.getMemBlock(blockNum);
            if (newCodeHex.length < 2)
                newCodeHex = "0" + newCodeHex;
            currBlock[loc] = newCodeHex;
            Control.updateMemTableAtLoc(blockNum, Math.floor(loc / 8), loc % 8, newCodeHex);
        }
    }
}
