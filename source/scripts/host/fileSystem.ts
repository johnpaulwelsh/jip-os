/**
 * Created by JP on 12/5/14.
 */
module TSOS {
    export class FileSystem {

        DATA_FILL:     string = "~";
        TSB_FILL:      string = "*";
        TSB_FILL_FULL: string = "***";

        DATA_BEGIN: number = 4;

        tracks:  number;
        sectors: number;
        blocks:  number;
        metaBytes: number = 4;
        dataBytes: number = 120;

        isDoneLooping: boolean = false;

        constructor(tracks, sectors, blocks) {
            this.tracks  = tracks;
            this.sectors = sectors;
            this.blocks  = blocks;
        }

        public getDirectorySize(): number {
            return this.sectors * this.blocks;
        }

        public getDataSize(): number {
            return (this.tracks-1) * this.sectors * this.blocks;
        }

        public loopThroughFSDoing(func) {
            var foundThing = null;

            for (var t = 0; t < _FileSystem.tracks; t++) {
                for (var s = 0; s < _FileSystem.sectors; s++) {
                    for (var b = 0; b < _FileSystem.blocks; b++) {
                        var tsb = Utils.tsbStr(t, s, b);
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
        }

        public isDirectoryNotMBR(tsb): boolean {
            return (tsb[0] == "0" && tsb != "000");
        }

        public isDirectory(tsb): boolean {
            return (tsb[0] == "0");
        }

        public isNotUsed(tsb): boolean {
            return (_FileSystem.getIsUsedByte(tsb) == "0");
        }

        //
        // Helpers
        //

        private getItem(tsb): string {
            var tempGotten = sessionStorage.getItem(tsb);
            return (tempGotten != undefined) ? tempGotten.replace(",", "") : Control.buildEmptyEntry();
        }

        private setItem(tsb, newBytes): void {
            this.specialSetItemBlank(tsb);
            sessionStorage.setItem(tsb, newBytes);
            Control.updateFileSystemTable(tsb, newBytes);
        }

        private specialSetItemBlank(tsb): void {
            var data = this.getItem(tsb).split("");

            data[0] = "0";
            data[1] = this.TSB_FILL;
            data[2] = this.TSB_FILL;
            data[3] = this.TSB_FILL;
            for (var i = 4; i < this.dataBytes; i++) {
                data[i] = this.DATA_FILL;
            }

            sessionStorage.setItem(tsb, data.join(""));
        }

        //
        // Getters
        //

        public getIsUsedByte(tsb): string {
            return this.getItem(tsb).substr(0, 1);
        }

        public getTrackByte(tsb): string {
            return this.getItem(tsb).substr(1, 1);
        }

        public getSectorByte(tsb): string {
            return this.getItem(tsb).substr(2, 1);
        }

        public getBlockByte(tsb): string {
            return this.getItem(tsb).substr(3, 1);
        }

        public getTSBBytes(tsb): string {
            return (this.getTrackByte(tsb) + this.getSectorByte(tsb) + this.getBlockByte(tsb));
        }

        public getDataBytes(tsb): string {
            var ascii = Utils.charHexStrToAsciiStr(this.getItem(tsb).substr(4, this.dataBytes));
            return ascii;
        }

        public getDataBytesWithLinks(tsb): string {
            var firstPiece = this.getDataBytes(tsb);
            var nextTSB = this.getTSBBytes(tsb);
            if (nextTSB != this.TSB_FILL_FULL) {
                return firstPiece + this.getDataBytesWithLinks(nextTSB);
            } else {
                return firstPiece;
            }
        }

        public getMasterBootRecord(): string {
            return this.getItem("000");
        }

        public getNextFreeDirectoryEntry(): string {
            return this.loopThroughFSDoing(function(tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && _FileSystem.isNotUsed(tsb)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        }

        public getNextFreeDataEntry(): string {
            return this.loopThroughFSDoing(function(tsb) {
                if (!_FileSystem.isDirectory(tsb) && _FileSystem.isNotUsed(tsb)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        }

        public getDirectoryWithName(fileName): string {
            return this.loopThroughFSDoing(function(tsb) {
                var asciiName = _FileSystem.getDataBytes(tsb).replace(/~/g, "");
                if (_FileSystem.isDirectoryNotMBR(tsb) && Utils.contains(asciiName, fileName)) {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        }

        //
        // Setters
        //

        public setIsUsedByte(tsb, byte) {
            var data = this.getItem(tsb).split("");
            data[0] = byte;
            this.setItem(tsb, data.join(""));
        }

        public setTSBBytes(tsb, tsbBytes) {
            var data = this.getItem(tsb).split("");
            var tsbArray = tsbBytes.split();
            for (var i = 1; i < this.metaBytes; i++) {
                data[i] = tsbArray[i - 1];
            }
            this.setItem(tsb, data.join(""));
        }

        public setBytes(isDirectory, bytes, tsb?) {
            var byteArray = bytes.split("");

            // If we don't need to do any linking...
            if (byteArray.length <= this.dataBytes) {

                var myTSB = (tsb != undefined) ?
                            tsb :
                                ((isDirectory) ?
                                this.getNextFreeDirectoryEntry() :
                                this.getNextFreeDataEntry());


                var dataArray = this.getItem(myTSB).split("");

                for (var s = this.DATA_BEGIN; s < (byteArray.length + this.DATA_BEGIN); s++) {
                    dataArray[s] = byteArray[s - this.DATA_BEGIN];
                }

                var finalData = Utils.asciiStrToCharHexStr(dataArray.join(""));
                this.setItem(myTSB, finalData);
                this.setIsUsedByte(myTSB, "1");

            } else {
                this.setBytesWithLinks(isDirectory, byteArray, tsb);
            }
        }

        public setBytesWithLinks(isDirectory, byteArray, tsb?) {
            var myTSB = (tsb != undefined) ?
                        tsb :
                            ((isDirectory) ?
                            this.getNextFreeDirectoryEntry() :
                            this.getNextFreeDataEntry());

            var dataArray = this.getItem(myTSB).split("");

            for (var s = this.DATA_BEGIN; s < (this.dataBytes + this.DATA_BEGIN); s++) {
                dataArray[s] = byteArray[s - this.DATA_BEGIN];
            }

            // Get the rest of the string
            byteArray = byteArray.slice(this.dataBytes);

            var finalData = dataArray.join("");

            if (byteArray.length <= 0) {
                // TODO: this writes more than it should, so formatting doesn't overwrite everything
                for (var i = finalData.length; i < (this.dataBytes + this.DATA_BEGIN); i++) {
                    finalData += this.DATA_FILL;
                }
            }

            var realFinalData = Utils.asciiStrToCharHexStr(finalData);
            this.setItem(myTSB, realFinalData);
            //this.setItem(myTSB, finalData);
            this.setIsUsedByte(myTSB, "1");

            // If there's still some left...
            if (byteArray.length > 0) {
                var newTSB = ((isDirectory) ?
                        this.getNextFreeDirectoryEntry() :
                        this.getNextFreeDataEntry());

                this.setTSBBytes(myTSB, newTSB);
                this.setIsUsedByte(newTSB, "1");

                this.setBytesWithLinks(isDirectory, byteArray, newTSB);
            }
        }

        public setMasterBootRecord() {
            var mbrTSB = "000";
            this.setIsUsedByte(mbrTSB, "1");
            this.setTSBBytesBlank(mbrTSB);
            this.setBytes(true, APP_NAME, mbrTSB);
        }

        //
        // Blank Setters
        //

        public setTSBBytesBlank(tsb) {
            var data = this.getItem(tsb).split("");
            data[1] = this.TSB_FILL; // track
            data[2] = this.TSB_FILL; // sector
            data[3] = this.TSB_FILL; // block
            this.setItem(tsb, data.join(""));
        }

        public setDataBytesBlank(tsb) {
            var data = this.getItem(tsb).split("");
            for (var i = 4; i < this.dataBytes; i++) {
                data[i] = this.DATA_FILL;
            }
            this.setItem(tsb, data.join(""));
        }

        public setDataBytesWithLinksBlank(tsb) {
            var linkTSB = this.getTSBBytes(tsb);
            if (linkTSB != this.TSB_FILL_FULL) {
                this.setDataBytesWithLinksBlank(linkTSB);
            }
            this.setFullBlank(tsb);
        }

        public setFullBlank(tsb) {
            this.setIsUsedByte(tsb, "0");
            this.setTSBBytesBlank(tsb);
            this.setDataBytesBlank(tsb);
        }
    }
}