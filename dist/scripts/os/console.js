///<reference path="../globals.ts" />
/* ------------
Console.ts
Requires globals.ts
The OS Console - stdIn and stdOut by default.
Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };

        Console.prototype.clearScreenBSOD = function () {
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
        };

        Console.prototype.clearLine = function () {
            _DrawingContext.fillRect(0, this.currentYPosition - this.currentFontSize, _Canvas.width, this.currentFontSize + 6);

            // the +6 above (and in clearCharacter) is to deal with letters that dip down like 'p' and 'y'
            this.currentXPosition = 0;
            _OsShell.putPrompt();
        };

        Console.prototype.clearCharacter = function () {
            // Find the char that is going to be backspaced
            var prevChar = this.buffer.charAt(this.buffer.length - 1);

            // Remove it from the buffer
            this.buffer = this.buffer.slice(0, -1);

            // Set the offset based off of the width of prevChar
            var xOffset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, prevChar);

            // Set back the current X position to in front of prevChar
            this.currentXPosition = this.currentXPosition - xOffset;

            _DrawingContext.fillRect(this.currentXPosition, this.currentYPosition - this.currentFontSize, xOffset, this.currentFontSize + 6);
        };

        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };

        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
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
                } else if (chr === String.fromCharCode(8)) {
                    this.clearCharacter();
                } else if (chr === String.fromCharCode(9)) {
                    var commSoFar = this.buffer;
                    var regex = new RegExp("^" + commSoFar + "[A-Za-z]+");

                    var commList = _OsShell.commandList;

                    for (var i in commList) {
                        var c = commList[i].command;

                        if (regex.test(c)) {
                            this.buffer = c;
                        }

                        this.clearLine();
                        this.putText(this.buffer);
                    }
                } else if (chr === String.fromCharCode(38)) {
                    this.clearLine();

                    if (_CommandHistory.length > 0 && _CommandHistPointer >= 0 && _CommandHistPointer <= _CommandHistory.length) {
                        this.buffer = _CommandHistory[_CommandHistPointer - 1];
                        _CommandHistPointer--;
                    } else {
                        this.buffer = "";
                        _CommandHistPointer = 1;
                    }

                    this.putText(this.buffer);
                } else if (chr === String.fromCharCode(40)) {
                    this.clearLine();

                    if (_CommandHistory.length > 0 && _CommandHistPointer >= 0 && _CommandHistPointer <= _CommandHistory.length) {
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
        };

        Console.prototype.bsodReset = function () {
            // _DrawingContext has already been changed to blue fillStyle in control.ts
            this.clearScreenBSOD();
            _StdOut.putText("You dinked it up. Congratulations.");
            _Kernel.krnShutdown();
        };

        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);

                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize + _FontHeightMargin;
            //            if (_CanvasHeight <= this.currentYPosition) {
            //                Control.increaseCanvasHeight();
            //            }
            // TODO: Handle scrolling. (Project 1)
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
