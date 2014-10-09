/**
 * Created by JP on 10/9/14.
 */

module TSOS {
    export class MemoryManager {

        baseRegister: number;

        constructor() {

        }

        public assignProgramToMemory(blockNum, code): void {
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

            var currBlock = _Memory[blockNum];
            for (var i in code) {
                currBlock[this.baseRegister + i] = code[i];
            }
        }
    }
}
