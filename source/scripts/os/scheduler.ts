/**
 * Created by John Paul Welsh on 11/14/14.
 */

module TSOS {
    export class Scheduler {
        Mode: number;
        Quantum: number;

        // Use stuff in READY queue

        // Allow setting priority to things in the RESIDENT queue

        // Sets the initial mode (RR) and Round Robin quantum (6)
        constructor(mode, quantum) {
            this.Mode = mode;
            this.Quantum = quantum;
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
            // move current PCB to back of Ready queue
            // Take new first PCB from Ready queue
            //update the CPU components from the new PCB
        }

        public doFCFSCS(): void {

        }

        public doPriorityCS(): void {

        }

        public changeMode(newMode): void {
            this.Mode = newMode;
        }

        public changeQuantum(newQ): void {
            this.Quantum = newQ;
        }

        public residentToReady(PID): void {
            var pcb = _ResidentQueue.findAndRemovePCB(PID);
            _ReadyQueue.enqueue(pcb);
        }

        public residentToReadyAll(): void {
            for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                _ReadyQueue.enqueue(_ResidentQueue.dequeue());
            }
        }

        public readyToCompleted(): void {
            var pcb = _ReadyQueue.dequeue();
            _CompletedQueue.enqueue(pcb);
        }
    }
}