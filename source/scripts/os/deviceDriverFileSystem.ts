/**
 * Created by John Paul Welsh on 11/24/14.
 */

module TSOS {

    export class DeviceDriverFileSystem extends DeviceDriver {

        tracks:    number;
        sectors:   number;
        blocks:    number;
        metaBytes: number;
        dataBytes: number;
        isDirectoryFull: boolean;
        isDataFull:      boolean;

        constructor() {
            super(this.krnFileSysDriverEntry, this.krnFileSysDispatchAction);
            this.tracks    = FS_NUM_TRACKS;
            this.sectors   = FS_NUM_SECTORS;
            this.blocks    = FS_NUM_BLOCKS;
            this.metaBytes = FS_META_BYTES;
            this.dataBytes = FS_DATA_BYTES;
            this.isDirectoryFull = false;
            this.isDataFull      = false;

            this.createHTML();
        }

        public krnFileSysDriverEntry() {
            this.status = "Loaded";
        }

        public krnFileSysDispatchAction(params) {
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
                case DISK_LIST:
                    this.listFiles();
                    break;
                default:
                    break;
            }
        }

        public createFile(params) {
            _StdOut.putText("File created");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public readFile(params) {
            _StdOut.putText("File read");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public writeFile(params) {
            _StdOut.putText("File written");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public deleteFile(params) {
            _StdOut.putText("File deleted");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public format(params) {
            _StdOut.putText("Disk formatted");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public listFiles() {
            _StdOut.putText("Files listed");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        public createHTML() {
            Control.createFileSystemTable();
            Control.fillInMetaBytes();
        }

        public updateHTML(t, s, b, startByte, length, newText) {
            Control.updateFileSysAtLoc(t, s, b, startByte, length, newText);
        }
    }
}