/**
* Created by John Paul Welsh on 11/14/14.
*/
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler(mode, quantum) {
            this.Mode = mode;
            this.Quantum = quantum;
            this.CycleCount = 0;
        }
        Scheduler.prototype.contextSwitch = function () {
            switch (this.Mode) {
                case ROUND_ROBIN:
                    this.doRoundRobinCS();
                    break;
                case FCFS:
                    this.doFCFSCS();
                    break;
                case PRIORITY:
                    this.doPriorityCS();
                    break;
            }
        };

        Scheduler.prototype.doRoundRobinCS = function () {
            // If the Ready Queue has more than one PCB in it...
            if (_ReadyQueue.getSize() > 1) {
                // If it isn't done executing yet...
                if (!_CurrPCB.isFinished) {
                    // Move current PCB to the back of the Ready queue.
                    var endingPCB = _ReadyQueue.dequeue();
                    endingPCB.State = "Ready";
                    _ReadyQueue.enqueue(endingPCB);
                    // ...if it is done, put it into the Completed Queue.
                } else {
                    this.readyToCompleted();
                }

                // Take new first PCB from Ready queue...
                _CurrPCB = _ReadyQueue.peek();

                // and update the CPU components from the new PCB.
                _CurrBlockOfMem = _CurrPCB.MemBlock;
                _CurrPCB.State = "Running";
                _CPU.updateCPUWithPCBContents();

                _Kernel.krnTrace("Round Robin context switch: running program's PID = " + _CurrPCB.PID);

                // The break command from the previously-running command might have
                // stopped the CPU from executing, so we make it start again here.
                _CPU.isExecuting = true;
            }

            // otherwise, do nothing and let it keep running.
            // Reset the CPU cycle counter regardless of if a switch actually happened.
            this.CycleCount = 0;
        };

        Scheduler.prototype.doFCFSCS = function () {
            // If the Ready Queue has more than one PCB in it...
            if (_ReadyQueue.getSize() > 1) {
                this.readyToCompleted();
                this.setUpNextPCBInOrder();
            }
            // otherwise, do nothing and let it all end.
        };

        Scheduler.prototype.doPriorityCS = function () {
            // If the Ready Queue has more than one PCB in it...
            if (_ReadyQueue.getSize() > 1) {
                this.readyToCompleted();
                this.setUpNextPCBPriority();
                _Kernel.krnTrace("Priority context switch: running program's PID = " + _CurrPCB.PID);
            }
        };

        Scheduler.prototype.setUpNextPCBInOrder = function () {
            // TODO: dingo
            _CurrPCB = _ReadyQueue.peek();
            _CurrBlockOfMem = _CurrPCB.MemBlock;
            _CurrPCB.State = "Running";
            _CPU.updateCPUWithPCBContents();
        };

        Scheduler.prototype.setUpNextPCBPriority = function () {
            _CurrPCB = _ReadyQueue.findLowestPriority();
            _CurrBlockOfMem = _CurrPCB.MemBlock;
            _CurrPCB.State = "Running";
            _CPU.updateCPUWithPCBContents();
        };

        Scheduler.prototype.changeMode = function (newMode) {
            this.Mode = newMode;
        };

        Scheduler.prototype.changeQuantum = function (newQ) {
            this.Quantum = newQ;
        };

        Scheduler.prototype.killProcess = function (pid) {
            // If the one getting killed is currently on the CPU, do a context switch first.
            if (_CurrPCB.PID == pid)
                this.contextSwitch();

            var killedProgram = _ReadyQueue.findAndRemovePCB(pid);

            if (killedProgram != undefined) {
                _CompletedQueue.enqueue(killedProgram);
                _StdOut.putText("PID " + killedProgram.PID + " killed. You monster.");

                if (_ReadyQueue.isEmpty()) {
                    _CPU.isExecuting = false;
                }

                TSOS.Control.updateReadyQueueTable();
            } else {
                _StdOut.putText("There is no running program with that PID.");
            }
        };

        Scheduler.prototype.printRunningProcesses = function () {
            var fullStr = "PIDs of running processes: ";

            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                fullStr += _ReadyQueue.q[i].PID;

                // Put commas (except for after the last one)
                if (i != _ReadyQueue.getSize() - 1) {
                    fullStr += ", ";
                }
            }

            _StdOut.putText(fullStr);
        };

        Scheduler.prototype.printMode = function () {
            switch (this.Mode) {
                case ROUND_ROBIN:
                    return "Round Robin";
                    break;
                case FCFS:
                    return "First Come, First Served";
                    break;
                case PRIORITY:
                    return "Priority";
                    break;
            }
        };

        Scheduler.prototype.residentToReady = function (PID) {
            var pcb = _ResidentQueue.findAndRemovePCB(PID);
            pcb.State = "Ready";
            _ReadyQueue.enqueue(pcb);
            TSOS.Control.updateReadyQueueTable();
            //pcb.State = "Running";
        };

        Scheduler.prototype.residentToReadyAll = function () {
            while (!_ResidentQueue.isEmpty()) {
                var pcb = _ResidentQueue.dequeue();
                pcb.State = "Ready";
                _ReadyQueue.enqueue(pcb);
            }
            TSOS.Control.updateReadyQueueTable();
        };

        Scheduler.prototype.readyToCompleted = function (priorityPCB) {
            var pcb = (priorityPCB != undefined) ? _ReadyQueue.findAndRemovePCB(priorityPCB.PID) : _ReadyQueue.dequeue();
            pcb.State = "Terminated";
            _CompletedQueue.enqueue(pcb);
            TSOS.Control.updateReadyQueueTable();
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
