/**
* Created by JP on 12/5/14.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function () {
        function FileSystem(tracks, sectors, blocks) {
            this.DATA_FILL = "~";
            this.TSB_FILL = "*";
            this.DATA_BEGIN = 4;
            this.metaBytes = 4;
            this.dataBytes = 60;
            this.isDoneLooping = false;
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
        }
        FileSystem.prototype.getDirectorySize = function () {
            return this.sectors * this.blocks;
        };

        FileSystem.prototype.getDataSize = function () {
            return (this.tracks - 1) * this.sectors * this.blocks;
        };

        FileSystem.prototype.loopThroughFSDoing = function (func) {
            var foundThing = null;

            for (var t = 0; t < _FileSystem.tracks; t++) {
                for (var s = 0; s < _FileSystem.sectors; s++) {
                    for (var b = 0; b < _FileSystem.blocks; b++) {
                        var tsb = TSOS.Utils.tsbStr(t, s, b);
                        foundThing = func(tsb);
                        if (this.isDoneLooping)
                            break;
                    }
                    if (this.isDoneLooping)
                        break;
                }
                if (this.isDoneLooping)
                    break;
            }

            _FileSystem.isDoneLooping = false;

            return foundThing;
        };

        FileSystem.prototype.isDirectoryNotMBR = function (tsb) {
            return (tsb[0] == "0" && tsb != "000");
        };

        //
        // Helpers
        //
        FileSystem.prototype.getItem = function (tsb) {
            var tempGotten = sessionStorage.getItem(tsb);
            return (tempGotten != undefined) ? tempGotten.replace(",", "") : TSOS.Control.buildEmptyEntry();
        };

        FileSystem.prototype.setItem = function (tsb, newBytes) {
            sessionStorage.setItem(tsb, newBytes);
            TSOS.Control.updateFileSystemTable(tsb, newBytes);
        };

        //
        // Getters
        //
        FileSystem.prototype.getIsUsedByte = function (tsb) {
            return this.getItem(tsb).substr(0, 1);
        };

        //public getTrackByte(tsb): string {
        //    return this.getItem(tsb).substr(1, 1);
        //}
        //
        //public getSectorByte(tsb): string {
        //    return this.getItem(tsb).substr(2, 1);
        //}
        //
        //public getBlockByte(tsb): string {
        //    return this.getItem(tsb).substr(3, 1);
        //}
        //
        //public getTSBBytes(tsb): string {
        //    return (this.getTrackByte(tsb) + this.getSectorByte(tsb) + this.getBlockByte(tsb));
        //}
        FileSystem.prototype.getDataBytes = function (tsb) {
            return this.getItem(tsb).substr(4, this.dataBytes);
        };

        FileSystem.prototype.getMasterBootRecord = function () {
            return this.getItem("000");
        };

        FileSystem.prototype.getNextFreeDirectoryEntry = function () {
            return this.loopThroughFSDoing(function (tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && _FileSystem.getIsUsedByte(tsb) == "0") {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        };

        FileSystem.prototype.getNextFreeDataEntry = function () {
            return this.loopThroughFSDoing(function (tsb) {
                if (tsb[0] != "0" && _FileSystem.getIsUsedByte(tsb) == "0") {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        };

        FileSystem.prototype.getDirectoryWithName = function (fileName) {
            return this.loopThroughFSDoing(function (tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && TSOS.Utils.contains(_FileSystem.getDataBytes(tsb), fileName)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        };

        //
        // Setters
        //
        FileSystem.prototype.setIsUsedByte = function (tsb, byte) {
            var data = this.getItem(tsb).split("");
            data[0] = byte;
            this.setItem(tsb, data.join(""));
        };

        FileSystem.prototype.setTSBBytes = function (tsb, tsbBytes) {
            var data = this.getItem(tsb).split("");
            var tsbArray = tsbBytes.split();
            for (var i = 1; i < this.metaBytes; i++) {
                data[i] = tsbArray[i - 1];
            }
            this.setItem(tsb, data.join(""));
        };

        FileSystem.prototype.setBytes = function (isDirectory, bytes, tsb) {
            var myTSB = (tsb != undefined) ? tsb : ((isDirectory) ? this.getNextFreeDirectoryEntry() : this.getNextFreeDataEntry());

            var data = this.getItem(myTSB).split("");
            var byteArray = bytes.split("");
            for (var s = this.DATA_BEGIN; s < (byteArray.length + this.DATA_BEGIN); s++) {
                data[s] = byteArray[s - this.DATA_BEGIN];
            }

            this.setItem(myTSB, data.join(""));
            this.setIsUsedByte(myTSB, "1");
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
            this.setBytes(true, APP_NAME, mbrTSB);
        };

        //
        // Blank Setters
        //
        FileSystem.prototype.setTSBBytesBlank = function (tsb) {
            var data = this.getItem(tsb).split("");
            data[1] = this.TSB_FILL; // track
            data[2] = this.TSB_FILL; // sector
            data[3] = this.TSB_FILL; // block
            this.setItem(tsb, data.join(""));
        };

        FileSystem.prototype.setDataBytesBlank = function (tsb) {
            var data = this.getItem(tsb).split("");
            for (var i = 4; i < this.dataBytes; i++) {
                data[i] = this.DATA_FILL;
            }
            this.setItem(tsb, data.join(""));
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
