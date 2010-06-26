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

exports.name = "/R/...webvis";

var ourTempDirectory;
var rTempDirectory;


exports.init = function (rNodeApi) {
    var config = rNodeApi.config.features.fileUpload;
    rNodeApi.addRestrictedUrl (/^\/R\/.*webvis/);

	ourTempDirectory = rNodeApi.config.R.tempDirectoryFromOurPerspective;
	rTempDirectory = rNodeApi.config.R.tempDirectoryFromRperspective;   		
}

/**
 * Supports streaming webvis code to the client.
 * This webvis code is protovis code to draw SVG images.
 */
exports.handle = function (req, resp, sid, rNodeApi) {
    
	var url = URL.parse (req.url, true);
    var parts = url.href.split(/\?/)[0].split(/\//);
    var request = QUERY.unescape(parts[2]);
	    
	var r = rNodeApi.getRConnection(sid, false);
	
	r.request (request, function (rResp) {
		// Lets see if we get a file -
		if (rResp && rResp.length) { // is an array
			// get first element, should be a file path 
			if (rResp[0].search ('\.html$') > 0) {
				var f = rResp[0].replace(rTempDirectory, ourTempDirectory)
				
				// Here, remove the html stuff off - we just want the core javascript code.
				var htmlFile = FS.readFileSync (f, 'utf8');
				var lines = htmlFile.split("\n");
				lines = lines.splice(9, lines.length - 12); // Bit of a naff way to do it - but we remove the html wrapper.
				jsFile = lines.join ("\n");
				FS.writeFileSync(f + '.js', jsFile);
				
				var key = rNodeApi.addPagerFile({
					path: f + '.js'
					, mimeType: 'text/javascript+protovis'
					, toDelete: true 
				});
		        
				resp.writeHeader(200, { "Content-Type": "text/plain" });
                resp.write (JSON.stringify ({
                    values: [key],
                    attributes: {
                        class:["RWebvisGraph"],
                        "title":["R Plot"]
                    }
                }));
                resp.end();					
			}	
		} else {
			var str = JSON.stringify(rResp);
	        resp.writeHeader(200, {
	          "Content-Length": str.length,
	          "Content-Type": "text/plain" // Change to application/json TODO
	        });
	        resp.write (str);
	        resp.end();
		}
	})
	
    return true;
}

exports.canHandle = function (req, rNodeApi) {
    return req.url.search ('/R/.*webvis') == 0 && req.url.search('/R/\s*library') != 0;
}
