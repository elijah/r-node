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

var SYS     = require("sys");
var CHILD   = require("child_process");

var usemutt = false;

exports.name = "/feedback";

exports.init = function (rNodeApi) {
    CHILD.exec ('which mutt', function (ok, stdout) {
        if (stdout.length > 0) {
            usemutt = true;
            rNodeApi.log (null, "Using Mutt to send feedback");
        } else {
            rNodeApi.log (null, "No Mutt found. Printing feedback to stdout");
        }
    });
    return true;
}

exports.handle = function (req, resp, sid, rNodeApi) {
    var data = '';
    req.addListener ("data", function (chunk) {
        data += chunk;
    });
    req.addListener ("end", function () {
        if (usemutt) {
            rNodeApi.log(req, 'Sending feedback via mutt. Size is ' + data.length);
            var mailer = process.createChildProcess('mutt', ['-s', '[R-Node feedback]', 'drjlove@gmail.com']);
            mailer.write(data, encoding="utf8");
            mailer.close();
        } else {
            rNodeApi.log (req, "FEEDBACK: " + data);
        }

        resp.writeHeader(200, { "Content-Type": "text/plain" });
        resp.end();
    });
    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/feedback');
}
