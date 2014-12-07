/**
* Created by JP on 12/5/14.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function () {
        function FileSystem(tracks, sectors, blocks) {
            this.DATA_FILL = "~";
            this.TSB_FILL = "*";
            this.TSB_FILL_FULL = "***";
            this.DATA_BEGIN = 4;
            this.metaBytes = 4;
            this.dataBytes = 120;
            this.isDoneLooping = false;
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
        }
        //public getDirectorySize(): number {
        //    return this.sectors * this.blocks;
        //}
        //
        //public getDataSize(): number {
        //    return (this.tracks-1) * this.sectors * this.blocks;
        //}
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

        FileSystem.prototype.isDirectory = function (tsb) {
            return (tsb[0] == "0");
        };

        FileSystem.prototype.isNotUsed = function (tsb) {
            return (_FileSystem.getIsUsedByte(tsb) == "0");
        };

        //
        // Helpers
        //
        FileSystem.prototype.getItem = function (tsb) {
            var tempGotten = sessionStorage.getItem(tsb);
            return (tempGotten != undefined) ? tempGotten.replace(",", "") : TSOS.Control.buildEmptyEntry();
        };

        FileSystem.prototype.setItem = function (tsb, newBytes) {
            this.specialSetItemBlank(tsb);
            sessionStorage.setItem(tsb, newBytes);
            TSOS.Control.updateFileSystemTable(tsb, newBytes);
        };

        FileSystem.prototype.specialSetItemBlank = function (tsb) {
            var data = this.getItem(tsb).split("");

            data[0] = "0";
            data[1] = this.TSB_FILL;
            data[2] = this.TSB_FILL;
            data[3] = this.TSB_FILL;
            for (var i = 4; i < this.dataBytes; i++) {
                data[i] = this.DATA_FILL;
            }

            sessionStorage.setItem(tsb, data.join(""));
        };

        //
        // Getters
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
            return TSOS.Utils.charHexStrToAsciiStr(this.getItem(tsb).substr(4, this.dataBytes));
        };

        FileSystem.prototype.getDataBytesWithLinks = function (tsb) {
            var firstPiece = this.getDataBytes(tsb);
            var nextTSB = this.getTSBBytes(tsb);
            if (nextTSB != this.TSB_FILL_FULL) {
                return firstPiece + this.getDataBytesWithLinks(nextTSB);
            } else {
                return firstPiece;
            }
        };

        //public getMasterBootRecord(): string {
        //    return this.getItem("000");
        //}
        FileSystem.prototype.getNextFreeDirectoryEntry = function () {
            return this.loopThroughFSDoing(function (tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && _FileSystem.isNotUsed(tsb)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        };

        FileSystem.prototype.getNextFreeDataEntry = function () {
            return this.loopThroughFSDoing(function (tsb) {
                if (!_FileSystem.isDirectory(tsb) && _FileSystem.isNotUsed(tsb)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        };

        FileSystem.prototype.getDirectoryWithName = function (fileName) {
            return this.loopThroughFSDoing(function (tsb) {
                var asciiName = _FileSystem.getDataBytes(tsb).replace(/~/g, "");
                if (_FileSystem.isDirectoryNotMBR(tsb) && TSOS.Utils.contains(asciiName, fileName)) {
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
            var byteArray = bytes.split("");

            // If we don't need to do any linking...
            if (byteArray.length <= this.dataBytes) {
                var myTSB = (tsb != undefined) ? tsb : ((isDirectory) ? this.getNextFreeDirectoryEntry() : this.getNextFreeDataEntry());

                var dataArray = this.getItem(myTSB).split("");

                for (var s = this.DATA_BEGIN; s < (byteArray.length + this.DATA_BEGIN); s++) {
                    dataArray[s] = byteArray[s - this.DATA_BEGIN];
                }

                var finalData = TSOS.Utils.asciiStrToCharHexStr(dataArray.join(""));
                this.setItem(myTSB, finalData);
                this.setIsUsedByte(myTSB, "1");
            } else {
                this.setBytesWithLinks(isDirectory, byteArray, tsb);
            }
        };

        FileSystem.prototype.setBytesWithLinks = function (isDirectory, byteArray, tsb) {
            var myTSB = (tsb != undefined) ? tsb : ((isDirectory) ? this.getNextFreeDirectoryEntry() : this.getNextFreeDataEntry());

            var dataArray = this.getItem(myTSB).split("");

            for (var s = this.DATA_BEGIN; s < (this.dataBytes + this.DATA_BEGIN); s++) {
                dataArray[s] = byteArray[s - this.DATA_BEGIN];
            }

            // Get the rest of the string
            byteArray = byteArray.slice(this.dataBytes);

            var finalData = dataArray.join("");

            if (byteArray.length <= 0) {
                for (var i = finalData.length; i < (this.dataBytes + this.DATA_BEGIN); i++) {
                    finalData += this.DATA_FILL;
                }
            }

            var realFinalData = TSOS.Utils.asciiStrToCharHexStr(finalData);
            this.setItem(myTSB, realFinalData);

            //this.setItem(myTSB, finalData);
            this.setIsUsedByte(myTSB, "1");

            // If there's still some left...
            if (byteArray.length > 0) {
                var newTSB = ((isDirectory) ? this.getNextFreeDirectoryEntry() : this.getNextFreeDataEntry());

                this.setTSBBytes(myTSB, newTSB);
                this.setIsUsedByte(newTSB, "1");

                this.setBytesWithLinks(isDirectory, byteArray, newTSB);
            }
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

        FileSystem.prototype.setDataBytesWithLinksBlank = function (tsb) {
            var linkTSB = this.getTSBBytes(tsb);
            if (linkTSB != this.TSB_FILL_FULL) {
                this.setDataBytesWithLinksBlank(linkTSB);
            }
            this.setFullBlank(tsb);
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
