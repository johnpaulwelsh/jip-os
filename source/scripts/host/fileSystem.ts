/**
 * Created by JP on 12/5/14.
 */
module TSOS {
    export class FileSystem {

        DATA_FILL:  string = "~";
        TSB_FILL:   string = "*";
        DATA_BEGIN: number = 4;

        tracks:  number;
        sectors: number;
        blocks:  number;
        metaBytes: number = 4;
        dataBytes: number = 60;

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

        //
        // Helpers
        //

        private getItem(tsb): string {
            var tempGotten = sessionStorage.getItem(tsb);
            return (tempGotten != undefined) ? tempGotten.replace(",", "") : Control.buildEmptyEntry();
        }

        private setItem(tsb, newBytes): void {
            sessionStorage.setItem(tsb, newBytes);
            Control.updateFileSystemTable(tsb, newBytes);
        }

        //
        // Getters
        //

        public getIsUsedByte(tsb): string {
            return this.getItem(tsb).substr(0, 1);
        }

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

        public getDataBytes(tsb): string {
            return this.getItem(tsb).substr(4, this.dataBytes);
        }

        public getMasterBootRecord(): string {
            return this.getItem("000");
        }

        public getNextFreeDirectoryEntry(): string {
            return this.loopThroughFSDoing(function(tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && _FileSystem.getIsUsedByte(tsb) == "0") {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        }

        public getNextFreeDataEntry(): string {
            return this.loopThroughFSDoing(function(tsb) {
                if (tsb[0] != "0" && _FileSystem.getIsUsedByte(tsb) == "0") {
                    _FileSystem.isDoneLooping = true;
                    return tsb;
                }
            });
        }

        public getDirectoryWithName(fileName): string {
            debugger;
            return this.loopThroughFSDoing(function(tsb) {
                if (_FileSystem.isDirectoryNotMBR(tsb) && Utils.contains(_FileSystem.getDataBytes(tsb), fileName)) {
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
            var myTSB = (tsb != undefined) ?
                        tsb :
                        ((isDirectory) ?
                          this.getNextFreeDirectoryEntry() :
                          this.getNextFreeDataEntry());


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

        public setFullBlank(tsb) {
            this.setIsUsedByte(tsb, "0");
            this.setTSBBytesBlank(tsb);
            this.setDataBytesBlank(tsb);
        }
    }
}