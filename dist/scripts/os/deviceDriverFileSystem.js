var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Created by John Paul Welsh on 11/24/14.
*/
var TSOS;
(function (TSOS) {
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            _super.call(this, this.krnFileSysDriverEntry, this.krnFileSysDispatchAction);
            _FileSystem = new TSOS.FileSystem(FS_NUM_TRACKS, FS_NUM_SECTORS, FS_NUM_BLOCKS);
            this.isDirectoryFull = false;
            this.isDataFull = false;

            // Has to happen before initialize, because setItem will update the HTML.
            this.createHTML();
            this.initialize();
        }
        /*
        * Sets all entries in the file system to blanks, and writes in the
        * Master Boot Record when finished.
        */
        DeviceDriverFileSystem.prototype.initialize = function () {
            _FileSystem.loopThroughFSDoing(function (tsb) {
                _FileSystem.setFullBlank(tsb);
            });

            _FileSystem.setMasterBootRecord();
        };

        DeviceDriverFileSystem.prototype.krnFileSysDriverEntry = function () {
            this.status = "Loaded";
        };

        /*
        * Chooses the action to take, based off of the parameters from the
        * original interrupt.
        */
        DeviceDriverFileSystem.prototype.krnFileSysDispatchAction = function (params) {
            switch (params[0]) {
                case DISK_CREATE:
                    this.createFile(params);
                    break;
                case DISK_READ:
                    this.readFile(params);
                    break;
                case DISK_WRITE:
                    this.writeFile(params);
                    break;
                case DISK_DELETE:
                    this.deleteFile(params);
                    break;
                case DISK_FORMAT:
                    this.format();
                    break;
                case DISK_LIST:
                    this.listFiles();
                    break;
                default:
                    break;
            }
        };

        /*
        * A swap file name is a dot, the word swap, and the PID of the
        * process it's being created for.
        */
        DeviceDriverFileSystem.prototype.getSwapFileName = function (pid) {
            return ".swap" + pid;
        };

        /*
        * Writes the supplied file name into a directory entry's data bytes.
        */
        DeviceDriverFileSystem.prototype.createFile = function (params) {
            var fileName = params[1];
            _FileSystem.setBytes(true, fileName, false);
            _StdOut.putText("File created: " + fileName);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        /*
        * Finds the directory entry that contains the given filename, and extracts
        * the text contained in the data-track entries that the directory points to.
        * Translated into ASCII of course. And we remove all the trailing DATA_FILL
        * characters.
        */
        DeviceDriverFileSystem.prototype.readFile = function (params) {
            var fileName = params[1];
            var tsbWithName = _FileSystem.getDirectoryWithName(fileName);
            if (tsbWithName != undefined) {
                var dataTSB = _FileSystem.getTSBBytes(tsbWithName);
                _StdOut.putText(_FileSystem.getDataBytesWithLinks(dataTSB).replace(/~/g, ""));
            } else {
                _StdOut.putText("No file exists by that name.");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        /*
        * Finds the directory entry that contains the given filename, and matches it
        * to the next empty data-track entry. Then we write the given bytes to that
        * data entry, with linking in the background if we need to do it.
        */
        DeviceDriverFileSystem.prototype.writeFile = function (params) {
            var fileName = params[1];
            var text = params[2];
            var isProgCode = params[3];
            var tsbWithName = _FileSystem.getDirectoryWithName(fileName);
            if (tsbWithName != undefined) {
                var dataTSB = _FileSystem.getNextFreeDataEntry();
                _FileSystem.setBytes(false, text, isProgCode);
                _FileSystem.setTSBBytes(tsbWithName, dataTSB);
                _StdOut.putText("File written");
            } else {
                _StdOut.putText("No file exists by that name.");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        /*
        * Finds the directory entry that contains the given filename, and with linking,
        * sets all of its corresponding data-track entries to blanks.
        */
        DeviceDriverFileSystem.prototype.deleteFile = function (params) {
            var fileName = params[1];
            var tsbWithName = _FileSystem.getDirectoryWithName(fileName);
            if (tsbWithName != undefined) {
                _FileSystem.setDataBytesWithLinksBlank(tsbWithName);
                _StdOut.putText("File deleted");
            } else {
                _StdOut.putText("No file exists by that name.");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        /*
        * Re-initializes the file system, but only if we aren't running the CPU because
        * I don't want to deal with the possibility that our program data was lost
        * mid-execution.
        */
        DeviceDriverFileSystem.prototype.format = function () {
            if (!_CPU.isExecuting) {
                this.initialize();
                _StdOut.putText("Disk formatted");
            } else {
                _StdOut.putText("Not safe to format, disk is running.");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        /*
        * Loops through and prints the filename in each used directory entry.
        */
        DeviceDriverFileSystem.prototype.listFiles = function () {
            _FileSystem.loopThroughFSDoing(function (tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && !_FileSystem.isNotUsed(tsb)) {
                    var fileName = _FileSystem.getDataBytes(tsb).replace(/~/g, "");
                    _StdOut.putText(fileName);
                    _StdOut.advanceLine();
                }
            });
            _OsShell.putPrompt();
        };

        /*
        * Creates the HTML table that displays the file system.
        */
        DeviceDriverFileSystem.prototype.createHTML = function () {
            TSOS.Control.createFileSystemTable();
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
