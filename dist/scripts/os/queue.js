/* ------------
Queue.ts
A simple Queue, which is really just a dressed-up JavaScript Array.
See the Javascript Array documentation at
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
Look at the push and shift methods, as they are the least obvious here.
------------ */
var TSOS;
(function (TSOS) {
    var Queue = (function () {
        function Queue(q) {
            if (typeof q === "undefined") { q = []; }
            this.q = q;
        }
        Queue.prototype.getSize = function () {
            return this.q.length;
        };

        Queue.prototype.isEmpty = function () {
            return (this.q.length == 0);
        };

        Queue.prototype.enqueue = function (element) {
            this.q.push(element);
        };

        Queue.prototype.dequeue = function () {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        };

        Queue.prototype.findPCB = function (PID) {
            var idx = -1;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].PID === PID)
                    idx = i;
            }

            if (idx !== -1)
                return this.q[idx];
            else
                return null;
        };

        Queue.prototype.findAndRemovePCB = function (PID) {
            var idx = -1;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].PID === PID)
                    idx = i;
            }

            if (idx !== -1)
                return this.q.splice(idx, 1);
            else
                return null;
        };

        Queue.prototype.toString = function () {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        };
        return Queue;
    })();
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
