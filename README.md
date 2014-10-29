TSOS-2014
=========

This is my Fall 2014 Operating Systems class project.

See http://johnpaulwelsh.github.io/jip-os/ for a demonstration.

See http://www.labouseur.com/courses/os/ for details.

See https://github.com/labouseur/TSOS-2014 for full readme.


Notes for Alan (and others who are interested)
==============================================

(10-29-2014) To distinguish between fixes from Project 2 and new stuff for Project 3, the following is a breakdown of where my Project 2 fixes took place.

Running a program was fixed at this commit. I also added support for an interrupt being thrown when encountering an invalid opcode. This interrupt also ends the program: https://github.com/johnpaulwelsh/jip-os/commit/9c01ecae32a25e3d4fc2af23aaff878a3e82de75 .

(10-14-2014) To distinguish between fixes from Project 1 and new stuff for Project 2, the following is a breakdown of where my Project 1 fixes took place.

Console scrolling was fixed at this commit: https://github.com/johnpaulwelsh/jip-os/commit/1cdc49e01d6a924a5d3b1db06f68ef3bf82ce134 .

Caret symbol (^) was fixed at this commit: https://github.com/johnpaulwelsh/jip-os/commit/702152264c24500303dfda7fe8de05c2a34c22bf (please ignore the code for line wrapping at this commit: it was really bad and I removed it the very next commit).


(9-23-2014) Some would say that command history (with up and down arrow keys) is buggy,
but I prefer to think of it as having unique features.
