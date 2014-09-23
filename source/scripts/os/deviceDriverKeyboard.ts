///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";

            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {

                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);

            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                (keyCode == 32) ||   // space
                (keyCode == 13)) {                       // enter

                chr = String.fromCharCode(keyCode);

                // Symbols on number row...   ! @ # $ % ^ & * ( )
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
                            chr = "&";
                            break;
                        case 56:
                            chr = String.fromCharCode(42);
                            break;
                        case 57:
                            chr = "(";
                            break;
                    }
                }

                _KernelInputQueue.enqueue(chr);

            } else if (keyCode == 8 || keyCode == 9) { // Backspace and Tab

                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);

            } else if (keyCode == 38) { // Up arrow

                chr = "uparrow";
                _KernelInputQueue.enqueue(chr);

            } else if (keyCode == 40) { // Down arrow

                chr = "downarrow";
                _KernelInputQueue.enqueue(chr);


            } else { // Symbols elsewhere on keyboard...

                // fromCharCode ain't gonna cut it here, because web browsers were built by Satan.
                // These codes correspond to these symbols...      ; = , - . / ` [ \ ] '
                var realChar = "";

                switch (keyCode) {
                    case 186:
                        realChar = ";";
                        break;
                    case 187:
                        realChar = "=";
                        break;
                    case 188:
                        realChar = ",";
                        break;
                    case 189:
                        realChar = "-";
                        break;
                    case 190:
                        realChar = ".";
                        break;
                    case 191:
                        realChar = "/";
                        break;
                    case 192:
                        realChar = "`";
                        break;
                    case 219:
                        realChar = "[";
                        break;
                    case 220:
                        realChar = "\\";
                        break;
                    case 221:
                        realChar = "]";
                        break;
                    case 222:
                        realChar = "'";
                        break;
                }

                _KernelInputQueue.enqueue(realChar);
            }
        }
    }
}
