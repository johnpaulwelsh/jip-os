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
    }
}
