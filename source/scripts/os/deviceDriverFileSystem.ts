/**
 * Created by John Paul Welsh on 11/24/14.
 */

module TSOS {

    export class DeviceDriverFileSystem extends DeviceDriver {

        isDirectoryFull: boolean;
        isDataFull:      boolean;

        constructor() {
            super(this.krnFileSysDriverEntry, this.krnFileSysDispatchAction);
            _FileSystem = new TSOS.FileSystem(FS_NUM_TRACKS, FS_NUM_SECTORS, FS_NUM_BLOCKS);
            this.isDirectoryFull = false;
            this.isDataFull      = false;

            this.createHTML(); // has to happen before initialize, because setItem will update the HTML
            this.initialize();
        }

        public initialize() {

            _FileSystem.loopThroughFSDoing(function(tsb) {
                _FileSystem.setFullBlank(tsb);
            });

            // After it's all been cleared, set the Master Boot Record
            _FileSystem.setMasterBootRecord();
        }

        public krnFileSysDriverEntry() {
            this.status = "Loaded";
        }

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
                    this.format(params);
                    break;
                case DISK_LIST:
                    this.listFiles();
                    break;
                default:
                    break;
            }
        }

        public createFile(params) {
            var fileName = params[1];
            _FileSystem.setBytes(true, fileName);
            _StdOut.putText("File created: " + fileName);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public readFile(params) {
            var fileName = params[1];
            var tsbWithName = _FileSystem.getDirectoryWithName(fileName);
            if (tsbWithName != undefined) {
                var dataTSB = _FileSystem.getTSBBytes(tsbWithName);
                _StdOut.putText(_FileSystem.getDataBytesWithLinks(dataTSB).replace(/~/g, ""));
            } else {
                _StdOut.putText("No file exists by that name");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

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
                _StdOut.putText("No file exists by that name");
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public deleteFile(params) {
            var fileName = params[1];
            _StdOut.putText("File deleted");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public format(params) {
            _StdOut.putText("Disk formatted");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

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

        public createHTML() {
            Control.createFileSystemTable();
        }
    }
}