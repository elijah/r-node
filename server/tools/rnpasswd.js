/**
 * Allows users to manipulate a R-Node user authentication file.
 *
 * Call like:
 *
 * To add or update a user:
 *
 * ./rnpasswd <password file> <user> <password>
 *
 * To remove a user:
 *
 * ./rnpasswd <password file> -d <user>
 */

var SYS = require ('sys');
var FS  = require ('fs');
var UTILS = require ('../rnodeUtils');
var SHA256  = require("../sha256");

if (process.argv.length != 5) {
    SYS.puts("Usage:");
    SYS.puts("    To add or update a user: ./rnpasswd <passwd file> <user> <password> ");
    SYS.puts("    To delete a user:        ./rnpasswd <passwd file> -d <user>");
    return;
}

var passwordFile = process.argv[2];
var arg2 = process.argv[3];
var arg3 = process.argv[4];

var users = {}

try {
    users = UTILS.loadJsonFile ("Users", passwordFile);
} catch (e) {
    SYS.debug (e);
    SYS.puts ("Warning: " + passwordFile + " is not readable. Going to create.");
}

if (!users) {
    users = {}
}

if (arg2 == "-d") {
    delete users[arg3];
} else {
    var chars = "abcdefghijklmnopqrstuvwxyz".split('');
    var salt = "";

    for (i = 0; i < 4; ++i) {
        salt += chars [Math.floor(Math.random() * 26)];
    }

    users[arg2] = {
        salt: salt,
        password: SHA256.hex_sha256 (salt + arg2 + arg3)
    }
}

// Write out the new file.
FS.writeFileSync (passwordFile, JSON.stringify (users));

SYS.puts ("Done");

