///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverKeyboard.ts
Requires deviceDriver.ts
The Kernel Keyboard Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };

        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";

            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);

                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }

                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57)) || (keyCode == 32) || (keyCode == 13)) {
                chr = String.fromCharCode(keyCode);

                // Symbols on number row... ! @ # $ % ^ & * ( )
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            chr = String.fromCharCode(41);
                            break;
                        case 49:
                            chr = String.fromCharCode(33);
                            break;
                        case 50:
                            chr = String.fromCharCode(64);
                            break;
                        case 51:
                            chr = String.fromCharCode(35);
                            break;
                        case 52:
                            chr = String.fromCharCode(36);
                            break;
                        case 53:
                            chr = String.fromCharCode(37);
                            break;
                        case 54:
                            chr = String.fromCharCode(94);
                            break;
                        case 55:
                            chr = String.fromCharCode(38);
                            break;
                        case 56:
                            chr = String.fromCharCode(42);
                            break;
                        case 57:
                            chr = String.fromCharCode(40);
                            break;
                    }
                }

                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 8) {
                // Take the most recently enqueued item out of the queue
                // Idea taken from Justin Beal on
                // http://stackoverflow.com/questions/4808852/remove-the-last-element-in-a-queue
                var tempQueue = new TSOS.Queue();

                var tempItem;
                while (!(_KernelInputQueue.isEmpty())) {
                    tempItem = _KernelInputQueue.dequeue();

                    _StdOut.putText(".");

                    if (!(_KernelInputQueue.isEmpty())) {
                        tempQueue.enqueue(tempItem);
                        _StdOut.putText("*");
                    }
                }

                _KernelInputQueue = tempQueue;
            }
            /*
            else { // Symbols elsewhere on keyboard... ; : ' " , . < > \ |
            
            if (!(isShifted)) {
            if (keyCode == 39                   ||
            (keyCode >= 44 && keyCode <= 47) ||
            keyCode == 58                   ||
            keyCode == 61                   ||
            (keyCode >= 91 && keyCode <= 93) ||
            keyCode == 96) {
            
            chr = String.fromCharCode(keyCode);
            }
            
            } else {
            switch (keyCode) {
            case 39:
            chr = String.fromCharCode(95);
            break;
            case 44:
            chr = String.fromCharCode(43);
            break;
            case 45:
            chr = String.fromCharCode(124);
            break;
            case 46:
            chr = String.fromCharCode(123);
            break;
            case 47:
            chr = String.fromCharCode(125);
            break;
            case 58:
            chr = String.fromCharCode(59);
            break;
            case 61:
            chr = String.fromCharCode(34);
            break;
            case 91:
            chr = String.fromCharCode(60);
            break;
            case 92:
            chr = String.fromCharCode(62);
            break;
            case 93:
            chr = String.fromCharCode(63);
            break;
            case 96:
            chr = String.fromCharCode(126);
            break;
            }
            }
            
            _KernelInputQueue.enqueue(chr);
            }
            */
        };
        return DeviceDriverKeyboard;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
