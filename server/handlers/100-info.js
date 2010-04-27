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

exports.name = "/__info";

var standardCss = 
"        <style>" +
"            body {" +
"                color:#333333;" +
"                font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;" +
"                font-size:12px;" +
"                line-height:1.5;" +
"            }" +
"            h1 {" +
"                font-family: 'Trebuchet MS', Arial, sans-serif;" +
"                font-size: 30px;" +
"                letter-spacing: -1px;" +
"                line-height: 30px;" +
"            }" +
"" +
"            a {" +
"                color:#2233FF;" +
"            }" +
"" +
"            a:visited {" +
"                color:#2233FF;" +
"            }" +
"        </style>";

exports.handle = function (req, resp, sid, rNodeApi) {
    var packages = "paste(capture.output(print(installed.packages())),collapse=\"\\n\")";
    rNodeApi.getRConnection(sid, true).request(packages, function (rResp) {
        var ret = "<html><head><title>R-Node Instance Information</title><body>" + standardCss + "<h1>Installed Packages</h1><p><pre>" + rResp[0] + "</pre></body></html>";
        resp.writeHeader(200, { 
            "Content-Type": "text/html",
            "Content-Length": ret.length

        });
        resp.write (ret);
        resp.end();
    });
    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.beginsWith ('/__info');
}
