/**
* Created by John Paul Welsh on 11/14/14.
*/
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        // Use stuff in READY queue
        // Allow setting priority to things in the RESIDENT queue
        // Sets the initial mode (RR) and Round Robin quantum (6)
        function Scheduler(mode, quantum) {
            this.Mode = mode;
            this.Quantum = quantum;
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
            // move current PCB to back of Ready queue
            // Take new first PCB from Ready queue
            //update the CPU components from the new PCB
        };

        Scheduler.prototype.doFCFSCS = function () {
        };

        Scheduler.prototype.doPriorityCS = function () {
        };

        Scheduler.prototype.changeMode = function (newMode) {
            this.Mode = newMode;
        };

        Scheduler.prototype.changeQuantum = function (newQ) {
            this.Quantum = newQ;
        };

        Scheduler.prototype.residentToReady = function (PID) {
            var pcb = _ResidentQueue.findAndRemovePCB(PID);
            _ReadyQueue.enqueue(pcb);
        };

        Scheduler.prototype.residentToReadyAll = function () {
            for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                _ReadyQueue.enqueue(_ResidentQueue.dequeue());
            }
        };

        Scheduler.prototype.readyToCompleted = function () {
            var pcb = _ReadyQueue.dequeue();
            _CompletedQueue.enqueue(pcb);
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
