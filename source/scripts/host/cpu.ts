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
            this.resetCPUElements(); // this is at the bottom of the file
        }

        public cycle(): void {
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

                default:
                    var numCommand = Utils.hexStrToDecNum(command);
                    var params = new Array(numCommand, 0);
                    _KernelInterruptQueue.enqueue(new Interrupt(PROG_INVALID_OPCODE_IRQ, params));
                    break;
            }

            this.updateCPUElements();

            // Increment the program counter when the program is still executing...
            if (this.isExecuting) {
                //// ...and the command isn't a branch...
                //if (command !== "D0") {
                //    this.PC++;
                //// ... or it's a failed branch...
                //} else if (command === "D0" && this.Zflag !== 0) {
                //    this.PC++;
                //}
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
            _Kernel.krnTrace("load const into acc");
            this.Acc = this.getNextByte();
            this.PC += 1;

        }

        // Load accumulator from memory
        private loadAccFromMem(): void {
            _Kernel.krnTrace("load acc from mem");
            var location = this.getNextTwoBytesAndCombine();
            this.Acc = parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
            this.PC += 2;
        }

        // Store accumulator into memory
        private storeAccIntoMem(): void {
            _Kernel.krnTrace("store acc into mem");
            var location = this.getNextTwoBytesAndCombine();
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, this.Acc);
            this.PC += 2;
        }

        // Add contents of memory location to accumulator, store into accumulator
        private addAndStoreIntoAcc(): void {
            _Kernel.krnTrace("add and store into mem");
            var location = this.getNextTwoBytesAndCombine();
            this.Acc += parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
            this.PC += 2;
        }

        // Load constant into x-reg
        private loadConstIntoX(): void {
            _Kernel.krnTrace("load const into x");
            this.Xreg = this.getNextByte();
            this.PC += 1;
        }

        // Load x-reg from memory
        private loadXFromMem(): void {
            _Kernel.krnTrace("load x from mem");
            var location = this.getNextTwoBytesAndCombine();
            this.Xreg = parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
            this.PC += 2;
        }

        // Load constant into y-reg
        private loadConstIntoY(): void {
            _Kernel.krnTrace("load const into y");
            this.Yreg = this.getNextByte();
            this.PC += 1;
        }

        // Load y-reg from memory
        private loadYFromMem(): void {
            _Kernel.krnTrace("load y from mem");
            var location = this.getNextTwoBytesAndCombine();
            this.Yreg = parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
            this.PC += 2;
        }

        // This isn't the instruction you're looking for
        private noOp(): void {
            _Kernel.krnTrace("no-op");
            // http://bit.ly/ZUMW3z
        }

        // Break (system call)
        private breakCall(): void {
            _Kernel.krnTrace("break");
            this.isExecuting = false;
            this.finishRunningProgram();
        }

        // Compare contents of memory to x-reg
        // Set z-flag to 1 if equal
        private compareToX(): void {
            _Kernel.krnTrace("compare to");
            var location = this.getNextTwoBytesAndCombine();
            var memValue = parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
            this.Zflag = (memValue === this.Xreg) ? 1 : 0;
            this.PC += 2;
        }

        // If z-flag is 0, branch forward the number of bytes represented by the next byte's hex value
        private branchNotEqual(): void {
            _Kernel.krnTrace("branch not equal");
            if (this.Zflag === 0) {
                var branchSpan = this.getNextByte();
                // Move past the byte that told us our jump amount. (But not too far, since we're gonna
                // PC++ at the end of every command.)
                this.PC += 1;
                // Then branch.
                this.PC = this.PC + branchSpan;
                if (this.PC >= 256) {
                    this.PC = this.PC - 256;
                }
            } else {
                // Skip over the next byte.
                this.PC++;
            }
        }

        // Increment the next value by one
        private increment(): void {
            _Kernel.krnTrace("increment");
            var location = this.getNextTwoBytesAndCombine();
            var value = 1 + parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, value);
            this.PC += 2;
        }

        // System call:
        // If x-reg has a 1, print y-reg value
        // If x-reg has a 2, print string that begins at the mem location in y-reg (it's null-term'd)
        private sysCall(): void {
            _Kernel.krnTrace("system call");
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
        // print the PCB, and reset the two globals that specified which program was running
        // and which block of memory it was in.
        public finishRunningProgram(): void {
            _StdOut.advanceLine();
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
