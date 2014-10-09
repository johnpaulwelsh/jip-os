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
            for (var i in this.memBlocks) {
                this.memBlocks[i] = new Array(size);
            }
        }

        public getMemBlock(blockNum): string[] {
            return this.memBlocks[blockNum];
        }

        public clearMem(): void {
            this.initializeMemBlocks(this.memBlockSize);
        }
    }
}
