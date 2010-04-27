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

/*
 * Provides a blurb for client code as to the R version
 */
exports.name = "/recent-changes.txt";

exports.handle = function(req, resp, sid, rNodeApi) {
    CHILD.exec ('git whatchanged --format="%ar:\n%s" | perl -n -e \'print $_ unless m/^:/\'', function (err, stdout, stderr) {
        if (err) {
            rNodeApi.log(req, 'Error generating recent changes file: ' + stderr);
            resp.writeHeader(500, { "Content-Type": "text/plain" });
            resp.end();
        } else {
            resp.writeHeader(200, {
              "Content-Length": stdout.length,
              "Content-Type": "text/plain"
            });
            resp.write (stdout);
            resp.end();
        }
    });
    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/recent-changes.txt');
}
