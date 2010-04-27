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

exports.name = "/R/objects";

exports.init = function (rNodeApi) {
    rNodeApi.addRestrictedUrl (/^\/R\/objects/);
}

exports.handle = function (req, resp, sid, rNodeApi) {
    var url = URL.parse (req.url, true);
    var node = (url.query && url.query.node) ? url.query.node : null;

    if (!node) {
        resp.writeHeader(401, { "Content-Type": "text/plain" }); // TODO fix return value to be 'bad request'
        resp.end();
        return true;
    }

    var r = rNodeApi.getRConnection(sid, false);

    if (node == "root") {
        r.request ('ls()', function (rResp) {
            var list = [];
            rResp.forEach (function (i) {
                list.push ({
                    id: i
                    , text: i
                    , leaf: true
                });
            });
            resp.writeHeader(200, { "Content-Type": "text/plain" }); 
            resp.write (JSON.stringify (list));
            resp.end();
        });
    } else {
        resp.writeHeader(401, { "Content-Type": "text/plain" }); 
        resp.end();
    }

    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/R/objects');
}

