/**
* Created by John Paul Welsh on 11/24/14.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSOS;
(function (TSOS) {
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            _super.call(this, this.krnFileSysDriverEntry, this.krnFileSysDispatchAction);
            _FileSystem = new TSOS.FileSystem(FS_NUM_TRACKS, FS_NUM_SECTORS, FS_NUM_BLOCKS);
            this.isDirectoryFull = false;
            this.isDataFull = false;

            this.createHTML(); // has to happen before initialize, because setItem will update the HTML
            this.initialize();
        }
        DeviceDriverFileSystem.prototype.initialize = function () {
            _FileSystem.loopThroughFSDoing(function (tsb) {
                _FileSystem.setFullBlank(tsb);
            });

            // After it's all been cleared, set the Master Boot Record
            _FileSystem.setMasterBootRecord();
        };

        DeviceDriverFileSystem.prototype.krnFileSysDriverEntry = function () {
            this.status = "Loaded";
        };

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

        DeviceDriverFileSystem.prototype.getSwapFileName = function (pid) {
            return ".swap" + pid;
        };

        DeviceDriverFileSystem.prototype.createFile = function (params) {
            var fileName = params[1];
            _FileSystem.setBytes(true, fileName);
            _StdOut.putText("File created: " + fileName);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

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

        DeviceDriverFileSystem.prototype.writeFile = function (params) {
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
        };

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

        DeviceDriverFileSystem.prototype.createHTML = function () {
            TSOS.Control.createFileSystemTable();
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
