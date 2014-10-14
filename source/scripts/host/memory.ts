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
            for (var i = 0; i < this.memBlocks.length; i++) {
                this.memBlocks[i] = new Array(size);
                var currBlock = this.memBlocks[i];
                for (var j = 0; j < size; j++) {
                    currBlock[j] = "00";
                }
            }
        }

        public getMemBlock(blockNum): string[] {
            return this.memBlocks[blockNum];
        }

        public clearMem(): void {
            this.initializeMemBlocks(this.memBlockSize);
            Control.emptyFullMemTable(this.memBlocks.length);
        }

        public isEmpty(): boolean {
            for (var i = 0; i < this.memBlocks.length; i++) {
                var currBlock = this.memBlocks[i];
                for (var j = 0; j < currBlock.length; j++) {
                    if (currBlock[j] != "00") {
                        return false;
                    }
                }
            }
            return true;
        }
    }
}
