/**
 * Created by John Paul Welsh on 10/8/14.
 */

module TSOS {
    export class ProcessControlBlock {
        pid: number;
        pc: number;
        ir: number;
        accum: number;
        xreg: number;
        yreg: number;
        zflag: number;

        constructor() {
            this.pid   = _NextPID++;
            this.pc    = 0;
            this.ir    = 0;
            this.accum = 0;
            this.xreg  = 0;
            this.yreg  = 0;
            this.zflag = 0;
        }

        public printPCB(): void {
            _StdOut.putText("Process Control Block");
            _StdOut.advanceLine();
            _StdOut.putText("PID = " + this.pid);
            _StdOut.advanceLine();
            _StdOut.putText("PC = " + this.pc);
            _StdOut.advanceLine();
            _StdOut.putText("IR = " + this.ir);
            _StdOut.advanceLine();
            _StdOut.putText("Accum = " + this.accum);
            _StdOut.advanceLine();
            _StdOut.putText("X-Reg = " + this.xreg);
            _StdOut.advanceLine();
            _StdOut.putText("Y-Reg = " + this.yreg);
            _StdOut.advanceLine();
            _StdOut.putText("Z-Flag = " + this.zflag);
        }
    }
}
