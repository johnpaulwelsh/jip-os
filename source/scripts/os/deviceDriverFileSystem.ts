/**
 * Created by John Paul Welsh on 11/24/14.
 */
module TSOS {

    export class DeviceDriverFileSystem extends DeviceDriver {

        // These are never used. Oh well.
        isDirectoryFull:  boolean;
        isDataFull:       boolean;

        constructor() {
            super(this.krnFileSysDriverEntry, this.krnFileSysDispatchAction);
            _FileSystem = new TSOS.FileSystem(FS_NUM_TRACKS, FS_NUM_SECTORS, FS_NUM_BLOCKS);
            this.isDirectoryFull = false;
            this.isDataFull      = false;

            // Has to happen before initialize, because setItem will update the HTML.
            this.createHTML();
            this.initialize();
        }

        /*
         * Sets all entries in the file system to blanks, and writes in the
         * Master Boot Record when finished.
         */
        public initialize() {

            _FileSystem.loopThroughFSDoing(function(tsb) {
                _FileSystem.setFullBlank(tsb);
            });

            _FileSystem.setMasterBootRecord();
        }

        public krnFileSysDriverEntry() {
            this.status = "Loaded";
        }

        /*
         * Chooses the action to take, based off of the parameters from the
         * original interrupt.
         */
        public krnFileSysDispatchAction(params) {
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
        }

        /*
         * A swap file name is a dot, the word swap, and the PID of the
         * process it's being created for.
         */
        public getSwapFileName(pid) {
            return ".swap" + pid;
        }

        /*
         * Writes the supplied file name into a directory entry's data bytes.
         */
        public createFile(params) {
            var fileName = params[1];
            _FileSystem.setBytes(true, fileName);
            _StdOut.putText("File created: " + fileName);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        /*
         * Finds the directory entry that contains the given filename, and extracts
         * the text contained in the data-track entries that the directory points to.
         * Translated into ASCII of course. And we remove all the trailing DATA_FILL
         * characters.
         */
        public readFile(params) {
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
        }

        /*
         * Finds the directory entry that contains the given filename, and matches it
         * to the next empty data-track entry. Then we write the given bytes to that
         * data entry, with linking in the background if we need to do it.
         */
        public writeFile(params) {
            var fileName = params[1];
            var text = params[2];
            var tsbWithName = _FileSystem.getDirectoryWithName(fileName);
            if (tsbWithName != undefined) {
                var dataTSB = _FileSystem.getNextFreeDataEntry();
                _FileSystem.setBytes(false, text);
                _FileSystem.setTSBBytes(tsbWithName, dataTSB);
                _StdOut.putText("File written");
            } else {
                _StdOut.putText("No file exists by that name.");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        /*
         * Finds the directory entry that contains the given filename, and with linking,
         * sets all of its corresponding data-track entries to blanks.
         */
        public deleteFile(params) {
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
        }

        /*
         * Re-initializes the file system, but only if we aren't running the CPU because
         * I don't want to deal with the possibility that our program data was lost
         * mid-execution.
         */
        public format() {
            if (!_CPU.isExecuting) {
                this.initialize();
                _StdOut.putText("Disk formatted");
            } else {
                _StdOut.putText("Not safe to format, disk is running.");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        /*
         * Loops through and prints the filename in each used directory entry.
         */
        public listFiles() {
            _FileSystem.loopThroughFSDoing(function(tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && !_FileSystem.isNotUsed(tsb)) {
                    var fileName = _FileSystem.getDataBytes(tsb).replace(/~/g, "");
                    _StdOut.putText(fileName);
                    _StdOut.advanceLine();
                }
            });
            _OsShell.putPrompt();
        }

        /*
         * Creates the HTML table that displays the file system.
         */
        public createHTML() {
            Control.createFileSystemTable();
        }
    }
}