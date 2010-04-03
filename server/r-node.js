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
process.mixin(GLOBAL, require("sys"));
var fs = require("fs");
var URL = require("url");
var querystring = require ("querystring");
var http = require("http");
process.mixin(GLOBAL, require("./rserve"));
process.mixin(GLOBAL, require("./sha256"));

var username = 'test';
var password = 'estt';

var sessions = {};

function rprompt () {
    process.stdio.write("> ");
}

function printResult (r) {
    puts(JSON.stringify(r));
    rprompt();
}

/*
// THis sequence fails for now - it returns tags:
   fruit <- c(5, 10, 1, 20)
   names(fruit) <- c("orange", "banana", "apple", "peach")
   lunch <- fruit[c("apple","orange")]
//   
//   This fails to;
//  e <- numeric()
//  attr(e, "t") <- "hi"
//  attributes(e)
//
//  and this:
//
 state <- c("tas", "sa",  "qld", "nsw", "nsw", "nt", "wa", "wa", "qld", "vic", "nsw", "vic", "qld", "qld", "sa", "tas", "sa",  "nt",  "wa",  "vic", "qld", "nsw", "nsw", "wa", "sa",  "act", "nsw", "vic", "vic", "act")
 statef <- factor(state)
 incomes <- c(60, 49, 40, 61, 64, 60, 59, 54, 62, 69, 70, 42, 56, 61, 61, 61, 58, 51, 48, 65, 49, 49, 41, 48, 52, 46, 59, 46, 58, 43)
 incmeans <- tapply(incomes, statef, mean)

  ----

 z <- c(1,2,3,4,5,6,7,8,9,0)
 dim(z) <- c(2,5)
 z

 x <- array(1:20, dim=c(4,5))


  attach(faithful)
  summary(eruptions)
  fivenum(eruptions) // this is ok
  stem(eruptions) // this is a graph
  hist(eruptions) // another graph
  hist(eruptions, seq(1.6, 5.2, 0.2), prob=TRUE)
  lines(density(eruptions, bw=0.1))
  rug(eruptions) // This line and the other two above run them together.
  ecdf(eruptions) // XT_CLOS??
  plot(ecdf(eruptions), do.points=FALSE, verticals=TRUE)

long <- eruptions[eruptions > 3]
plot(ecdf(long), do.points=FALSE, verticals=TRUE)
x <- seq(3, 5.4, 0.01)
lines(x, pnorm(x, mean=mean(long), sd=sqrt(var(long))), lty=3)
par(pty="s")       # arrange for a square figure region
qqnorm(long); qqline(long)

x <- rt(250, df = 5)
qqnorm(x); qqline(x)

qqplot(qt(ppoints(250), df = 5), x, xlab = "Q-Q plot for t dsn")
qqline(x)

shapiro.test(long)

ks.test(long, "pnorm", mean = mean(long), sd = sqrt(var(long)))


COntine from 8.3 in book


*/

var defaultReturnFormat = "raw";

mimeTypes = {
    '.png': 'image/png',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.html': 'text/html'
}

mimeTypesRe = /\.([^.]+)$/;
function getMimeType (url) {
    var ft = url.match (mimeTypesRe);
    return mimeTypes[ft[0]] || 'text/plain';
}

function blurb (req, resp) {
    var blurbText = "Copyright (C) 2009 The R Foundation for Statistical Computing\n" +
                    "ISBN 3-900051-07-0\n\n" +
                    "R is free software and comes with ABSOLUTELY NO WARRANTY.\n" +
                    "You are welcome to redistribute it under certain conditions.\n" +
                    "Type 'license()' or 'licence()' for distribution details.\n\n" +
                    "R is a collaborative project with many contributors.\n" +
                    "Type 'contributors()' for more information and\n" + 
                    "'citation()' on how to cite R or R packages in publications.\n\n" +
                    "This online interface to R is Copyright (C) 2010 Jamie Love\n";


    r.request("R.version.string", function (rResp) {
        var completedResponse = rResp[0] + "\n" + blurbText; 
        resp.writeHeader(200, {
          "Content-Length": completedResponse.length,
          "Content-Type": "text/plain"
        });
        resp.write (completedResponse);
        resp.close();
    });
}

/*
 * Restricted commands, we don't run.
 * This isn't really designed to stop users from doing these commands (there are easy ways
 * around them), but it ensures that users don't accidentally run commands that could mess
 * up the remote R connection we're providing.
 */
