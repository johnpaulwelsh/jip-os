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
            if (_ReadyQueue.length > 1) {
                // If it isn't done executing yet...
                if (!_CurrPCB.isFinished) {
                    // Move current PCB to the back of the Ready queue.
                    var endingPCB = _ReadyQueue.dequeue();
                    endingPCB.State = "Waiting";
                    _ReadyQueue.enqueue(endingPCB);

                // ...if it is done, put it into the Completed Queue.
                } else {
                    this.readyToCompleted();
                }

                // Take new first PCB from Ready queue...
                var nextPCB = _ReadyQueue.peek();
                // and update the CPU components from the new PCB.
                _CurrPCB = nextPCB;
                _CurrBlockOfMem = nextPCB.MemBlock;
                nextPCB.State = "Running";

                _Kernel.krnTrace("Round Robin context switch: running program's PID = " + nextPCB.PID);

                // The break command from the previously-running command might have
                // stopped the CPU from executing, so we make it start again here.
                _CPU.isExecuting = true;

            }
            // otherwise, do nothing and let it keep running.

            // Reset the CPU cycle counter regardless of if a switch actually happened.
            this.CycleCount = 0;
        }

        public doFCFSCS(): void {
            // TODO: iProject 4
        }

        public doPriorityCS(): void {
            // TODO: iProject 4
        }

        public changeMode(newMode): void {
            this.Mode = newMode;
        }

        public changeQuantum(newQ): void {
            this.Quantum = newQ;
        }

        public residentToReady(PID): void {
            var pcb = _ResidentQueue.findAndRemovePCB(PID);
            pcb.State = "Ready";
            _ReadyQueue.enqueue(pcb);
            //pcb.State = "Running";
        }

        public residentToReadyAll(): void {
            for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                var pcb = _ResidentQueue.dequeue();
                pcb.State = "Ready";
                _ReadyQueue.enqueue(pcb);
            }
            _ReadyQueue.peek().State = "Running";
        }

        public readyToCompleted(): void {
            var pcb = _ReadyQueue.dequeue();
            pcb.State = "Terminated";
            _CompletedQueue.enqueue(pcb);
        }
    }
}