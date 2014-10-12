/**
 * Created by John Paul Welsh on 10/8/14.
 */

module TSOS {
    export class ProcessControlBlock {
        PID: number;
        PC: number;
        Accum: number;
        Xreg: number;
        Yreg: number;
        Zflag: number;

        constructor() {
            this.PID   = _PID++;
            this.PC    = 0;
            this.Accum = 0;
            this.Xreg  = 0;
            this.Yreg  = 0;
            this.Zflag = 0;
        }

        public printPCB(): void {
            _StdOut.putText("Process Control Block");
            _StdOut.advanceLine();
            _StdOut.putText("PID = " + this.PID);
            _StdOut.advanceLine();
            _StdOut.putText("PC = " + this.PC);
            _StdOut.advanceLine();
            _StdOut.putText("Accum = " + this.Accum);
            _StdOut.advanceLine();
            _StdOut.putText("X-Reg = " + this.Xreg);
            _StdOut.advanceLine();
            _StdOut.putText("Y-Reg = " + this.Yreg);
            _StdOut.advanceLine();
            _StdOut.putText("Z-Flag = " + this.Zflag);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }
    }
}
