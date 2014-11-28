/**
 * Created by John Paul Welsh on 11/24/14.
 */

module TSOS {

    export class DeviceDriverFileSystem extends DeviceDriver {

        constructor() {
            super(this.krnFileSysDriverEntry, this.krnFileSysDispatchAction);
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
                default:
                    break;
            }
        }

        public createFile(params) {

        }

        public readFile(params) {

        }

        public writeFile(params) {

        }

        public deleteFile(params) {

        }

        public format(params) {

        }

        public listFiles() {

        }

        public createHTML() {
            Control.createFileSystemTable();
        }

        public updateHTML() {

        }
    }
}