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
                    var numCommand = TSOS.Utils.hexStrToDecNum(command);
                    var params = [numCommand, 0];
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROG_INVALID_OPCODE_IRQ, params));
                    break;
            }

            // Increment the program counter when the program is still executing,
            // and when we are switching to another program after one just completed.
            if (this.isExecuting && command != "00" && command != 0) {
                this.PC++;
            }

            // This could become nulled if we already moved the PCB to the Completed Queue.
            if (_CurrPCB != null) {
                this.updatePCBWithCurrentCPU();
            }

            TSOS.Control.updateReadyQueueTable();
            this.updateCPUElements();

            if (_Scheduler.Mode == ROUND_ROBIN) {
                _Scheduler.CycleCount++;
            }

            if (_CurrPCB != null) {
                // If we have run this program for the amount of cycles that the quantum tells us
                // (or the running program finishes early), schedule an interrupt for a context switch.
                if (_Scheduler.Mode == ROUND_ROBIN) {
                    if (_Scheduler.CycleCount >= _Scheduler.Quantum || _CurrPCB.isFinished) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, [0]));
                    }
                    // For the other two scheduling algorithms, just move on when a program completes.
                } else {
                    if (_CurrPCB.isFinished) {
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, [0]));
                    }
                }
            }
        };

        //
        // Utility functions for doing opcodes
        //
        // Gives back the value that's at the next position in memory as a decimal number.
        Cpu.prototype.getNextByte = function () {
            if (this.PC + 1 < SEGMENT_SIZE) {
                var nextByteAsHex = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 1);
                return TSOS.Utils.hexStrToDecNum(nextByteAsHex);
                // We have exceeded the bounds for our space in memory, so get outta here.
            } else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_VIOLATION_IRQ, [this.PC + 1]));
                return -1;
            }
        };

        // The values at the next two positions in memory, swapped and combined, is a memory location
        // represented in hex. This returns that location as a decimal number.
        Cpu.prototype.getNextTwoBytesAndCombine = function () {
            if (this.PC + 2 < SEGMENT_SIZE && this.PC >= 0) {
                var byteOne = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 1);
                var byteTwo = _MemMan.getMemoryFromLocation(_CurrBlockOfMem, this.PC + 2);
                var combined = TSOS.Utils.hexStrToDecNum(byteTwo + byteOne);

                if (combined < SEGMENT_SIZE && combined >= 0) {
                    return combined;
                    // We have exceeded the bounds for our space in memory, so get outta here.
                } else {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_VIOLATION_IRQ, [combined]));
                    return -1;
                }
                // We have exceeded the bounds for our space in memory, so get outta here.
            } else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_VIOLATION_IRQ, [this.PC + 2]));
                return -1;
            }
        };

        //
        // Functions for each opcode
        //
        // Load constant into accumulator
        Cpu.prototype.loadConstIntoAcc = function () {
            _Kernel.krnTrace("load const into acc");
            this.Acc = this.getNextByte();
            this.PC += 1;
        };

        // Load accumulator from memory
        Cpu.prototype.loadAccFromMem = function () {
            _Kernel.krnTrace("load acc from mem");
            var location = this.getNextTwoBytesAndCombine();

            if (location != -1) {
                this.Acc = TSOS.Utils.hexStrToDecNum(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
                this.PC += 2;
            }
        };

        // Store accumulator into memory
        Cpu.prototype.storeAccIntoMem = function () {
            _Kernel.krnTrace("store acc into mem");
            var location = this.getNextTwoBytesAndCombine();

            if (location != -1) {
                _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, TSOS.Utils.decNumToHexStr(this.Acc));
                this.PC += 2;
            }
        };

        // Add contents of memory location to accumulator, store into accumulator
        Cpu.prototype.addAndStoreIntoAcc = function () {
            _Kernel.krnTrace("add and store into mem");
            var location = this.getNextTwoBytesAndCombine();

            if (location != -1) {
                this.Acc += parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
                this.PC += 2;
            }
        };

        // Load constant into x-reg
        Cpu.prototype.loadConstIntoX = function () {
            _Kernel.krnTrace("load const into x");
            this.Xreg = this.getNextByte();
            this.PC += 1;
        };

        // Load x-reg from memory
        Cpu.prototype.loadXFromMem = function () {
            _Kernel.krnTrace("load x from mem");
            var location = this.getNextTwoBytesAndCombine();

            if (location != -1) {
                this.Xreg = TSOS.Utils.hexStrToDecNum(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
                this.PC += 2;
            }
        };

        // Load constant into y-reg
        Cpu.prototype.loadConstIntoY = function () {
            _Kernel.krnTrace("load const into y");
            this.Yreg = this.getNextByte();
            this.PC += 1;
        };

        // Load y-reg from memory
        Cpu.prototype.loadYFromMem = function () {
            _Kernel.krnTrace("load y from mem");
            var location = this.getNextTwoBytesAndCombine();

            if (location != -1) {
                this.Yreg = TSOS.Utils.hexStrToDecNum(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
                this.PC += 2;
            }
        };

        // This isn't the instruction you're looking for
        Cpu.prototype.noOp = function () {
            _Kernel.krnTrace("no-op");
            // http://bit.ly/ZUMW3z
        };

        // Break (system call)
        Cpu.prototype.breakCall = function () {
            _Kernel.krnTrace("break");
            _CurrPCB.State = "Terminated";
            _CurrPCB.isFinished = true;
            this.finishRunningProgram();
        };

        // Compare contents of memory to x-reg
        // Set z-flag to 1 if equal
        Cpu.prototype.compareToX = function () {
            _Kernel.krnTrace("compare to");
            var location = this.getNextTwoBytesAndCombine();

            if (location != -1) {
                var memValue = parseInt(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
                this.Zflag = (memValue === this.Xreg) ? 1 : 0;
                this.PC += 2;
            }
        };

        // If z-flag is 0, branch forward the number of bytes represented by the next byte's hex value
        Cpu.prototype.branchNotEqual = function () {
            _Kernel.krnTrace("branch not equal");
            if (this.Zflag === 0) {
                var branchSpan = this.getNextByte();

                // Move past the byte that told us our jump amount. (But not too far, since we're gonna
                // PC++ at the end of every command.)
                this.PC += 1;

                // Then branch.
                this.PC = this.PC + branchSpan;

                if (this.PC >= SEGMENT_SIZE) {
                    this.PC = this.PC - SEGMENT_SIZE;
                }

                if (this.PC >= SEGMENT_SIZE) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_VIOLATION_IRQ, [this.PC]));
                }
            } else {
                // Skip over the next byte.
                this.PC++;
            }
        };

        // Increment the next value by one
        Cpu.prototype.increment = function () {
            _Kernel.krnTrace("increment");
            var location = this.getNextTwoBytesAndCombine();

            if (location != -1) {
                var value = 1 + TSOS.Utils.hexStrToDecNum(_MemMan.getMemoryFromLocation(_CurrBlockOfMem, location));
                _MemMan.updateMemoryAtLocation(_CurrBlockOfMem, location, value);
                this.PC += 2;
            }
        };

        // System call:
        // If x-reg has a 1, print y-reg value
        // If x-reg has a 2, print string that begins at the mem location in y-reg (it's null-term'd)
        Cpu.prototype.sysCall = function () {
            _Kernel.krnTrace("system call");
            var params = [this.Xreg, this.Yreg];
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

        Cpu.prototype.updatePCBWithCurrentCPU = function () {
            _CurrPCB.PC = this.PC;
            _CurrPCB.Accum = this.Acc;
            _CurrPCB.Xreg = this.Xreg;
            _CurrPCB.Yreg = this.Yreg;
            _CurrPCB.Zflag = this.Zflag;
        };

        Cpu.prototype.updateCPUWithPCBContents = function () {
            this.PC = _CurrPCB.PC;
            this.Acc = _CurrPCB.Accum;
            this.Xreg = _CurrPCB.Xreg;
            this.Yreg = _CurrPCB.Yreg;
            this.Zflag = _CurrPCB.Zflag;
        };

        // Once we are done running a program, we save the CPU's registers into the PCB,
        // print the PCB, and do one of two things:
        // either set the current memory block and PCB to the next one in the Ready Queue,
        // or reset these variables if the queue is empty.
        Cpu.prototype.finishRunningProgram = function () {
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            this.updatePCBWithCurrentCPU();

            //_CurrPCB.printPCB();
            if (_Scheduler.Mode == PRIORITY) {
                _Scheduler.readyToCompleted(_CurrPCB);
            } else {
                _Scheduler.readyToCompleted();
            }

            // Free up this space in memory because the current program
            // is done running, so we can load into that spot now.
            _MemMan.updateNextFreeBlock(_CurrBlockOfMem);

            if (!_ReadyQueue.isEmpty()) {
                _CurrPCB = (_Scheduler.Mode == PRIORITY) ? _ReadyQueue.findLowestPriority() : _ReadyQueue.peek();
                _CurrBlockOfMem = _CurrPCB.MemBlock;
                _CurrPCB.State = "Running";
                this.updateCPUWithPCBContents();
                _Scheduler.CycleCount = 0;
            } else {
                _CurrPCB = null;
                _CurrBlockOfMem = -1;
                this.isExecuting = false;
            }
        };

        // Handles the interrupt caused by a memory-out-of-bounds error.
        // This will completely halt the programs from running, but will not
        // empty out the queues.
        Cpu.prototype.handleMemoryViolation = function (params) {
            this.finishRunningProgram();
            this.isExecuting = false;
            _Kernel.krnTrace("Invalid Memory Access: location = " + params[0]);
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
