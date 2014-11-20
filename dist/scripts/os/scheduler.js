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
            //debugger;
            // If the Ready Queue has more than one PCB in it...
            var readyQueueSize = _ReadyQueue.getSize();

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
            // TODO: iProject 4
        };

        Scheduler.prototype.doPriorityCS = function () {
            // TODO: iProject 4
        };

        Scheduler.prototype.changeMode = function (newMode) {
            this.Mode = newMode;
        };

        Scheduler.prototype.changeQuantum = function (newQ) {
            this.Quantum = newQ;
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
            _ReadyQueue.peek().State = "Running";
            TSOS.Control.updateReadyQueueTable();
        };

        Scheduler.prototype.readyToCompleted = function () {
            var pcb = _ReadyQueue.dequeue();
            pcb.State = "Terminated";
            _CompletedQueue.enqueue(pcb);
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
