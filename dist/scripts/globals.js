/* ------------
Globals.ts
Global CONSTANTS and _Variables.
(Global over both the OS and Hardware Simulation / Host.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME = "jip-os";
var APP_VERSION = "0.28";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;

var PROG_SYSCALL_IRQ = 2;

//
// Global Variables
//
var _CPU;

var _OSclock = 0;

var _Mode = 0;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

// For doing web stuff in the 'host' files, but using that data in the 'os' files...
var _ProgInput = "";
var _CanvasHeight = null;

// For keeping track of command history...
var _CommandHistory = [];
var _CommandHistPointer = 0;

// For loading and running programs...
var _PID = 0;

// In which block of memory is the program we are currently running? Set to -1 when not running a program.
var _CurrBlockOfMem = -1;
var _CurrPCB = null;
var _RunningPID = -1;

var _Memory = null;
var _MemTable = null;
var _MemMan = null;

var _ResidentQueue = null;

// To allow single-step program execution...
var _IsSingleStep = false;

// For line wrap...
var _StringCutoffLength = 40;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
