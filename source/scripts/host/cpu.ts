///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            // This will only execute when isExecuting is true, so don't worry about that variable until
            // we reach the final command of the code.

            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.

            var command = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC];

            switch (command) {
                case "A9":
                    this.loadConstIntoAcc();
                    break;

                case "AD":
                    this.loadAccFromMem();
                    break;

                case "8D":
                    this.storeAccIntoMem();
                    break;

                case "6D":
                    this.addAndStoreIntoAcc();
                    break;

                case "A2":
                    this.loadConstIntoX();
                    break;

                case "AE":
                    this.loadXFromMem();
                    break;

                case "A0":
                    this.loadConstIntoY();
                    break;

                case "AC":
                    this.loadYFromMem();
                    break;

                case "EA":
                    this.noOp();
                    break;

                case "00":
                    this.breakCall();
                    break;

                case "EC":
                    this.compareToX();
                    break;

                case "D0":
                    this.branchNotEqual();
                    break;

                case "EE":
                    this.increment();
                    break;

                case "FF":
                    this.sysCall();
                    break;
            }

            // We don't want this to happen after we do an FF command
            if (this.isExecuting) {
                this.PC++;
            }

            this.updateCPUElements();
        }

        // load constant (next value) into accumulator
        private loadConstIntoAcc(): void {
            this.Acc = this.getNextByte();
            this.PC += 1;
        }

        // load accumulator from memory (from location denoted by next 2 values)
        private loadAccFromMem(): void {
            var location = this.calculateMemFromTwoBytes(this.getNextTwoBytes());
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, Utils.decStrToHexStr(this.Acc));
            this.PC += 2;
        }

        // store accumulator into memory (to location denoted by next 2 values)
        private storeAccIntoMem(): void {

            this.PC += 2;
        }

        // add contents of memory location (next 2 values) to accumulator, store there
        private addAndStoreIntoAcc(): void {

            this.PC += 2;
        }

        // load constant (next value) into x-reg
        private loadConstIntoX(): void {
            this.Xreg = this.getNextByte();
            this.PC += 1;
        }

        // load x-reg from memory (location denoted by next 2 values)
        private loadXFromMem(): void {

            this.PC += 2;
        }

        // load constant (next value) into y-reg
        private loadConstIntoY(): void {
            this.Yreg = this.getNextByte();
            this.PC += 1;
        }

        // load y-reg from memory (location denoted by next 2 values)
        private loadYFromMem(): void {

            this.PC += 2;
        }

        // This isn't the instruction you're looking for.
        private noOp(): void {

        }

        // break (system call)
        private breakCall(): void {
            this.isExecuting = false;
            this.finishRunningProgram();
        }

        // compare contents of memory (denoted by next 2 values) to x-reg
        // set z-flag to true if equal
        private compareToX(): void {

            this.PC += 2;
        }

        // branch x bytes if z-flag == 0 (x is next value)
        private branchNotEqual(): void {
            if (this.Zflag == 0) {
                var branchSpanDec = Utils.hexStrToDecStr(this.getNextByte());
                // Does the number represent a negative shift, or does it already force it to be a wrap-around
                // positive shift?
                //this.PC =
            }
        }

        // increment the next value by 1
        private increment(): void {
            var value = parseInt(Utils.hexStrToDecStr(this.getNextByte()));
            value++;
            // Put 'value' back into memory
            this.PC += 1;
        }

        // system call
        // if x-reg has a 1, print y-reg value
        // if x-reg has a 2, print string that's in y-reg (it's null-term'd)
        private sysCall(): void {

        }

        private getNextByte(): number {
            var currByte = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC + 1];
            return parseInt(currByte);
        }

        private getNextTwoBytes(): string[] {
            var bytes = [];
            // the additions to this.PC are because of little endian nonsense
            bytes[0] = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC + 2];
            bytes[1] = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC + 1];
            return bytes;
        }

        private calculateMemFromTwoBytes(bytes): number {
            var fullLocationDec = Utils.hexStrToDecStr(bytes[0] + bytes[1]);
            return parseInt(fullLocationDec);
        }

        public updateCPUElements(): void {
            TSOS.Control.setCPUElementByID("tdPC",    this.PC);
            TSOS.Control.setCPUElementByID("tdAccum", this.Acc);
            TSOS.Control.setCPUElementByID("tdXReg",  this.Xreg);
            TSOS.Control.setCPUElementByID("tdYReg",  this.Yreg);
            TSOS.Control.setCPUElementByID("tdZFlag", this.Zflag);
        }

        public finishRunningProgram(): void {
            _CurrPCB.PC = this.PC;
            _CurrPCB.Acc = this.Acc;
            _CurrPCB.Xreg = this.Xreg;
            _CurrPCB.YReg = this.Yreg;
            _CurrPCB.ZFlag = this.Zflag;
            _CurrPCB.printPCB();
            _RunningPID = -1;
        }
    }
}
