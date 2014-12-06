/**
 * Created by JP on 12/5/14.
 */
module TSOS {
    export class FileSystem {

        DATA_FILL: string = "~";
        TSB_FILL:  string = "*";

        tracks: number;
        sectors: number;
        blocks: number;
        metaBytes: number = 4;
        dataBytes: number = 60;

        constructor(tracks, sectors, blocks) {
            this.tracks  = tracks;
            this.sectors = sectors;
            this.blocks  = blocks;
        }

        //
        // Helpers
        //

        private getItem(tsb) {
            return sessionStorage.getItem(tsb);
        }

        private setItem(tsb, newBytes) {
            sessionStorage.setItem(tsb, newBytes);
            Control.updateFileSystemTable(tsb, newBytes);
        }

        private continueAsLinked(filledTsb, remainingBytes) {

        }

        //
        // Full Getters
        //

        public getFullDirectoryEntry(tsb) {
            return sessionStorage.getItem(tsb);
        }

        public getFullDataEntry(tsb) {
            return this.getFullDirectoryEntry(tsb);
        }

        //
        // Partial Getters
        //

        public getIsUsedByte(tsb) {
            return this.getItem(tsb).substr(0, 1);
        }

        public getTrackByte(tsb) {
            return this.getItem(tsb).substr(1, 1);
        }

        public getSectorByte(tsb) {
            return this.getItem(tsb).substr(2, 1);
        }

        public getBlockByte(tsb) {
            return this.getItem(tsb).substr(3, 1);
        }

        public getTSBBytes(tsb) {
            return (this.getTrackByte(tsb) + this.getSectorByte(tsb) + this.getBlockByte(tsb));
        }

        public getDataBytes(tsb) {
            return this.getItem(tsb).substr(4, this.dataBytes);
        }

        public getMasterBootRecord() {
            return this.getItem("000");
        }

        public getNextFreeDirectoryEntry() {
            var nextFree = "";

            var t = 0;
            for (var s = 0; s < this.sectors; s++) {
                for (var b = 0; b < this.blocks; b++) {
                    var tsb = Utils.tsbStr(t, s, b);
                    if (this.getIsUsedByte(tsb) == "0") {
                        nextFree = tsb;
                        break;
                    }
                }
            }

            return nextFree;
        }

        public getNextFreeDataEntry() {
            var nextFree = "";

            for (var t = 1; t < this.tracks; t++) {
                for (var s = 0; s < this.sectors; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        var tsb = Utils.tsbStr(t, s, b);
                        if (this.getIsUsedByte(tsb) == "0") {
                            nextFree = tsb;
                            break;
                        }
                    }
                }
            }

            return nextFree;
        }

        //
        // Partial Setters
        //

        public setIsUsedByte(tsb, byte) {
            var data = this.getItem(tsb);
            data[0] = byte;
            this.setItem(tsb, data);
        }

        public setTSBBytes(tsb, tsbBytes) {
            var data = this.getItem(tsb);
            var tsbArray = tsbBytes.split();
            for (var i = 1; i < 4; i++) {
                data[i] = tsbArray[i-1];
            }
            this.setItem(tsb, data);
        }

        public setDataBytes(tsb, dataBytes) {
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
            this.setDataBytes(mbrTSB, APP_NAME);
        }

        //
        // Blank Setters
        //

        public setTSBBytesBlank(tsb) {
            var data = this.getItem(tsb);
            data[1] = this.TSB_FILL; // track
            data[2] = this.TSB_FILL; // sector
            data[3] = this.TSB_FILL; // block
            this.setItem(tsb, data);
        }

        public setDataBytesBlank(tsb) {
            var data = this.getItem(tsb);
            for (var i = 4; i < data.length; i++) {
                data[i] = this.DATA_FILL;
            }
            this.setItem(tsb, data);
        }

        public setFullBlank(tsb) {
            this.setIsUsedByte(tsb, "0");
            this.setTSBBytesBlank(tsb);
            this.setDataBytesBlank(tsb);
        }
    }
}