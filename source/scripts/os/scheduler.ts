/**
 * Created by John Paul Welsh on 11/14/14.
 */

module TSOS {

    export class Scheduler {

        Mode: number;
        Quantum: number;
        CycleCount: number;

        constructor(mode, quantum) {
            this.Mode = mode;
            this.Quantum = quantum;
            this.CycleCount = 0;
        }

        public contextSwitch(): void {
            debugger;
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
        }

        public doRoundRobinCS(): void {

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
        }

        public doFCFSCS(): void {
            // If the Ready Queue has more than one PCB in it...
            if (_ReadyQueue.getSize() > 1) {
                this.readyToCompleted();
                this.setUpNextPCBInOrder();

            }
            // otherwise, do nothing and let it all end.
        }

        public doPriorityCS(): void {
            // If the Ready Queue has more than one PCB in it...
            if (_ReadyQueue.getSize() > 1) {
                this.readyToCompleted();
                this.setUpNextPCBPriority();
                _Kernel.krnTrace("Priority context switch: running program's PID = " + _CurrPCB.PID);
            }
        }

        private setUpNextPCBInOrder(): void {
            _CurrPCB = _ReadyQueue.peek();
            _CurrBlockOfMem = _CurrPCB.MemBlock;
            _CurrPCB.State = "Running";
            _CPU.updateCPUWithPCBContents();
        }

        private setUpNextPCBPriority(): void {
            _CurrPCB = _ReadyQueue.findLowestPriority();
            _CurrBlockOfMem = _CurrPCB.MemBlock;
            _CurrPCB.State = "Running";
            _CPU.updateCPUWithPCBContents();
        }

        public changeMode(newMode): void {
            this.Mode = newMode;
        }

        public changeQuantum(newQ): void {
            this.Quantum = newQ;
        }

        public killProcess(pid): void {

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

                Control.updateReadyQueueTable();

            } else {
                _StdOut.putText("There is no running program with that PID.");
            }
        }

        public printRunningProcesses(): void {
            var fullStr = "PIDs of running processes: ";

            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                fullStr += _ReadyQueue.q[i].PID;
                // Put commas (except for after the last one)
                if (i != _ReadyQueue.getSize()-1) {
                    fullStr += ", ";
                }
            }

            _StdOut.putText(fullStr);
        }

        public printMode(): string {
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
        }

        public residentToReady(PID): void {
            var pcb = _ResidentQueue.findAndRemovePCB(PID);
            pcb.State = "Ready";
            _ReadyQueue.enqueue(pcb);
            Control.updateReadyQueueTable();
            //pcb.State = "Running";
        }

        public residentToReadyAll(): void {
            while (!_ResidentQueue.isEmpty()) {
                var pcb = _ResidentQueue.dequeue();
                pcb.State = "Ready";
                _ReadyQueue.enqueue(pcb);
            }
            Control.updateReadyQueueTable();
        }

        public readyToCompleted(priorityPCB?): void {
            var pcb = (priorityPCB != undefined) ? _ReadyQueue.findAndRemovePCB(priorityPCB.PID)
                                                 : _ReadyQueue.dequeue();
            pcb.State = "Terminated";
            _CompletedQueue.enqueue(pcb);
            Control.updateReadyQueueTable();
        }
    }
}