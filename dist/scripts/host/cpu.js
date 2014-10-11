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
            this.resetCPUElements(); // this is at the bottom of this file
        };

        Cpu.prototype.cycle = function () {
            // This will only execute when isExecuting is true, so don't worry about that variable until
            // we reach the final command of the code.
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            var command = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC];
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
        // load constant (next value) into accumulator
        Cpu.prototype.loadConstIntoAcc = function () {
            this.Acc = this.getNextByte();
            this.PC += 1;
        };

        // load accumulator from memory (from location denoted by next 2 values)
        Cpu.prototype.loadAccFromMem = function () {
            var location = this.getNextTwoBytesAndCombine();
            this.Acc = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, location);
            this.PC += 2;
        };

        // Store accumulator into memory (to location denoted by next 2 values)
        Cpu.prototype.storeAccIntoMem = function () {
            var location = this.getNextTwoBytesAndCombine();
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, this.Acc.toString());
            this.PC += 2;
        };

        // Add contents of memory location (next 2 values) to accumulator, store back in accumulator
        Cpu.prototype.addAndStoreIntoAcc = function () {
            this.PC += 2;
        };

        // Load constant (next value) into x-reg
        Cpu.prototype.loadConstIntoX = function () {
            this.Xreg = this.getNextByte();
            this.PC += 1;
        };

        // Load x-reg from memory (location denoted by next 2 values)
        Cpu.prototype.loadXFromMem = function () {
            this.PC += 2;
        };

        // Load constant (next value) into y-register
        Cpu.prototype.loadConstIntoY = function () {
            this.Yreg = this.getNextByte();
            this.PC += 1;
        };

        // load y-reg from memory (location denoted by next 2 values)
        Cpu.prototype.loadYFromMem = function () {
            this.PC += 2;
        };

        // This isn't the instruction you're looking for.
        Cpu.prototype.noOp = function () {
        };

        // break (system call)
        Cpu.prototype.breakCall = function () {
            this.isExecuting = false;
            this.finishRunningProgram();
        };

        // compare contents of memory (denoted by next 2 values) to x-reg
        // set z-flag to true if equal
        Cpu.prototype.compareToX = function () {
            this.PC += 2;
        };

        // branch x bytes if z-flag == 0 (x is next value)
        Cpu.prototype.branchNotEqual = function () {
            if (this.Zflag == 0) {
                //var branchSpanDec = Utils.hexStrToDecStr(this.getNextByte());
                // Does the number represent a negative shift, or does it already force it to be a wrap-around
                // positive shift?
                //this.PC =
            }
        };

        // increment the next value by 1
        Cpu.prototype.increment = function () {
            // Put 'value' back into memory
            this.PC += 1;
        };

        // system call
        // if x-reg has a 1, print y-reg value
        // if x-reg has a 2, print string that's in y-reg (it's null-term'd)
        Cpu.prototype.sysCall = function () {
        };

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
        // print the PCB, and reset the two globals that specified which program was running,
        // and which block of memory it was in.
        Cpu.prototype.finishRunningProgram = function () {
            _CurrPCB.PC = this.PC;
            _CurrPCB.Accum = this.Acc;
            _CurrPCB.Xreg = this.Xreg;
            _CurrPCB.YReg = this.Yreg;
            _CurrPCB.ZFlag = this.Zflag;
            _CurrPCB.printPCB();
            _RunningPID = -1;
            _CurrBlockOfMem = -1;
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
