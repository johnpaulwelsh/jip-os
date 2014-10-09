///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private clearScreenBSOD(): void {
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private clearLine(): void {
            _DrawingContext.fillRect(0,
                                     this.currentYPosition - this.currentFontSize,
                                     _Canvas.width,
                                     this.currentFontSize + 6);
            // the +6 above (and in clearCharacter) is to deal with letters that dip down, like 'p' and 'y'
            this.currentXPosition = 0;
            _OsShell.putPrompt();
        }

        private clearCharacter(): void {

            // Find the char that is going to be backspaced
            var prevChar = this.buffer.charAt(this.buffer.length - 1);
            // Remove it from the buffer
            this.buffer = this.buffer.slice(0, -1);
            // Set the offset based off of the width of prevChar
            var xOffset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, prevChar);
            // Set back the current X position to in front of prevChar
            this.currentXPosition = this.currentXPosition - xOffset;

            _DrawingContext.fillRect(this.currentXPosition,
                                     this.currentYPosition - this.currentFontSize,
                                     xOffset,
                                     this.currentFontSize + 6);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal"
                // (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... add the command to the command history (if the command wasn't blank), ...
                    if (this.buffer.length > 0) {
                        _CommandHistory[_CommandHistory.length] = this.buffer;
                        _CommandHistPointer = _CommandHistory.length;
                    }
                    // ... and reset our buffer.
                    this.buffer = "";

                } else if (chr === String.fromCharCode(8)) { //   Backspace key

                    this.clearCharacter();

                } else if (chr === String.fromCharCode(9)) { //    Tab key

                    var commSoFar = this.buffer;
                    var regex = new RegExp("^" + commSoFar + "[A-Za-z]+");
                    var matchingComms = [];

                    var commList = _OsShell.commandList;

                    for (var i in commList) {
                        var c = commList[i].command;

                        if (regex.test(c)) {
                            matchingComms[matchingComms.length] = c;
                        }
                    }

                    // If we have more than one matching command, suggest all matches on the next line,
                    // and set up the prompt again with the user's last input retained.
                    if (matchingComms.length > 1) {
                        this.advanceLine();
                        var suggestion = "Did you mean:   ";
                        for (var comm in matchingComms) {
                            suggestion += matchingComms[comm] + "   ";
                        }
                        this.putText(suggestion);
                        this.advanceLine();
                        _OsShell.putPrompt();
                        this.buffer = commSoFar;

                    // Otherwise, clear the line and put in the only matching command.
                    } else {
                        this.buffer = matchingComms[0];
                        this.clearLine();
                    }

                    this.putText(this.buffer);

                } else if (chr === "uparrow") { //   Up arrow key

                    this.clearLine();

                    if (_CommandHistory.length > 0 &&
                            _CommandHistPointer >= 0 &&
                            _CommandHistPointer <= _CommandHistory.length) {

                        this.buffer = _CommandHistory[_CommandHistPointer - 1];
                        _CommandHistPointer--;

                    } else {

                        this.buffer = "";
                        _CommandHistPointer = 1;

                    }

                    this.putText(this.buffer);

                } else if (chr === "downarrow") { //  Down arrow key

                    this.clearLine();

                    if (_CommandHistory.length > 0 &&
                            _CommandHistPointer >= 0 &&
                            _CommandHistPointer <= _CommandHistory.length) {

                        this.buffer = _CommandHistory[_CommandHistPointer - 1];
                        _CommandHistPointer++;

                    } else {

                        this.buffer = "";
                        _CommandHistPointer = 1;

                    }

                    this.putText(this.buffer);

                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public bsodReset(): void {
            // _DrawingContext has already been changed to blue fillStyle in control.ts
            this.clearScreenBSOD();
            _StdOut.putText("");
            _Kernel.krnShutdown();
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                // Find the first space that comes after the first 50 chars. This will be
                // the real cutoff for the substring we print.
//                var nextEndOfWordAfter45;
//                var currSubstr;
//                if (text.length > 30) debugger;
//
//                if (text.length > 45) {
//                    if ((text.indexOf(" ") != -1)) {
//                        nextEndOfWordAfter45 = text.indexOf(" ", 45);
//                        currSubstr = text.substr(0, nextEndOfWordAfter45);
//                    } else {
//                        nextEndOfWordAfter45 = 0;
//                        currSubstr = text;
//                    }
//                } else {
//                    currSubstr = text;
//                }
//
//                // Draw the text at the current X and Y coordinates.
//                _DrawingContext.drawText(this.currentFont, this.currentFontSize,
//                                         this.currentXPosition, this.currentYPosition,
//                                         currSubstr);
//                // Move the current X position.
//                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
//                this.currentXPosition = this.currentXPosition + offset;
//
//                if (text.length > 45) {
//                    this.advanceLine();
//                    // Do a putText again, but with the rest of the string starting with the beginning of the
//                    // next word from the one we just finished printing.
//                    this.putText(text.substr(nextEndOfWordAfter45 + 1));
//                }
                _DrawingContext.drawText(this.currentFont, this.currentFontSize,
                                         this.currentXPosition, this.currentYPosition,
                                         text);
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;

            }
        }

        public advanceLine(): void {
            this.currentXPosition = 0;

            // If we are about to fly off the bottom of the canvas...
            if (this.currentYPosition + _DefaultFontSize >= _CanvasHeight) {
                // Scroll the canvas by one line's worth.
                Control.scrollCanvas(this);
            } else {
                // Move down to the next line.
                this.currentYPosition += _DefaultFontSize + _FontHeightMargin;
            }

        }
    }
 }
