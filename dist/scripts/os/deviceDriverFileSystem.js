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
                default:
                    break;
            }
        };

        DeviceDriverFileSystem.prototype.createFile = function (params) {
        };

        DeviceDriverFileSystem.prototype.readFile = function (params) {
        };

        DeviceDriverFileSystem.prototype.writeFile = function (params) {
        };

        DeviceDriverFileSystem.prototype.deleteFile = function (params) {
        };

        DeviceDriverFileSystem.prototype.format = function (params) {
        };

        DeviceDriverFileSystem.prototype.listFiles = function () {
        };

        DeviceDriverFileSystem.prototype.createHTML = function () {
            TSOS.Control.createFileSystemTable();
        };

        DeviceDriverFileSystem.prototype.updateHTML = function () {
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