function isRestricted (cmd) {
    var r = [
        /^\s*q\s*\(/i,
        /^\s*quit\s*\(/i,
        /^\s*\.internal\s*\(/i,
        /^\s*system/i
    ];

    for (var i = 0; i < r.length; ++i) {
        if (cmd.search(r[i]) >= 0) {
            return true;
        }
    }

    return false;
}

function login (req, resp) {
    var url = URL.parse (req.url, true);
    if (!url.query ||
            url.query.username != username ||
            url.query.password != password
       ) {
        resp.writeHeader(401, { "Content-Type": "text/plain" });
        resp.close();
        return;
    }

    nodelog (req, 'User logging in from ' + req.connection.remoteAddress);

    var sid = hex_sha256 (url.query.username + url.query.password + (new Date().getTime()));
    sessions[sid] = true;
    resp.writeHeader(200, { "Content-Type": "text/plain" });
    resp.write(sid);
    resp.close();
    
}

function isLoggedIn (sid, resp) {
    if (!sid || !sessions[sid]) {
        resp.writeHeader(401, { "Content-Type": "text/plain" });
        resp.close();
        return false;
    }
    return true;
}

function nodelog (req, str) {
    log (req.connection.remoteAddress + ': ' + str);
}

function requestMgr (req, resp) {
    if (req.url.search(/^\/__login/) == 0) {
        login (req, resp);
        return;
    }

    if (req.url == "/") {
        req.url = "/index.html";
    }
    if (req.url == "/blurb") {
        blurb(req, resp);
        return;
    }

    var url = URL.parse (req.url, true);

    if (req.url.search (/^\/download\//) == 0) {
        var parts = url.href.split(/\?/)[0].split(/\//);
        var filename = parts.length >= 3 && parts[2].length > 0 ? querystring.unescape(parts[2]) : 'graph.svg';
        if (filename.search(/\.svg$/) < 0) {
            filename += '.svg';
        }

        var sid = url.query ? url.query.sid : null;
        if (!isLoggedIn(sid, resp)) 
            return;

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
            nodelog(req, 'Returning SVG file for download. Size is ' + (data.length - 4));
            data = data.substring (4); // remove the 'svg=' bit.
            resp.write (decodeURIComponent(decodeURIComponent(data)), encoding = 'utf8'); // double decode! TODO fix maybe
            resp.close();
        });

        return;
    }

    if (req.url.search (/^\/R\//) == 0) {
        var parts = url.href.split(/\?/)[0].split(/\//);
        var request = querystring.unescape(parts[2]);

        var sid = url.query ? url.query.sid : null;
        if (!isLoggedIn(sid, resp)) 
            return;

        var format = url.query.format || defaultReturnFormat;
        if (format == "pretty") {
            request = "paste(capture.output(print(" + request + ")),collapse=\"\\n\")";
        }

        if (isRestricted(request)) {
            nodelog (req, 'R command \'' + request + '\' is restricted.');
            resp.writeHeader(403);
            resp.close();
            return;
        }

        nodelog(req, 'Executing R command: \'' + request + '\'');
        r.request(request, function (rResp) {
            var str = JSON.stringify(rResp);

            nodelog (req, 'Result of R command: \'' + request + '\' received.');

            if (format == "pretty" && rResp.length) {
                str = rResp[0];
            }

            resp.writeHeader(200, {
              "Content-Length": str.length,
              "Content-Type": "text/plain" // Change to application/json TODO
            });
            resp.write (str);
            resp.close();
        });

        return;
    } 

    // Default handling
    var file = "htdocs" + req.url;
    nodelog(req, 'Getting file: \'' + file + '\'');
    fs.realpath(file, function (err, resolvedPath) {
        if (err) {
            nodelog(req, 'error getting canonical path for ' + resolvedPath);
            resp.writeHeader(404, { "Content-Type": "text/plain" });
            resp.close();
        } else {
            if (resolvedPath.search('^/home/jlove/dev/r-node/') != 0) {
                nodelog(req, 'resolved path \'' + resolvedPath + '\' not within right directory.');
                resp.writeHeader(404, { "Content-Type": "text/plain" });
                resp.close();
            } else {

                fs.stat(resolvedPath, function (err, stats) {
                    if (err) {
                        resp.writeHeader(404, { "Content-Type": "text/plain" });
                        resp.close();
                    } else {
                        resp.writeHeader(200, {
                          "Content-Length": stats.size,
                          "Content-Type": getMimeType (req.url)
                        });
                        fs.readFile (resolvedPath, "binary", function (err, data) {
                            if (err) {
                                resp.writeHeader(404, { "Content-Type": "text/plain" });
                                resp.close();
                            } else {
                                resp.write (data, "binary");
                                resp.close();
                            }
                        });
                    }
                });
            }
        }
    });
}

var ui = http.createServer(requestMgr);
ui.listen (2903, 'localhost');


r = new RservConnection();
r.connect(function (requireLogin) {
   r.login ('test', 'test');
});
