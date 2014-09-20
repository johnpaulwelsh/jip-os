///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        public dingo;

        constructor() {

        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // crawl
            sc = new ShellCommand(this.shellCrawl,
                                  "crawl",
                                  "<number> - Displays the Star Wars opening crawl for the <number>th movie (1-6).");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");

            this.commandList[this.commandList.length] = sc;
            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date and time.");

            this.commandList[this.commandList.length] = sc;
            // load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- Currently, validates program input as hex.");

            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Displays a user-provided status to the console and status bar.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                  "- Displays the location of your computer.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellDate(args) {
            _StdOut.putText("Time and date, from TD Bank: " + Utils.getDateAndTime());
        }

        public shellLoad(args) {
            // Casting DOM elements === Joseph Stalin
            _ProgInput = Control.getProgramInput();
            var regex = new RegExp("^[A-Fa-f0-9]{2}$");

            // If we have any hex codes to check (ensuring the first one isn't blank,
            // which happens when you split the text from an empty textarea)...
            if (_ProgInput.length > 0 && _ProgInput[0] != "") {
                var allValid = true;

                // Loop over each one...
                for (var i in _ProgInput) {
                    var hex = _ProgInput[i];
                    console.log(regex.test(hex));

                    // Checking whether the regex for a valid hex code matches
                    if (!(regex.test(hex))) {
                        allValid = false;
                        break;
                    }
                }

                if (allValid) {
                    _StdOut.putText("Loaded valid hexadecimal program code.");
                } else {
                    _StdOut.putText("Not a valid set of hex codes.");
                }

            } else {
                _StdOut.putText("No user program input to load.");
            }
        }

        public shellCrawl(args) {
            var crawl = "";

            switch (args[0]) {
                case "1":
                    crawl = "Turmoil has engulfed the Galactic Republic. The taxation of trade routes to outlying star \
                        systems is in dispute. Hoping to resolve the matter with a blockade of deadly battleships, the \
                        greedy Trade Federation has stopped all shipping to the small planet of Naboo. While the \
                        congress of the Republic endlessly debates this alarming chain of events, the Supreme \
                        Chancellor has secretly dispatched two Jedi Knights, the guardians of peace and justice in the \
                        galaxy, to settle the conflict....";
                    break;
                case "2":
                    crawl = "There is unrest in the Galactic Senate. Several thousand solar systems have declared \
                        their intentions to leave the Republic. This separatist movement, under the leadership of the \
                        mysterious Count Dooku, has made it difficult for the limited number of Jedi Knights to \
                        maintain peace and order in the galaxy. Senator Amidala, the former Queen of Naboo, is \
                        returning to the Galactic Senate to vote on the critical issue of creating an ARMY OF THE \
                        REPUBLIC to assist the overwhelmed Jedi....";
                    break;
                case "3":
                    crawl = "War! The Republic is crumbling under attacks by the ruthless Sith Lord, Count Dooku. \
                        There are heroes on both sides. Evil is everywhere. In a stunning move, the fiendish droid \
                        leader, General Grievous, has swept into the Republic capital and kidnapped Chancellor \
                        Palpatine, leader of the Galactic Senate. As the Separatist Droid Army attempts to flee the \
                        besieged capital with their valuable hostage, two Jedi Knights lead a desperate mission to \
                        rescue the captive Chancellor....";
                    break;
                case "4":
                    crawl = "It is a period of civil war. Rebel spaceships, striking from a hidden base, have won \
                        their first victory against the evil Galactic Empire. During the battle, Rebel spies managed \
                        to steal secret plans to the Empire’s ultimate weapon, the DEATH STAR, an armored space \
                        station with enough power to destroy an entire planet. Pursued by the Empire’s sinister agents, \
                        Princess Leia races home aboard her starship, custodian of the stolen plans that can save her \
                        people and restore freedom to the galaxy....";
                    break;
                case "5":
                    crawl = "It is a dark time for the Rebellion. Although the Death Star has been destroyed, Imperial \
                        troops have driven the Rebel forces from their hidden base and pursued them across the galaxy. \
                        Evading the dreaded Imperial Starfleet, a group of freedom fighters led by Luke Skywalker has \
                        established a new secret base on the remote ice world of Hoth. The evil lord Darth Vader, \
                        obsessed with finding young Skywalker, has dispatched thousands of remote probes into the far \
                        reaches of space....";
                    break;
                case "6":
                    crawl = "Luke Skywalker has returned to his home planet of Tatooine in an attempt to rescue his \
                        friend Han Solo from the clutches of the vile gangster Jabba the Hutt. Little does Luke know \
                        that the GALACTIC EMPIRE has secretly begun construction on a new armored space station even \
                        more powerful than the first dreaded Death Star. When completed, this ultimate weapon will \
                        spell certain doom for the small band of rebels struggling to restore freedom to the galaxy...";
                    break;
                default:
                    _StdOut.putText("Invalid movie number. There are only 6... for now.");
                    break;
            }

            _StdOut.putText(crawl);
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellStatus(args) {
            if (args.length > 0) {
                var status = args[0];
                _StdOut.putText("Status: " + status + ".");
                Control.setStatusMess(status);
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellWhereAmI(args) {
            _StdOut.putText("Tatooine, Tatoo System, Arkanis Sector, Outer Rim Territories.");
        }

    }
}
