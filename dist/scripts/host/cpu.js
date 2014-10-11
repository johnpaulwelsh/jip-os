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
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
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
        };

        // load constant (next value) into accumulator
        Cpu.prototype.loadConstIntoAcc = function () {
            this.Acc = this.getNextByte();
            this.PC += 1;
        };

        // load accumulator from memory (from location denoted by next 2 values)
        Cpu.prototype.loadAccFromMem = function () {
            var location = this.calculateMemFromTwoBytes(this.getNextTwoBytes());
            _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, TSOS.Utils.decStrToHexStr(this.Acc));
            this.PC += 2;
        };

        // store accumulator into memory (to location denoted by next 2 values)
        Cpu.prototype.storeAccIntoMem = function () {
            this.PC += 2;
        };

        // add contents of memory location (next 2 values) to accumulator, store there
        Cpu.prototype.addAndStoreIntoAcc = function () {
            this.PC += 2;
        };

        // load constant (next value) into x-reg
        Cpu.prototype.loadConstIntoX = function () {
            this.Xreg = this.getNextByte();
            this.PC += 1;
        };

        // load x-reg from memory (location denoted by next 2 values)
        Cpu.prototype.loadXFromMem = function () {
            this.PC += 2;
        };

        // load constant (next value) into y-reg
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
                var branchSpanDec = TSOS.Utils.hexStrToDecStr(this.getNextByte());
                // Does the number represent a negative shift, or does it already force it to be a wrap-around
                // positive shift?
                //this.PC =
            }
        };

        // increment the next value by 1
        Cpu.prototype.increment = function () {
            var value = parseInt(TSOS.Utils.hexStrToDecStr(this.getNextByte()));
            value++;

            // Put 'value' back into memory
            this.PC += 1;
        };

        // system call
        // if x-reg has a 1, print y-reg value
        // if x-reg has a 2, print string that's in y-reg (it's null-term'd)
        Cpu.prototype.sysCall = function () {
        };

        Cpu.prototype.getNextByte = function () {
            var currByte = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC + 1];
            return parseInt(currByte);
        };

        Cpu.prototype.getNextTwoBytes = function () {
            var bytes = [];

            // the additions to this.PC are because of little endian nonsense
            bytes[0] = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC + 2];
            bytes[1] = _Memory.getMemBlock(_CurrBlockOfMem)[this.PC + 1];
            return bytes;
        };

        Cpu.prototype.calculateMemFromTwoBytes = function (bytes) {
            var fullLocationDec = TSOS.Utils.hexStrToDecStr(bytes[0] + bytes[1]);
            return parseInt(fullLocationDec);
        };

        Cpu.prototype.updateCPUElements = function () {
            TSOS.Control.setCPUElementByID("tdPC", this.PC);
            TSOS.Control.setCPUElementByID("tdAccum", this.Acc);
            TSOS.Control.setCPUElementByID("tdXReg", this.Xreg);
            TSOS.Control.setCPUElementByID("tdYReg", this.Yreg);
            TSOS.Control.setCPUElementByID("tdZFlag", this.Zflag);
        };

        Cpu.prototype.finishRunningProgram = function () {
            _CurrPCB.PC = this.PC;
            _CurrPCB.Acc = this.Acc;
            _CurrPCB.Xreg = this.Xreg;
            _CurrPCB.YReg = this.Yreg;
            _CurrPCB.ZFlag = this.Zflag;
            _CurrPCB.printPCB();
            _RunningPID = -1;
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
