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
        FileSystem.prototype.getDirectorySize = function () {
            return this.sectors * this.blocks;
        };

        FileSystem.prototype.getDataSize = function () {
            return (this.tracks - 1) * this.sectors * this.blocks;
        };

        /*
        * The best function I've ever written. Higher ordered,
        * it will loop through my whole file system, and perform
        * some action based on the TSB at each step along the way.
        * If we're searching for something, it will be assigned to
        * foundThing and returned, otherwise it will do the void-y
        * thing.
        */
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

        /*
        * True if the TSB is a directory entry, but is not the Master Boot Record.
        */
        FileSystem.prototype.isDirectoryNotMBR = function (tsb) {
            return (tsb[0] == "0" && tsb != "000");
        };

        /*
        * True if the TSB is a directory entry.
        */
        FileSystem.prototype.isDirectory = function (tsb) {
            return (tsb[0] == "0");
        };

        /*
        * True if the entry is not used.
        */
        FileSystem.prototype.isNotUsed = function (tsb) {
            return (_FileSystem.getIsUsedByte(tsb) == "0");
        };

        //
        // Helpers
        //
        /*
        * Interface for sessionStorage's getItem. If it got nothing, then we must
        * be building the file system from scratch for the first time, so return
        * a brand new empty FS entry.
        */
        FileSystem.prototype.getItem = function (tsb) {
            var tempGotten = sessionStorage.getItem(tsb);
            return (tempGotten != undefined) ? tempGotten.replace(",", "") : TSOS.Control.buildEmptyEntry();
        };

        /*
        * Interface for sessionStorage's setItem. Will first set the destination
        * as blank, so we don't have any stragglers (and because of paranoia). Also
        * updates the HTML table.
        */
        FileSystem.prototype.setItem = function (tsb, newBytes) {
            this.specialSetItemBlank(tsb);
            sessionStorage.setItem(tsb, newBytes);
            TSOS.Control.updateFileSystemTable(tsb, newBytes);
        };

        /*
        * A modification of setItemBlank that does not rely on using getItem,
        * because it could throw ugly exceptions.
        */
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

        /*
        * Cuts down the length of the data bytes in a FS entry so there are no
        * spare DATA_FILL characters hanging off the end.
        */
        FileSystem.prototype.enforceDataLength = function (text) {
            return text.substr(0, this.metaBytes + this.dataBytes);
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

        /*
        * Gets the data bytes for an entry, and possibly strings it together
        * with the data bytes from the next linked entries, if the link exists.
        */
        FileSystem.prototype.getDataBytesWithLinks = function (tsb) {
            var firstPiece = this.getDataBytes(tsb);
            var nextTSB = this.getTSBBytes(tsb);
            if (nextTSB != this.TSB_FILL_FULL) {
                return firstPiece + this.getDataBytesWithLinks(nextTSB);
            } else {
                return firstPiece;
            }
        };

        FileSystem.prototype.getMasterBootRecord = function () {
            return this.getItem("000");
        };

        /*
        * Finds the first unused FS entry that is a directory (not the MBR).
        */
        FileSystem.prototype.getNextFreeDirectoryEntry = function () {
            return this.loopThroughFSDoing(function (tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && _FileSystem.isNotUsed(tsb)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        };

        /*
        * Finds the first unused FS entry that is in the data tracks.
        */
        FileSystem.prototype.getNextFreeDataEntry = function () {
            return this.loopThroughFSDoing(function (tsb) {
                if (!_FileSystem.isDirectory(tsb) && _FileSystem.isNotUsed(tsb)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        };

        /*
        * Finds the first directory entry whose data bytes match the file name.
        */
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

        /*
        * Holy shit.
        *
        * First determines whether we need to spill over into another entry.
        * If we do, defer to setBytesWithLinks.
        *
        * Next, gets the TSB that the given bytes will be written into.
        * This could either be supplied by the caller, or picked from the
        * remaining empty entries. This can also be in either the directory
        * track or data tracks.
        *
        * Then we fill in input bytes into the existing entry, one character
        * at a time (ignoring the meta bytes). We translate that into hex,
        * enforce that it doesn't have dangling DATA_FILL characters, and
        * sets the meta bytes before finally finishing.
        */
        FileSystem.prototype.setBytes = function (isDirectory, bytes, tsb) {
            var byteArray = bytes.split("");

            // If we don't need to do any linking...
            if (byteArray.length <= this.dataBytes) {
                var myTSB = (tsb != undefined) ? tsb : ((isDirectory) ? this.getNextFreeDirectoryEntry() : this.getNextFreeDataEntry());

                var dataArray = this.getItem(myTSB).split("");

                for (var s = this.DATA_BEGIN; s < (byteArray.length + this.DATA_BEGIN); s++) {
                    dataArray[s] = byteArray[s - this.DATA_BEGIN];
                }

                var finalData = this.enforceDataLength(TSOS.Utils.asciiStrToCharHexStr(dataArray.join("")));
                this.setItem(myTSB, finalData);
                this.setIsUsedByte(myTSB, "1");
            } else {
                this.setBytesWithLinks(isDirectory, byteArray, tsb);
            }
        };

        /*
        * But for real, holy shit.
        *
        * A lot of the same stuff as in setBytes, but this time we know we will
        * need to spill into another entry. So we fill in the input bytes up until
        * the space limit of the entry itself, get the remaining section of the input,
        * and test whether we continue into another entry based on its length.
        *
        * I don't know whether to be impressed with the amount of work this function
        * and its predecessor does, or upset that I made it so against the philosophy
        * of Don't Repeat Yourself (DRY). Or upset that I made it so against the philosophy
        * of Don't Repeat Yourself (DRY).
        */
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

            var realFinalData = this.enforceDataLength(TSOS.Utils.asciiStrToCharHexStr(finalData));
            this.setItem(myTSB, realFinalData);
            this.setIsUsedByte(myTSB, "1");

            // If there's still some left...
            if (byteArray.length > 0) {
                var newTSB = ((isDirectory) ? this.getNextFreeDirectoryEntry() : this.getNextFreeDataEntry());

                this.setTSBBytes(myTSB, newTSB);
                this.setIsUsedByte(newTSB, "1");

                this.setBytesWithLinks(isDirectory, byteArray, newTSB);
            }
        };

        /*
        * Sets the master boot record to contain the name of the operating system.
        */
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

        /*
        * Uses the above and below functions to set an entry blank, but
        * follows the chain of linked entries if it needs to.
        */
        FileSystem.prototype.setDataBytesWithLinksBlank = function (tsb) {
            var linkTSB = this.getTSBBytes(tsb);
            if (linkTSB != this.TSB_FILL_FULL) {
                this.setDataBytesWithLinksBlank(linkTSB);
            }
            this.setFullBlank(tsb);
        };

        /*
        * Sets an entire entry to be blank.
        */
        FileSystem.prototype.setFullBlank = function (tsb) {
            this.setIsUsedByte(tsb, "0");
            this.setTSBBytesBlank(tsb);
            this.setDataBytesBlank(tsb);
        };
        return FileSystem;
    })();
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
