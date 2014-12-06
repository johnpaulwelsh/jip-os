/**
 * Created by JP on 12/5/14.
 */
module TSOS {
    export class FileSystem {

        DATA_FILL: string = "~";
        TSB_FILL: string  = "*";

        tracks: number;
        sectors: number;
        blocks: number;

        constructor(tracks, sectors, blocks) {
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
        }

        //
        // Helpers
        //

        public getItem(tsb) {
            return sessionStorage.getItem(tsb);
        }

        public setItem(tsb, newBytes) {
            sessionStorage.setItem(tsb, newBytes);
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
            return this.getItem(tsb).substr();
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

        }

        public setMasterBootRecord() {
            this.setIsUsedByte("000", "1");
            this.setTSBBytesBlank("000");
            this.setDataBytes("000", "jip-os");
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

        public setFullDirectoryBlank(tsb) {
            this.setIsUsedByte(tsb, "0");
            this.setTSBBytesBlank(tsb);
            this.setDataBytesBlank(tsb);
        }

        public setFullDataBlank(tsb) {
            this.setFullDirectoryBlank(tsb);
        }
    }
}