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
var QUERY   = require ("querystring");
var URL     = require("url");
var FS      = require("fs");
var MPART   = require("../lib/multipart/multipart");
var UTILS   = require("../rnodeUtils");

exports.name = "/R/upload-via-web-service";

exports.init = function (rNodeApi) {
    rNodeApi.addRestrictedUrl (/^\/R\/upload-via-web-service/);
}

exports.handle = function (req, resp, sid, rNodeApi) {
    req.setBodyEncoding('utf8');

    var config = rNodeApi.config.features.fileUpload;

    if (!config.enable) {
        rNodeApi.log(req, "File upload disabled. Not allowing upload.");
        var ret = {
            success: false
            , message: 'File uploading disabled.'
        };
        resp.writeHeader(200, { "Content-Type": "text/html" });
        resp.write (JSON.stringify (ret));
        resp.end();
        return;
    }

    var maxLength = config.maxFileSize || (1024 * 1024);
    if (maxLength.search(/[^0-9]/) > 0) {
        var parts = maxLength.match(/^([0-9]+)([bkmg])/);
        switch (parts[2]) {
            case "k": maxLength = parts[1] * 1024; break;
            case "m": maxLength = parts[1] * 1024 * 1024; break;
            case "g": maxLength = parts[1] * 1024 * 1024 * 1024; break;
            case "b": maxLength = parts[1] * 1; break;
        }
    }

    rNodeApi.log(req, 'Max file length is: ' + maxLength);

    // Get a temporary file
    var filename = (config.directory || "/tmp") + "/" + UTILS.getRandomString();
    var fd = FS.openSync (filename, "w");
    var receivedLength = 0;
    var cancelled = false;

    if (!fd) {
        var ret = {
            success: false
            , message: 'Cannot save file to disk.'
        };
        resp.writeHeader(200, { "Content-Type": "text/html" });
        resp.write (JSON.stringify (ret));
        resp.end();
        return;
    }

    /*
     * TODO
    var sourceUrl = URL.parse (...);

    var source = http.createClient(80, 'www.google.com');
    var request = google.request('GET', '/', {'host': 'www.google.com'});

    request.addListener('response', function (response) {
            sys.puts('STATUS: ' + response.statusCode);
            sys.puts('HEADERS: ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');
            response.addListener('data', function (chunk) {
                sys.puts('BODY: ' + chunk);
                });
            });
    request.end();
    */

    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/R/upload-via-web-service');
}
