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

exports.name = "/R/upload";

exports.init = function (rNodeApi) {
    rNodeApi.addRestrictedUrl (/^\/R\/upload/);
}

function getRandomString(prefix, suffix) {
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789".split('');
    var salt = "";

    for (i = 0; i < 8; ++i) {
        salt += chars [Math.floor(Math.random() * 26)];
    }

    return (prefix ? prefix : 'tmp_') + salt + (suffix ? suffix : '');
}


/**
 * File upload - on error we actually send back a 200 file, with the error
 * as a message. This is required because of how ExtJS deals with file upload
 */
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
    var filename = (config.directory || "/tmp") + "/" + getRandomString();
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

    var formData = {};
    var lastFormField = '';
    var parser = MPART.parser();

    // I'm not 100% sure how the multipart library is supposed to be used
    // but I had lots of trouble to get it to work. I finally found I could
    // make it parse if I gave it the boundary exactly as it expected.
    // Hence this line:
    parser.boundary = '--' + req.headers['content-type'].match(/boundary=(.+)$/)[1];

    req.addListener ("data", function (chunk) {
        if (cancelled) 
            return;

        receivedLength += chunk.length;

        if (receivedLength > maxLength) {
            rNodeApi.log (req, "Max upload file length exceeded. Cancelling upload.");
            var ret = {
                success: false
                , message: 'Maximum file size exceeded.'
            };
            resp.writeHeader(200, { "Content-Type": "text/html" });
            resp.write (JSON.stringify (ret));
            resp.end();
            cancelled = true;
            return;
        }

        rNodeApi.log(req, 'Received part of data: ' + chunk.length);
        parser.write (chunk);
    });

    req.addListener ("end", function () {
        rNodeApi.log(req, 'Received uploaded file. Size is ' + receivedLength);
        var r = rNodeApi.getRConnection(sid, false);

        var ret = {
            success: true
        };

        if (formData.rloading == "rloadingcustom") {
            r.request (formData.nameOfRVariable + ' <- \'' + filename + '\'', function () {
                ret.message = 'File successfully uploaded. You can access the filename from the variable \'' + formData.nameOfRVariable + '\'.';
                resp.writeHeader(200, { "Content-Type": "text/html" });
                resp.write (JSON.stringify (ret));
                resp.end();
            });
        } else {
            r.request (formData.nameOfRVariable + ' <- read.table(\'' + filename + '\')', function () { 
                // Now we've attempted the load, check we have the data
                r.request (formData.nameOfRVariable, function (rResp) {
                    if (rResp && rResp.attributes && rResp.attributes.class == 'try-error') {
                        r.request (formData.nameOfRVariable + ' <- \'' + filename + '\'', function () {
                            ret.message = 'File successfully uploaded, but R was unable to parse. Please try loading it yourself.\nYou can access the filename from the variable \'' + formData.nameOfRVariable + '\'.';
                            resp.writeHeader(200, { "Content-Type": "text/html" });
                            resp.write (JSON.stringify (ret));
                            resp.end();
                        });

                    } else {
                        ret.message = 'File successfully uploaded. if parsable, its output will be in \'' + formData.nameOfRVariable + '\'.';
                        resp.writeHeader(200, { "Content-Type": "text/html" });
                        resp.write (JSON.stringify (ret));
                        resp.end();
                    }
                });
            });
        }
    });

    var saveFileNow = false;

    parser.ondata = function (part) {
        if (saveFileNow)
            FS.writeSync (fd, part, null, "utf8");
        else {
            formData[lastFormField] = formData.lastFormField ? formData.lastFormField : '';
            formData[lastFormField] += part;
        }
    };

    parser.onpartend = function (part) {
        if (saveFileNow) {
            saveFileNow = false;
            FS.closeSync(fd);
        }
    };

    parser.onpartbegin = function (part) {
        if (part.headers['content-disposition'] && part.headers['content-type']) 
            saveFileNow = true;
        else 
            lastFormField = part.name;
    };
    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/R/upload');
}
