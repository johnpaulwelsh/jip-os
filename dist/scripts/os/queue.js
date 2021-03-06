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

        Queue.prototype.peek = function () {
            return this.q[0];
        };

        Queue.prototype.findLowestPriority = function () {
            var pri = 1000;

            for (var i = 0; i < this.q.length; i++) {
                var x = this.q[i].Priority;
                if (parseInt(this.q[i].Priority) < pri) {
                    pri = parseInt(this.q[i].Priority);
                }
            }

            for (var j = 0; j < this.q.length; j++) {
                if (parseInt(this.q[j].Priority) == pri) {
                    return this.q[j];
                }
            }

            // As a failsafe, just give back the first thing in the Ready Queue.
            return this.q[0];
        };

        Queue.prototype.findPCB = function (PID) {
            var idx = -1;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].PID == parseInt(PID))
                    idx = i;
            }

            if (idx !== -1)
                return this.q[idx];
            else
                return undefined;
        };

        Queue.prototype.findAndRemovePCB = function (PID) {
            var idx = -1;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].PID == parseInt(PID))
                    idx = i;
            }

            if (idx !== -1) {
                var listOfOne = this.q.splice(idx, 1);
                return listOfOne[0];
            } else
                return undefined;
        };

        Queue.prototype.toString = function () {
            var retVal = "";
            for (var i = 0; i < this.q.length; i++) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        };
        return Queue;
    })();
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
