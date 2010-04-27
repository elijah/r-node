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

exports.name = "/download";

exports.init = function (rNodeApi) {
    rNodeApi.addRestrictedUrl (/^\/download/);
}

exports.handle = function (req, resp, sid, rNodeApi) {
    var url = URL.parse (req.url, true);
    var parts = url.href.split(/\?/)[0].split(/\//);
    var filename = parts.length >= 3 && parts[2].length > 0 ? QUERY.unescape(parts[2]) : 'graph.svg';
    if (filename.search(/\.svg$/) < 0) {
        filename += '.svg';
    }

    resp.writeHead (200, {
        'content-type': 'image/svg+xml',
        'Cache-Control': 'no-cache, must-revalidate',
        'Content-Disposition': 'attachment; filename="' + filename + '"'
    });

    req.setBodyEncoding('utf8');
    var data = '';

    req.addListener ("data", function (chunk) {
        data += chunk;
    });
    req.addListener ("end", function () {
        rNodeApi.log(req, 'Returning SVG file for download. Size is ' + (data.length - 4));
        data = data.substring (4); // skip the initial 'svg='
        resp.write (decodeURIComponent(decodeURIComponent(data)), encoding = 'utf8'); // double decode! TODO fix maybe
        resp.end();
    });

    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/download');
}
