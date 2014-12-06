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

            this.createHTML();
        }
        DeviceDriverFileSystem.prototype.initialize = function () {
            for (var t = 0; t < _FileSystem.tracks; t++) {
                for (var s = 0; s < _FileSystem.sectors; s++) {
                    for (var b = 0; b < _FileSystem.blocks; b++) {
                        var tsb = TSOS.Utils.tsbStr(t, s, b);
                        if (t == 0) {
                            _FileSystem.setFullDirectoryBlank(tsb);
                        } else {
                            _FileSystem.setFullDataBlank(tsb);
                        }
                    }
                }
            }

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
                    this.format(params);
                    break;
                case DISK_LIST:
                    this.listFiles();
                    break;
                default:
                    break;
            }
        };

        DeviceDriverFileSystem.prototype.createFile = function (params) {
            _StdOut.putText("File created");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        DeviceDriverFileSystem.prototype.readFile = function (params) {
            _StdOut.putText("File read");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        DeviceDriverFileSystem.prototype.writeFile = function (params) {
            _StdOut.putText("File written");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        DeviceDriverFileSystem.prototype.deleteFile = function (params) {
            _StdOut.putText("File deleted");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        DeviceDriverFileSystem.prototype.format = function (params) {
            _StdOut.putText("Disk formatted");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        DeviceDriverFileSystem.prototype.listFiles = function () {
            _StdOut.putText("Files listed");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        DeviceDriverFileSystem.prototype.createHTML = function () {
            TSOS.Control.createFileSystemTable();
            TSOS.Control.fillInMetaBytes();
        };

        DeviceDriverFileSystem.prototype.updateFileSystem = function (t, s, b, startByte, length, newText) {
            _FileSystem.updateFileSysAtLoc(t, s, b, startByte, length, newText);
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
