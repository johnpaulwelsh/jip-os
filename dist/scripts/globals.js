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

// Software interrupt codes
var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var PROG_SYSCALL_IRQ = 2;
var PROG_INVALID_OPCODE_IRQ = 3;
var MEMORY_VIOLATION_IRQ = 4;
var CONTEXT_SWITCH_IRQ = 5;
var FILE_SYSTEM_IRQ = 6;

// Scheduling alrogithms
var ROUND_ROBIN = 0;
var FCFS = 1;
var PRIORITY = 2;

var SEGMENT_COUNT = 3;
var SEGMENT_SIZE = 256;

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
var _krnFileSystemDriver = null;

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

var _Memory = null;
var _MemTable = null;
var _MemMan = null;

// The CPU Scheduler..
var _Scheduler = null;

// Program Queues...
var _ResidentQueue = null;
var _ReadyQueue = null;
var _ReadyQueueTable = null;
var _CompletedQueue = null;

// To allow single-step program execution...
var _IsSingleStep = false;

// For line wrap...
var _StringCutoffLength = 40;

// For file system...
var DISK_CREATE = 0;
var DISK_READ = 1;
var DISK_WRITE = 2;
var DISK_DELETE = 3;
var DISK_FORMAT = 4;
var DISK_LIST = 5;
var _FileSystemTable = null;
var _FileSystem = null;
var FS_NUM_TRACKS = 4;
var FS_NUM_SECTORS = 8;
var FS_NUM_BLOCKS = 8;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
