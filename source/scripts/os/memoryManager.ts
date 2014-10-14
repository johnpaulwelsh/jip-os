/**
 * Created by JP on 10/9/14.
 */

module TSOS {
    export class MemoryManager {

        baseRegister: number;
        limitRegister: number;

        constructor() {

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
            Control.updateMemTableAtLoc(Math.floor(loc / 8), loc % 8, newCodeHex);
        }
    }
}
