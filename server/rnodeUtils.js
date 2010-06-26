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
 * GENERAL UTILITIES
 */
var SYS = require ('sys');
var FS  = require ('fs');

/**
 * String 'beginsWith' method - 'cause it makes sense to have awesome
 * string functions.
 */
String.prototype.beginsWith = function (s) {
    if (s == null)
        return false;

    var x = this.substring (0, s.length);
    return x == s;
}

function nodelog (req, str) {
    SYS.log ( (req ? req.connection.remoteAddress : '(local)') + ': ' + str);
}

/**
 * Load a JSON file with comments, returning the result.
 */ 
function loadJsonFile (type, path, secondOption) {
    var data;
    try {
        data = FS.readFileSync (path, 'utf8');
        nodelog (null, 'Loaded ' + type + ' from \'' + path + '\'');
    } catch (e) {
        if (secondOption) {
            nodelog (null, 'Cannot load ' + type + ' from \'' + path + '\'. Trying second option \'' + secondOption + '\'');
            try {
                data = FS.readFileSync (secondOption);
                nodelog (null, 'Loaded ' + type + ' from \'' + secondOption + '\'');
            } catch (e) {
                nodelog (null, 'Cannot load ' + type + ' from \'' + secondOption + '\'. Aborting.');
                throw e;
            }
        } else {
            nodelog (null, 'Cannot load ' + type + ' from \'' + path + '\'. Continuing without this file.');
            return null;
        }
    }
    data = data.replace (/\/\/[^\n]*\n/g, '');
    return JSON.parse(data);
}

function streamFile (resolvedPath, resp, _headers, callback) {
    var headers = _headers;
    if (typeof _headers === "string") {
        headers = {
            contentType: _headers
        }
    }

    FS.stat(resolvedPath, function (err, stats) {
        if (err) {
            resp.writeHeader(404, { "Content-Type": "text/plain" });
            resp.end();
        } else {
            var realHeaders = {
              "Content-Length": stats.size,
              "Content-Type": headers.contentType,
            };
            for (var i in headers) {
                realHeaders[i] = headers[i];
            }
            if (headers.contentDisposition) {
              realHeaders["Content-Disposition"] = headers.contentDisposition;
            }
            resp.writeHeader(200, realHeaders);
            FS.readFile (resolvedPath, "binary", function (err, data) {
                if (err) {
                    resp.writeHeader(404, { "Content-Type": "text/plain" });
                    resp.end();
                } else {
                    resp.write (data, "binary");
                    resp.end();
                }

                if (callback)
                    callback (err);
            });
        }
    });
}

function getRandomString(prefix, suffix, length) {
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
    var salt = "";

    for (i = 0; i < (length || 8); ++i) {
        salt += chars [Math.floor(Math.random() * 26)];
    }

    return (prefix != null ? prefix : 'tmp_') + salt + (suffix ? suffix : '');
}

exports.getRandomString = getRandomString;
exports.loadJsonFile = loadJsonFile;
exports.streamFile = streamFile;
exports.nodelog = nodelog;
