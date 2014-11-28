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
        BaseReg: number;
        LimitReg: number;
        MemBlock: number;
        State: string;
        Priority: number;
        isFinished: boolean;

        constructor(mb, priority?) {
            this.PID      = _PID++;
            this.PC       = 0;
            this.Accum    = 0;
            this.Xreg     = 0;
            this.Yreg     = 0;
            this.Zflag    = 0;
            this.MemBlock = mb;
            this.BaseReg  = mb * 256;
            this.LimitReg = this.BaseReg + 255;
            this.Priority = (priority != undefined) ? priority : 0;
            this.State    = "New";
            this.isFinished = false;
        }

        public getMemBlock(): number {
            return this.MemBlock;
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
            _StdOut.putText("Base reg = " + this.BaseReg);
            _StdOut.advanceLine();
            _StdOut.putText("Limit reg = " + this.LimitReg);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }
    }
}
