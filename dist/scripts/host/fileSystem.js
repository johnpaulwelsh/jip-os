/**
* Created by JP on 12/5/14.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function () {
        function FileSystem(tracks, sectors, blocks) {
            this.DATA_FILL = "~";
            this.TSB_FILL = "*";
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
        }
        //
        // Helpers
        //
        FileSystem.prototype.getItem = function (tsb) {
            return sessionStorage.getItem(tsb);
        };

        FileSystem.prototype.setItem = function (tsb, newBytes) {
            sessionStorage.setItem(tsb, newBytes);
        };

        //
        // Full Getters
        //
        FileSystem.prototype.getFullDirectoryEntry = function (tsb) {
            return sessionStorage.getItem(tsb);
        };

        FileSystem.prototype.getFullDataEntry = function (tsb) {
            return this.getFullDirectoryEntry(tsb);
        };

        //
        // Partial Getters
        //
        FileSystem.prototype.getIsUsedByte = function (tsb) {
            return this.getItem(tsb).substr(0, 1);
        };

        FileSystem.prototype.getTrackByte = function (tsb) {
            return this.getItem(tsb).substr(1, 1);
        };

        FileSystem.prototype.getSectorByte = function (tsb) {
            return this.getItem(tsb).substr(2, 1);
        };

        FileSystem.prototype.getBlockByte = function (tsb) {
            return this.getItem(tsb).substr(3, 1);
        };

        FileSystem.prototype.getTSBBytes = function (tsb) {
            return (this.getTrackByte(tsb) + this.getSectorByte(tsb) + this.getBlockByte(tsb));
        };

        FileSystem.prototype.getDataBytes = function (tsb) {
            return this.getItem(tsb).substr();
        };

        //
        // Partial Setters
        //
        FileSystem.prototype.setIsUsedByte = function (tsb, byte) {
            var data = this.getItem(tsb);
            data[0] = byte;
            this.setItem(tsb, data);
        };

        FileSystem.prototype.setTSBBytes = function (tsb, tsbBytes) {
            var data = this.getItem(tsb);
            var tsbArray = tsbBytes.split();
            for (var i = 1; i < 4; i++) {
                data[i] = tsbArray[i - 1];
            }
            this.setItem(tsb, data);
        };

        FileSystem.prototype.setDataBytes = function (tsb, dataBytes) {
        };

        FileSystem.prototype.setMasterBootRecord = function () {
            this.setIsUsedByte("000", "1");
            this.setTSBBytesBlank("000");
            this.setDataBytes("000", "jip-os");
        };

        //
        // Blank Setters
        //
        FileSystem.prototype.setTSBBytesBlank = function (tsb) {
            var data = this.getItem(tsb);
            data[1] = this.TSB_FILL; // track
            data[2] = this.TSB_FILL; // sector
            data[3] = this.TSB_FILL; // block
            this.setItem(tsb, data);
        };

        FileSystem.prototype.setDataBytesBlank = function (tsb) {
            var data = this.getItem(tsb);
            for (var i = 4; i < data.length; i++) {
                data[i] = this.DATA_FILL;
            }
            this.setItem(tsb, data);
        };

        FileSystem.prototype.setFullDirectoryBlank = function (tsb) {
            this.setIsUsedByte(tsb, "0");
            this.setTSBBytesBlank(tsb);
            this.setDataBytesBlank(tsb);
        };

        FileSystem.prototype.setFullDataBlank = function (tsb) {
            this.setFullDirectoryBlank(tsb);
        };
        return FileSystem;
    })();
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
