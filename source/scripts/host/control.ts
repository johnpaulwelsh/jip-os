///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            // Text functionality is now built in to the HTML5 canvas.
            // But this is old-school, and fun.
            CanvasTextFunctions.enable(_DrawingContext);

            // I'm sorry Alan, I don't know why the compiler yells at me for this.
            // It still outputs correct JS, so I assumed it was because _DrawingContext was never
            // given a type. However, I tried to put in a type for the variable and everything died,
            // so I decided to let it be.
            _DrawingContext.fillStyle = "#000000";

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" +
                              msg + ", now:" + now  + " })" + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSingleStepStart").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();
            _CPU.init();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();

            var wrapper = document.getElementById("divConsole");
            wrapper.scrollTop = wrapper.scrollHeight;
            _CanvasHeight = document.getElementById("display").clientHeight;

            // Initializes some memory.
            // The first parameter will change from 1 to 3 for iProject 3.
            _Memory = new TSOS.Memory(1, 256);
            // Creates a memory manager.
            _MemMan = new TSOS.MemoryManager();

            // Sets the CPU display table to all zeroes.
            this.resetCPUElementsInHTML();
            // Create the HTML table to show the contents of memory.
            this.generateMemoryTable(1);
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static startSingleStep(btn): void {
            document.getElementById("btnSingleStepStart").disabled = true;
            document.getElementById("btnSingleStepMakeStep").disabled = false;
            document.getElementById("btnSingleStepEnd").disabled = false;
            _IsSingleStep = true;
        }

        public static makeSingleStep(btn): void {
            // Also check out the hostClockPulse function in devices.ts
            // If we are running a program and in single-step mode, and this button is clicked,
            // we run a clock pulse.
            if (_CPU.isExecuting && _IsSingleStep) {
                Devices.hostClockPulse();
            // Otherwise, set it back so the CPU executes on clock ticks.
            } else {
                _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            }
        }

        public static endSingleStep(btn): void {
            document.getElementById("btnSingleStepStart").disabled = false;
            document.getElementById("btnSingleStepMakeStep").disabled = true;
            document.getElementById("btnSingleStepEnd").disabled = true;
            this.changeSingleStepStatusVisibility("none");
            _IsSingleStep = false;
            // Once we are done with single-step mode, set the CPU to execute on clock ticks.
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
        }

        public static changeSingleStepStatusVisibility(param): void {
            document.getElementById("divSingleStepStatus").style.display = param;
        }

        public static getProgramInput(): string[] {
            return (<HTMLInputElement>document.getElementById("taProgramInput")).value.trim().split(" ");
        }

        public static setStatusMess(args): void {
            document.getElementById("statusMess").innerHTML = args;
        }

        public static setBSODContext(): void {
            _DrawingContext.fillStyle = "#0000FF";
            _StdOut.bsodReset();
        }

        public static scrollCanvas(console): void {
            // Get the current state of the canvas as an image and save it into an Image object.
            var currCanvasContent = new Image();
            currCanvasContent.src = _Canvas.toDataURL("content/png");
            // Wipe the canvas.
            console.clearScreen();
            // Clip the top off of the image, by the height of one line of text, and draw it back to the canvas.
            var clipY = _DefaultFontSize + _FontHeightMargin;
            _DrawingContext.drawImage(currCanvasContent, // img
                                        0, clipY,        // sx, sy
                                        500, 500,        // swidth, sheight
                                        0, 0,            // x, y
                                        500, 500);       // width, height
        }

        // Sets all the CPU elements to 0.
        public static resetCPUElementsInHTML(): void {
            document.getElementById("tdPC").innerHTML = "0";
            document.getElementById("tdAccum").innerHTML = "0";
            document.getElementById("tdXReg").innerHTML = "0";
            document.getElementById("tdYReg").innerHTML = "0";
            document.getElementById("tdZFlag").innerHTML = "0";
        }

        // Sets all memory elements to 0.
        public static resetMemory(): void {
            _Memory.clearMem();
        }

        // Used to build the table that displays memory, because I sure wasn't going to
        // hard-code 96 rows of a table.
        public static generateMemoryTable(segments): void {
            _MemTable = <HTMLTableElement>document.getElementById("tableMemory");

            // Do this for however many segments of memory we are making.
            for (var i = 0; i < segments; i++) {

                // There will be 32 rows...
                for (var j = 0; j < 32; j++) {

                    var tr = document.createElement("tr");
                    _MemTable.appendChild(tr);
                    // ... and 8 cells per row, to represent 8 bytes.
                    for (var k = 0; k < 8; k++) {
                        var td = document.createElement("td");
                        // Put the contents of each unit of memory into the td.
//                        td.innerHTML = _Memory.getMemBlock(i)[j];
                        td.innerHTML = "00";
                        tr.appendChild(td);
                    }
                }
            }
        }

        public static updateMemTableAtLoc(tableRow, tableCel, newCode): void {
            _MemTable.rows[tableRow].cells[tableCel].innerHTML = newCode;
        }

        // TODO: fix how segments are handled; we only have one for now so it doesn't break anything
        public static emptyFullMemTable(segments): void {
            for (var i = 0; i < segments; i++) {
                for (var j = 0; j < 32; j++) {
                    for (var k = 0; k < 8; k++) {
                        this.updateMemTableAtLoc(j, k, "00");
                    }
                }
            }
        }

        public static setCPUElementByID(id, value): void {
            document.getElementById(id).innerHTML = value;
        }
    }
}
