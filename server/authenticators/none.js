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
 * The "none" authenticator.
 *
 *
 * All authenticators must support the following functions:
 *
 * init(config, callback)
 * login(httpRequest, callback)
 * checkRequest (httpRequest, callback)
 *
 */
var SHA256  = require("../sha256");

var NoneAuthenticator = {
    sessions: {},

    init: function (config, callback) {
        // no configuration for our "none" authenticator.
        callback (true);
    },

    login: function (httpRequest, callback) {
        // No login means everyone gets a login.
        // TODO tie in source IP. 
        var sid = SHA256.hex_sha256 (new Date().getTime() + '-' + Math.random().toFixed(4));
        callback (sid);
    },

    checkRequest: function (httpRequest, callback) {
        callback (true); // first == request ok, second, if first false, why.
    }
};

exports.auth = {
    instance: function () {
        return NoneAuthenticator;
    },

    name: "None",
    clientMechanism: "None"

};

