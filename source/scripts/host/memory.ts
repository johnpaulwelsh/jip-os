/**
 * Created by JP on 10/8/14.
 */

module TSOS {
    export class Memory {

        memBlocks: string[][];
        memBlockSize: number;

        constructor(divisions: number, size: number) {
            this.memBlockSize = size;
            this.memBlocks = new Array(divisions);
            this.initializeMemBlocks(this.memBlockSize);
        }

        private initializeMemBlocks(size): void {
            debugger;
            for (var i = 0; i < this.memBlocks.length; i++) {
                this.memBlocks[i] = new Array(size);
                var currBlock = this.memBlocks[i];
                for (var j = 0; j < size; j++) {
                    currBlock[j] = "0";
                }
            }
        }

        public getMemBlock(blockNum): string[] {
            return this.memBlocks[blockNum];
        }

        public clearMem(): void {
            this.initializeMemBlocks(this.memBlockSize);
        }

        public isEmpty(): boolean {
            for (var i in this.memBlocks) {
                var currBlock = this.memBlocks[i];
                for (var j in currBlock) {
                    if (currBlock[j] != "0") {
                        return false;
                    }
                }
            }
            return true;
        }
    }
}
