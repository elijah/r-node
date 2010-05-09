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
 * NOTE: DEFAULT FILE HANDLER
 *
 * Looks for file on disk for any request not otherwise handled.
 */

var SYS     = require("sys");
var FS      = require("fs");
var URL     = require("url");
var UTILS   = require("../rnodeUtils");

/*
 * Provides a blurb for client code as to the R version
 */
exports.name = "<default>";

mimeTypes = {
    '.png': 'image/png',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.html': 'text/html',
    '.txt': 'text/plain'
}

mimeTypesRe = /\.([^.]+)$/;
function getMimeType (url) {
    var ft = url.match (mimeTypesRe);
    return mimeTypes[ft[0]] || 'text/plain';
}

var httpRestrict = null;

exports.init = function (rNodeApi) {

    httpRestrict = FS.realpathSync(process.cwd() + "/htdocs/");

    rNodeApi.log (null, "Current working directory is '" + process.cwd() + "', resolving to '" + 
        FS.realpathSync (process.cwd()) + "'. HTTP server will restrict to '" + httpRestrict + "'");

    return true;
}

exports.handle = function(req, resp, sid, rNodeApi) {
    var url = URL.parse (req.url, true);
    var file = "htdocs" + req.url.split('?')[0];
    rNodeApi.log(req, 'Getting file: \'' + file + '\'');
    FS.realpath(file, function (err, resolvedPath) {
        if (err) {
            rNodeApi.log(req, 'error getting canonical path for ' + resolvedPath);
            resp.writeHeader(404, { "Content-Type": "text/plain" });
            resp.end();
        } else {
            if (!httpRestrict || !resolvedPath.beginsWith (httpRestrict)) {
                rNodeApi.log(req, 'resolved path \'' + resolvedPath + '\' not within right directory.');
                resp.writeHeader(404, { "Content-Type": "text/plain" });
                resp.end();
            } else {
                UTILS.streamFile (resolvedPath, resp, getMimeType (file));
            }
        }
    });
    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return true; // Can (try to) handle anything!
}
