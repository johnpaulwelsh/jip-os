/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {

    export class Queue {

        constructor(public q = []) {

        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty(){
            return (this.q.length == 0);
        }

        public enqueue(element) {
            this.q.push(element);
        }

        public dequeue(): any {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }

        public peek(): any {
            return this.q[0];
        }

        public findLowestPriority(): any {
            var pri = 1000;
            // Search for the lowest priority value.
            for (var i = 0; i < this.q.length; i++) {
                var x = this.q[i].Priority;
                if (parseInt(this.q[i].Priority) < pri) {
                    pri = parseInt(this.q[i].Priority);
                }
            }

            // Then search again to find the first one with that priority value.
            for (var j = 0; j < this.q.length; j++) {
                if (parseInt(this.q[j].Priority) == pri) {
                    return this.q[j];
                }
            }

            // As a failsafe, just give back the first thing in the Ready Queue.
            return this.q[0];
        }

        public findPCB(PID): any {
            var idx = -1;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].PID == parseInt(PID))
                    idx = i;
            }

            if (idx !== -1)
                return this.q[idx];
            else
                return undefined;
        }

        public findAndRemovePCB(PID): any {
            var idx = -1;
            for (var i = 0; i < this.q.length; i++) {
                if (this.q[i].PID == parseInt(PID))
                    idx = i;
            }

            if (idx !== -1) {
                var listOfOne = this.q.splice(idx, 1);
                return listOfOne[0];
            }
            else
                return undefined;
        }

        public toString() {
            var retVal = "";
            for (var i = 0; i < this.q.length; i++) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
    }
}
