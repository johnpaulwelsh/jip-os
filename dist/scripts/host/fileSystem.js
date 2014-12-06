/**
* Created by JP on 12/5/14.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function () {
        function FileSystem(tracks, sectors, blocks) {
            this.DATA_FILL = "~";
            this.TSB_FILL = "*";
            this.metaBytes = 4;
            this.dataBytes = 60;
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
            TSOS.Control.updateFileSystemTable(tsb, newBytes);
        };

        FileSystem.prototype.continueAsLinked = function (filledTsb, remainingBytes) {
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
            return this.getItem(tsb).substr(4, this.dataBytes);
        };

        FileSystem.prototype.getMasterBootRecord = function () {
            return this.getItem("000");
        };

        FileSystem.prototype.getNextFreeDirectoryEntry = function () {
            var nextFree = "";

            var t = 0;
            for (var s = 0; s < this.sectors; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    var tsb = TSOS.Utils.tsbStr(t, s, b);
                    if (this.getIsUsedByte(tsb) == "0") {
                        nextFree = tsb;
                        break;
                    }
                }
            }

            return nextFree;
        };

        FileSystem.prototype.getNextFreeDataEntry = function () {
            var nextFree = "";

            for (var t = 1; t < this.tracks; t++) {
                for (var s = 0; s < this.sectors; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        var tsb = TSOS.Utils.tsbStr(t, s, b);
                        if (this.getIsUsedByte(tsb) == "0") {
                            nextFree = tsb;
                            break;
                        }
                    }
                }
            }

            return nextFree;
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
            // The most complicated one.
            // loop through every character in dataBytes,
            // convert to hex, and put into one spot.
            // if it reaches the end, linked-list it into
            // another entry
        };

        FileSystem.prototype.setMasterBootRecord = function () {
            var mbrTSB = "000";
            this.setIsUsedByte(mbrTSB, "1");
            this.setTSBBytesBlank(mbrTSB);
            this.setDataBytes(mbrTSB, APP_NAME);
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

        FileSystem.prototype.setFullBlank = function (tsb) {
            this.setIsUsedByte(tsb, "0");
            this.setTSBBytesBlank(tsb);
            this.setDataBytesBlank(tsb);
        };
        return FileSystem;
    })();
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
