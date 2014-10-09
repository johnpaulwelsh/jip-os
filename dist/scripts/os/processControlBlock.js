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
        return ProcessControlBlock;
    })();
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
