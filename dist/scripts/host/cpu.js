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
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.resetCPUElements(); // this is at the bottom of the file
        };

        Cpu.prototype.cycle = function () {
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
        };

        //
        // Utility functions for doing opcodes
        //
        // Gives back the value that's at the next position in memory as a decimal number.
        Cpu.prototype.getNextByte = function () {
            var nextByteAsHex = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 1);
            return TSOS.Utils.hexStrToDecNum(nextByteAsHex);
        };

        // The values at the next two positions in memory, swapped and combined, is a memory location
        // represented in hex. This returns that location as a decimal number.
        Cpu.prototype.getNextTwoBytesAndCombine = function () {
            var byteOne = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 1);
            var byteTwo = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 2);
            return TSOS.Utils.hexStrToDecNum(byteTwo + byteOne);
        };

        //
        // Functions for each opcode
        //
        // Load constant into accumulator
        Cpu.prototype.loadConstIntoAcc = function () {
            this.Acc = this.getNextByte();
            this.PC += 1;
        };

        // Load accumulator from memory
        Cpu.prototype.loadAccFromMem = function () {
            var location = this.getNextTwoBytesAndCombine();
            this.Acc = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        };

        // Store accumulator into memory
        Cpu.prototype.storeAccIntoMem = function () {
            var location = this.getNextTwoBytesAndCombine();
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, this.Acc);
            this.PC += 2;
        };

        // Add contents of memory location to accumulator, store into accumulator
        Cpu.prototype.addAndStoreIntoAcc = function () {
            var location = this.getNextTwoBytesAndCombine();
            this.Acc += _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        };

        // Load constant into x-reg
        Cpu.prototype.loadConstIntoX = function () {
            this.Xreg = this.getNextByte();
            this.PC += 1;
        };

        // Load x-reg from memory
        Cpu.prototype.loadXFromMem = function () {
            var location = this.getNextTwoBytesAndCombine();
            this.Xreg = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        };

        // Load constant into y-reg
        Cpu.prototype.loadConstIntoY = function () {
            this.Yreg = this.getNextByte();
            this.PC += 1;
        };

        // Load y-reg from memory
        Cpu.prototype.loadYFromMem = function () {
            var location = this.getNextTwoBytesAndCombine();
            this.Yreg = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        };

        // This isn't the instruction you're looking for
        Cpu.prototype.noOp = function () {
            // http://bit.ly/ZUMW3z
        };

        // Break (system call)
        Cpu.prototype.breakCall = function () {
            this.isExecuting = false;
            this.finishRunningProgram();
        };

        // Compare contents of memory to x-reg
        // Set z-flag to 1 if equal
        Cpu.prototype.compareToX = function () {
            var location = this.getNextTwoBytesAndCombine();
            var memValue = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.Zflag = (memValue == this.Xreg) ? 1 : 0;
            this.PC += 2;
        };

        // If z-flag is 0, branch forward the number of bytes represented by the next byte's hex value
        Cpu.prototype.branchNotEqual = function () {
            if (this.Zflag == 0) {
                var branchSpan = this.getNextByte();
                this.PC = (this.PC + branchSpan) % 255;
            } else {
                // If the z-flag was 1, then we fall into the next command. But we need to skip over
                // the byte that represented how far we would branch if we had to, so we do another
                // incrementation of the PC.
                this.PC++;
            }
        };

        // Increment the next value by one
        Cpu.prototype.increment = function () {
            var location = this.getNextTwoBytesAndCombine();
            var value = 1 + _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, value);
            this.PC += 2;
        };

        // System call:
        // If x-reg has a 1, print y-reg value
        // If x-reg has a 2, print string that begins at the mem location in y-reg (it's null-term'd)
        Cpu.prototype.sysCall = function () {
            var params = new Array(this.Xreg, this.Yreg);
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROG_SYSCALL_IRQ, params));
        };

        //
        // Other functions to manipulate CPU data and miscellany tasks
        //
        Cpu.prototype.updateCPUElements = function () {
            TSOS.Control.setCPUElementByID("tdPC", this.PC);
            TSOS.Control.setCPUElementByID("tdAccum", this.Acc);
            TSOS.Control.setCPUElementByID("tdXReg", this.Xreg);
            TSOS.Control.setCPUElementByID("tdYReg", this.Yreg);
            TSOS.Control.setCPUElementByID("tdZFlag", this.Zflag);
        };

        Cpu.prototype.resetCPUElements = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        // Once we are done running a program, we save the CPU's registers into the PCB,
        // print the PCB, and reset the two globals that specified which program was running
        // and which block of memory it was in.
        Cpu.prototype.finishRunningProgram = function () {
            _CurrPCB.PC = this.PC;
            _CurrPCB.Accum = this.Acc;
            _CurrPCB.Xreg = this.Xreg;
            _CurrPCB.Yreg = this.Yreg;
            _CurrPCB.Zflag = this.Zflag;
            _CurrPCB.printPCB();
            _RunningPID = -1;
            _CurrBlockOfMem = -1;
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
