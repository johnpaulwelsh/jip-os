/**
* Created by John Paul Welsh on 10/8/14.
*/
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = (function () {
        function ProcessControlBlock() {
            this.PID = _PID++;
            this.PC = 0;
            this.Accum = 0;
            this.XReg = 0;
            this.YReg = 0;
            this.ZFlag = 0;
        }
        ProcessControlBlock.prototype.printPCB = function () {
            _StdOut.putText("Process Control Block");
            _StdOut.advanceLine();
            _StdOut.putText("PID = " + this.PID);
            _StdOut.advanceLine();
            _StdOut.putText("PC = " + this.PC);
            _StdOut.advanceLine();
            _StdOut.putText("Accum = " + this.Accum);
            _StdOut.advanceLine();
            _StdOut.putText("X-Reg = " + this.XReg);
            _StdOut.advanceLine();
            _StdOut.putText("Y-Reg = " + this.YReg);
            _StdOut.advanceLine();
            _StdOut.putText("Z-Flag = " + this.ZFlag);
        };
        return ProcessControlBlock;
    })();
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
