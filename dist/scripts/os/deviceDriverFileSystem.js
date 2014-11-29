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
            this.tracks = FS_NUM_TRACKS;
            this.sectors = FS_NUM_SECTORS;
            this.blocks = FS_NUM_BLOCKS;
            this.metaBytes = FS_META_BYTES;
            this.dataBytes = FS_DATA_BYTES;
            this.isDirectoryFull = false;
            this.isDataFull = false;

            this.createHTML();
        }
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

        DeviceDriverFileSystem.prototype.updateHTML = function (t, s, b, startByte, length, newText) {
            TSOS.Control.updateFileSysAtLoc(t, s, b, startByte, length, newText);
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
