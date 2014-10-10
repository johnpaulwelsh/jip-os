/**
* Created by John Paul Welsh on 10/8/14.
*/
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = (function () {
        function ProcessControlBlock() {
            this.pid = _NextPID++;
            this.pc = 0;
            this.ir = 0;
            this.accum = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
        }
        ProcessControlBlock.prototype.printPCB = function () {
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
        };
        return ProcessControlBlock;
    })();
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
