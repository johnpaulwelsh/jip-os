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
var APP_NAME: string    = "jip-os";   // I am the Jip.
var APP_VERSION: string = "0.28";     // I like the number 28.

var CPU_CLOCK_INTERVAL: number = 100;   // This is in ms, or milliseconds, so 1000 = 1 second.

// Software interrupt codes
var TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                            // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ: number = 1;
var PROG_SYSCALL_IRQ: number = 2;
var PROG_INVALID_OPCODE_IRQ: number = 3;
var MEMORY_VIOLATION_IRQ: number = 4;
var CONTEXT_SWITCH_IRQ: number = 5;
var FILE_SYSTEM_IRQ: number = 6;

// Scheduling alrogithms
var ROUND_ROBIN: number = 0;
var FCFS: number = 1;
var PRIORITY: number = 2;

var SEGMENT_COUNT = 3;
var SEGMENT_SIZE = 256;

//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement = null;  // Initialized in hostInit().
var _DrawingContext = null;             // Initialized in hostInit().
var _DefaultFontFamily = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;              // Additional space added to font size when advancing a line.


var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue: TSOS.Queue = null;
var _KernelBuffers: any[] = null;
var _KernelInputQueue: TSOS.Queue = null;

// Standard input and output
var _StdIn: TSOS.Console  = null;
var _StdOut: TSOS.Console = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver: TSOS.DeviceDriverKeyboard = null;
var _krnFileSystemDriver: TSOS.DeviceDriverFileSystem = null;

var _hardwareClockID: number = null;

// For testing...
var _GLaDOS: any = null;
var Glados: any = null;

// For doing web stuff in the 'host' files, but using that data in the 'os' files...
var _ProgInput: any = "";
var _CanvasHeight: number = null;

// For keeping track of command history...
var _CommandHistory: string[] = [];
var _CommandHistPointer: number = 0;

// For loading and running programs...
var _PID: number = 0;
// In which block of memory is the program we are currently running? Set to -1 when not running a program.
var _CurrBlockOfMem: number = -1;
var _CurrPCB: any = null;

var _Memory: any = null; // the Memory object
var _MemTable: any = null; // the HTML table that displays memory
var _MemMan: any = null; // the Memory Manager object

// The CPU Scheduler..
var _Scheduler: any = null;

// Program Queues...
var _ResidentQueue: any = null;
var _ReadyQueue: any = null;
var _ReadyQueueTable: any = null; // the HTML table that displays the Ready Queue
var _CompletedQueue: any = null;

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
var _FileSystemTable: any = null;
var _FileSystem: any = null;
var FS_NUM_TRACKS = 4;
var FS_NUM_SECTORS = 8;
var FS_NUM_BLOCKS = 8;
var FS_META_BYTES = 4;
var FS_DATA_BYTES = 60;

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
