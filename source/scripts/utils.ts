/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        public static getDateAndTime(): string {
            var date  = new Date();
            var month = (date.getMonth() + 1).toString();
            var day   = date.getDay().toString();
            var year  = date.getFullYear().toString();
            var hours = date.getHours().toString();
            var mins  = date.getMinutes().toString();
            var secs  = date.getSeconds().toString();

            if(month.length == 1) {
                month = '0' + month;
            }
            if(day.length == 1) {
                day = '0' + day;
            }
            if(hours.length == 1) {
                hours = '0' + hours;
            }
            if(mins.length == 1) {
                mins = '0' + mins;
            }
            if(secs.length == 1) {
                secs = '0' + secs;
            }

            return hours + ":" + mins + ":" + secs + " " + month + "/" + day + "/" + year;
        }

        public static validateProgInput(regex) {
            // Loop over each one...
            for (var i = 0; i < _ProgInput.length; i++) {
                var hex = _ProgInput[i];
                // ...checking whether the regex for a valid hex code matches.
                if (!(regex.test(hex))) {
                    return false;
                }
            }

            return true;
        }

        public static hexStrToDecNum(hexStr): number {
            return parseInt(hexStr, 16);
        }

        public static decNumToHexStr(decNum): string {
            return decNum.toString(16);
        }

        /*
         * Splits the string into pairs of hex characters, and maps
         * a function to each of the pairs that translates it into
         * a decimal char code. This is then translated into its
         * corresponding ascii character (except for DATA_FILL characters,
         * which are left alone).
         */
        public static charHexStrToAsciiStr(hexStr): string {
            var strArray = this.splitByTwos(hexStr);

            strArray = strArray.map(function(hex) {
                var decCharCode = Utils.hexStrToDecNum(hex);
                if (hex == _FileSystem.DATA_FILL) {
                    return hex;
                } else {
                    return String.fromCharCode(decCharCode);
                }
            });

            return strArray.join("");
        }

        /*
         * Maps a function to every character in the ascii input string,
         * which translates the given character into hex (unless it's a
         * DATA_FILL character, which are left alone).
         */
        public static asciiStrToCharHexStr(asciiStr): string {
            var strArray = asciiStr.split("");
            strArray = strArray.map(function(ascii) {
                if (strArray.indexOf(ascii) >= _FileSystem.DATA_BEGIN) {
                    var hexCharCode = ascii.charCodeAt(0);

                    if (ascii == _FileSystem.DATA_FILL) {
                        return ascii;
                    } else {
                        return Utils.decNumToHexStr(hexCharCode);
                    }
                } else {
                    return ascii;
                }
            });

            return strArray.join("");
        }

        /* The regular isNaN function will trigger as false if our opcode has a digit as its
         * first character, and those opcodes that do all have a 'D' in them as the second character.
         * We override isNaN so that when it comes across '6D' or '8D', it knows it isn't a number.
         * We also have a situation where 00 can be a number (for memory) or a string (for the system
         * call). So we also want to give back 00 as a string by default, and then parseInt on it once
         * we know it isn't an opcode. We also parseInt on the outside, to make sure that 00 is a number
         * exactly when we need it to be.
         */
        public static isNaNOverride(val): boolean {
            return (val[1] === "D" || val === "00" || isNaN(val));
        }

        public static tsbStr(t, s, b): string {
            return ""+t+s+b;
        }

        public static contains(str, subStr): boolean {
            return (str.indexOf(subStr) > -1);
        }

        public static padProgCodeWithBlanks(codeArray): string[] {
            for (var i = codeArray.length; i < 255; i++) {
                codeArray.push("00");
            }
            return codeArray;
        }

        /*
         * Splits a string into pairs of characters. Useful for getting
         * program hex code out of a file.
         */
        public static splitByTwos(str): string[] {
            var strArray = [];
            var i = 0;
            while (i < str.length) {
                if (str.charAt(i) == _FileSystem.DATA_FILL) {
                    strArray.push(str.substr(i, 1));
                    i += 1;
                } else {
                    strArray.push(str.substr(i, 2));
                    i += 2;
                }
            }
            return strArray;
        }
    }
}