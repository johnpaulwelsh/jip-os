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
            this.resetCPUElements(); // this is at the bottom of this file
        }

        public cycle(): void {
            // This will only execute when isExecuting is true, so don't worry about that variable until
            // we reach the final command of the code.

            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.

            var command = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC);

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

                case "00" || 0:
                    this.breakCall();
                    break;
            }

            this.updateCPUElements();

            // We don't want this to happen after we do an FF command
            if (this.isExecuting) {
                this.PC++;
            }
        }

        //
        // Utility functions for doing opcodes
        //

        // Gives back the value that's at the next position in memory as a decimal number.
        private getNextByte(): number {
            var nextByteAsHex = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 1);
            return Utils.hexStrToDecNum(nextByteAsHex);
        }


        // The values at the next two positions in memory, swapped and combined, is a memory location
        // represented in hex. This returns that location as a decimal number.
        private getNextTwoBytesAndCombine(): number {
            var byteOne = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 1);
            var byteTwo = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 2);
            return Utils.hexStrToDecNum(byteTwo + byteOne); // swapped b/c of little-endian-ness
        }

        //
        // Functions for each opcode
        //

        // Load constant into accumulator
        private loadConstIntoAcc(): void {
            this.Acc = this.getNextByte();
            this.PC += 1;
        }

        // Load accumulator from memory
        private loadAccFromMem(): void {
            var location = this.getNextTwoBytesAndCombine();
            this.Acc = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        }

        // Store accumulator into memory
        private storeAccIntoMem(): void {
            var location = this.getNextTwoBytesAndCombine();
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, this.Acc);
            this.PC += 2;
        }

        // Add contents of memory location to accumulator, store into accumulator
        private addAndStoreIntoAcc(): void {
            var location = this.getNextTwoBytesAndCombine();
            this.Acc += _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        }

        // Load constant into x-reg
        private loadConstIntoX(): void {
            this.Xreg = this.getNextByte();
            this.PC += 1;
        }

        // Load x-reg from memory
        private loadXFromMem(): void {
            var location = this.getNextTwoBytesAndCombine();
            this.Xreg = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        }

        // Load constant into y-reg
        private loadConstIntoY(): void {
            this.Yreg = this.getNextByte();
            this.PC += 1;
        }

        // Load y-reg from memory
        private loadYFromMem(): void {
            var location = this.getNextTwoBytesAndCombine();
            this.Yreg = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        }

        // This isn't the instruction you're looking for
        private noOp(): void {
            // http://bit.ly/ZUMW3z
        }

        // Break (system call)
        private breakCall(): void {
            this.isExecuting = false;
            this.finishRunningProgram();
        }

        // Compare contents of memory to x-reg
        // Set z-flag to 1 if equal (because they're not not-equal)
        private compareToX(): void {
            var location = this.getNextTwoBytesAndCombine();
            var memValue = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);

            this.Zflag = (memValue == this.Xreg) ? 1 : 0;
            this.PC += 2;
        }

        // Branch x bytes if z-flag == 0 (x is next value)
        private branchNotEqual(): void {
            if (this.Zflag == 0) {
                var branchSpan = this.getNextTwoBytesAndCombine();
                this.PC = 255 - branchSpan;
            }
        }

        // Increment the next value by one
        private increment(): void {
            var incrValue = 1 + this.getNextByte();
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, this.PC + 1, incrValue);
            this.PC += 1;
        }

        // System call:
        // If x-reg has a 1, print y-reg value
        // If x-reg has a 2, print string that begins at the mem location in y-reg (it's null-term'd)
        private sysCall(): void {
            var params = new Array(this.Xreg, this.Yreg);
            _KernelInterruptQueue.enqueue(new Interrupt(PROG_SYSCALL_IRQ, params));

        }

        //
        // Other functions to manipulate CPU data and miscellany tasks
        //

        public updateCPUElements(): void {
            TSOS.Control.setCPUElementByID("tdPC", this.PC);
            TSOS.Control.setCPUElementByID("tdAccum", this.Acc);
            TSOS.Control.setCPUElementByID("tdXReg", this.Xreg);
            TSOS.Control.setCPUElementByID("tdYReg", this.Yreg);
            TSOS.Control.setCPUElementByID("tdZFlag", this.Zflag);
        }

        public resetCPUElements(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        // Once we are done running a program, we save the CPU's registers into the PCB,
        // print the PCB, and reset the two globals that specified which program was running,
        // and which block of memory it was in.
        public finishRunningProgram(): void {
            _CurrPCB.PC = this.PC;
            _CurrPCB.Accum = this.Acc;
            _CurrPCB.Xreg = this.Xreg;
            _CurrPCB.Yreg = this.Yreg;
            _CurrPCB.Zflag = this.Zflag;
            _CurrPCB.printPCB();
            _RunningPID = -1;
            _CurrBlockOfMem = -1;
        }
    }
}
