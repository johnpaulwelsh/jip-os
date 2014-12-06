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

        public initialize() {
            // Loop through whole file system, setting everything to blank
            for (var t = 0; t < _FileSystem.tracks; t++) {
                for (var s = 0; s < _FileSystem.sectors; s++) {
                    for (var b = 0; b < _FileSystem.blocks; b++) {
                        var tsb = Utils.tsbStr(t, s, b);
                        if (t == 0) {
                            _FileSystem.setFullDirectoryBlank(tsb);
                        } else {
                            _FileSystem.setFullDataBlank(tsb);
                        }

                    }
                }
            }

            // After it's all been cleared, set the Master Boot Record
            _FileSystem.setMasterBootRecord();
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

        public updateFileSystem(t, s, b, startByte, length, newText) {
            _FileSystem.updateFileSysAtLoc(t, s, b, startByte, length, newText);
        }
    }
}