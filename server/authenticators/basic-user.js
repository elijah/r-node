/*
    Copyright 2010 Jamie Love

    This file is part of the "R-Node Server".

    R-Node Server is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2.1 of the License, or
    (at your option) any later version.

    R-Node Server is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with R-Node Server.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * The "basic-user" authenticator.
 *
 * Authenticates a user
 * All authenticators must support the following functions:
 *
 * init(config, callback)
 * login(httpRequest, callback)
 * checkRequest (httpRequest, callback)
 *
 */
var URL     = require("url");
var SYS     = require("sys");
var SHA256  = require("../sha256");
var UTILS   = require("../rnodeUtils");

function BasicUserAuthenticator () {
    this.sessions = {};
    this.users = null;
    this.sessionTimeout = -1;
}

BasicUserAuthenticator.prototype.init = function (config, callback) {
    // Configuration for basic user configuration - the file of users
    // and passwords:
    this.usersFile = config.usersFile;
    try {
        this.users = UTILS.loadJsonFile ("Users", this.usersFile);
    } catch (e) {
        return callback (false);
    }

    this.sessionTimeout = config.sessionTimeout || -1;
    callback (true);
};

BasicUserAuthenticator.prototype.login = function (httpRequest, callback) {
    // Lets see what username/password the user has given us
    // username and password are given in the URL parameters.
    // we assume HTTPS would be used to secure the link for this
    // data.
    //
    var url = URL.parse (httpRequest.url, true);
    if (!url.query || !url.query.username || !url.query.password) {
        SYS.debug ('BasicUserAuthenticator: No username or password URL parameters. Cannot authenticate.');
        return callback (null); // cannot log in. - login fail.
    }

    var username = url.query.username;
    var password = url.query.password;

    // reload the users file.
    try {
        var u = UTILS.loadJsonFile ("Users", this.usersFile);
        this.users = u;
    } catch (e) {
        SYS.debug ('Cannot reload users file. Using historical file.');
    }

    if (this.users == null) {
        SYS.debug ('BasicUserAuthenticator: No users file. Cannot authenticate');
        return callback (null); // cannot log in. - login fail.
    }

    if (!this.users[username]) {
        SYS.debug ('BasicUserAuthenticator: User "' + username + '" unknown.');
        return callback (null); // cannot log in. - login fail.
    }

    var u = this.users[username];
    var encryptedString = SHA256.hex_sha256 (u.salt + username + password);
    
    if (encryptedString != u.password) {
        SYS.debug ('BasicUserAuthenticator: Password mismatch for "' + username + '"');
        return callback (null); // cannot log in. - login fail.
    }

    var sid = SHA256.hex_sha256 (new Date().getTime() + '-' + Math.random().toFixed(4));
    this.sessions[sid] = {
        lastAccessTime: new Date()
    }

    callback (sid);
};

BasicUserAuthenticator.prototype.checkRequest = function (httpRequest, callback) {
    var url = URL.parse (httpRequest.url, true);
    if (!url.query || !url.query.sid) {
        SYS.debug ('BasicUserAuthenticator: No sid. checkRequest fail.');
        return callback (false); 
    }

    var sid = url.query.sid;

    if (!this.sessions[sid]) {
        SYS.debug ('BasicUserAuthenticator: sid "' + sid + '" unknown . checkRequest fail.');
        return callback (false); 
    }

    if (this.sessionTimeout > 0 && 
            (new Date().getTime() - this.sessions[sid].lastAccessTime.getTime()) / (60 * 1000) > this.sessionTimeout) {
        SYS.debug ('BasicUserAuthenticator: session timeout.');
        return callback (false, "SESSION TIMEOUT"); 
    }

    callback (true); 
};

exports.auth = {
    instance: function () {
        return new BasicUserAuthenticator();
    },

    name: "BasicUserAuthenticator",
    clientMechanism: "UserAndPassword"

};


