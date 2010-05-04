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

/*
 * Handles storing session preferences set by the user and which
 * need client side support.
 */

var URL     = require("url");
var SYS     = require("sys");

exports.name = "/__preferences";

exports.init = function (rNodeApi) {
    rNodeApi.addRestrictedUrl (/^\/__preferences/);
}

exports.handle = function(req, resp, sid, rNodeApi) {
    var url = URL.parse (req.url, true);
    var context = rNodeApi.getSidContext (sid);
    var responded = false;

    if (url.query.graphOutputType) {

        var t = url.query.graphOutputType;
        if (context.preferences.graphOutputType != t) {
            if (t != 'png' && t != 'tiff' && t != 'pdf' && t != 'bitmap' && t != 'jpeg') {
                resp.writeHeader(400, { "Content-Type": "text/plain" });
                resp.end();
                return true;
            }

            context.preferences.graphOutputType = t;
            var r = rNodeApi.getRConnection(sid, false);

            if (!r) {
                resp.writeHeader(401, { "Content-Type": "text/plain" });
                resp.end();
                return true;
            }

            responded = true;
            resp.writeHeader(200, { "Content-Type": "text/plain" });
            resp.end();
        }
    }

    if (!responded) {
        resp.writeHeader(400, { "Content-Type": "text/plain" });
        resp.end();
        return true;
    }

    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/__preferences');
}

