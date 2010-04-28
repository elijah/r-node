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
var FS      = require("fs");
var CHILD   = require("child_process");
var URL     = require("url");
var QUERY   = require ("querystring");
var HTTP    = require("http");
var RSERVE  = require("./rserve");
var UTILS   = require("./rnodeUtils");

var restrictedUrls = []; 
var capabilities = {};
var nodelog = UTILS.nodelog; // Makes code a little nicer to read.
var sharedRConnection = null;
var Config = UTILS.loadJsonFile("configuration", "etc/config.js", "etc/config-example.js");
var AUTH = require ('./authenticators/' + Config.authentication.type.replace(/[^a-zA-Z-_]/g, '')).auth;
var Authenticator = AUTH.instance();

nodelog (null, "Using authenticator: '" + AUTH.name + "'");

var rNodeApi = {
    getRConnection: function (sid, allowShared) {
        return sid && sessions[sid] ? sessions[sid].Rconnection : (allowShared ? sharedRConnection : null);
    }
    , addRestrictedUrl: function (urlRegEx) {
        restrictedUrls.push (urlRegEx);
    }
    , addCapability: function (c, d) {
        capabilities[c] = d;
    }
    , getRaccessibleTempFile: function (suffix) {
        var s = UTILS.getRandomString('tmp_', suffix);
        return {
            ours: Config.R.tempDirectoryFromOurPerspective + '/' + s,
            r: Config.R.tempDirectoryFromRperspective + '/' + s
        }
    }
    , log: nodelog
    , config: Config
}

/**
 * Load all handlers
 */
var handlers = [];
FS.readdirSync('./handlers').sort().forEach (function (d) {
    if (d.search ('\.js$') > 0) {
        var H = require ('./handlers/' + d.replace('.js', ''));
        if (H.init) {
            !H.init(rNodeApi);
        }
        nodelog (null, "Loaded handler '" + H.name + "'");
        handlers.push (H);
    }
});

var sessions = {};

function cleanOutSessions() {
    var maxTime = Config.R.idleSessionTimeout || 30; // default to 30 minutes;
    maxTime = maxTime * 60 * 1000;
    var todelete = [];
    for (var s in sessions) {
        if (new Date().getTime() - sessions[s].lastAccessTime.getTime() > maxTime)
            todelete.push (s);
    }

    todelete.forEach (function (s) { 
        nodelog(null, "Removing session " + s);
        Authenticator.remove (s);
        sessions[s].Rconnection.close();
        delete sessions[s];
    });
}

function login (req, resp) {
    Authenticator.login (req, function (sid) {
        if (sid) {
            sessions[sid] = {
                active: true,
                lastAccessTime: new Date()
            }
            // If now, find a R session for them
            if (!sessions[sid].Rconnection) { // re-logins - we don't replace their session
                switch (Config.R.sessionManagement) {
                    case "single":
                        sessions[sid].Rconnection = sharedRConnection;
                        resp.writeHeader(200, { "Content-Type": "text/plain" });
                        resp.write(sid);
                        resp.end();
                        break;
                    case "perUser":
                        var cb = function (ok, r) {
                            if (ok) {
                                setupRSession (r, function (ok) {
                                    // Note assume ok.
                                    sessions[sid].Rconnection = r;
                                    resp.writeHeader(200, { "Content-Type": "text/plain" });
                                    resp.write(sid);
                                    resp.end();
                                });
                            } else {
                                resp.writeHeader(503, { "Content-Type": "text/plain" });
                                resp.end();
                            }
                        }
                        getRConnection (cb); 
                        break;

                    default:
                        throw new Error ("Config.R.sessionManagement '" + Config.R.sessionManagement + "' unknown.");
                }
            } else {
                resp.writeHeader(200, { "Content-Type": "text/plain" });
                resp.write(sid);
                resp.end();
             }
        } else {
            resp.writeHeader(401, { "Content-Type": "text/plain" });
            resp.end();
        }
    });
}

function requestMgr (req, resp) {
    if (req.url.beginsWith('/__login')) {
        login (req, resp);
        return;
    }

    if (req.url.beginsWith('/__authmethods')) {
        resp.writeHeader(200, { "Content-Type": "text/plain" });
        resp.write(AUTH.clientMechanism);
        resp.end();
        return;
    }
    
    if (req.url.beginsWith('/__capabilities')) {
        resp.writeHeader(200, { "Content-Type": "text/plain" });
        resp.write(JSON.stringify (capabilities));
        resp.end();
        return;
    }

    cleanOutSessions();

    // URLs that require the Authenticator to ok access:
    var requiredAuth = false;
    restrictedUrls.forEach (function (p) {
        if (req.url.beginsWith (p) > 0) {
            requiredAuth = true;
        }
    });

    // Get sid 
    var url = URL.parse (req.url, true);
    var sid = (url.query && url.query.sid) ? url.query.sid : null;

    if (requiredAuth) {
        if (!sid) {
            SYS.debug ('requestMgr: No sid. cannot continue.');
            resp.writeHeader(403, { "Content-Type": "text/plain" });
            resp.end();
            return;
        }

        Authenticator.checkRequest (req, sid, function (ok) {
            if (ok) {
                authorizedRequestMgr (req, resp, sid);
                sessions[sid].lastAccessTime = new Date();
            } else {
                if (sid) 
                    delete sessions[sid];

                resp.writeHeader(403, { "Content-Type": "text/plain" });
                resp.end();
            }
        });
    } else {
        authorizedRequestMgr (req, resp, sid);
    }
}

function authorizedRequestMgr (req, resp, sid) {

    if (req.url == "/") {
        req.url = "/index.html";
    }

    var handled = false;

    handlers.forEach (function (h) {
        if (!handled && h.canHandle (req, rNodeApi)) {
            try {
                if (h.handle (req, resp, sid, rNodeApi)) {
                    handled = true;
                }
            } catch (e) {
                nodelog (req, "Error in handler '" + h.name + "': " + e);
                resp.writeHeader(500, { "Content-Type": "text/plain" });
                resp.end();
            }
        }
    });

    if (!handled) {
        resp.writeHeader(401, { "Content-Type": "text/plain" });
        resp.end();
    }
}

function setupRSession (connection, callback) {
    var rnodeSetupCommands = [
        "rNodePager = function (files, header, title, f) { r <- files; attr(r, 'class') <- 'RNodePager'; attr(r, 'header') <- header; attr(r, 'title') <- title; attr(r, 'delete') <- f; r; }",
        "options(pager=rNodePager)"
    ]

    var runs = function (i) {
        if (i < rnodeSetupCommands.length) {
            nodelog (null, "Running R setup command '" + rnodeSetupCommands[i] + "'");
            connection.request (rnodeSetupCommands[i], function (resp) { 
                SYS.debug ('Setup command response: ' + JSON.stringify (resp));
                runs (++i);
            });
        } else {
            callback (true);
        }
    }

    runs (0);
}

function getRConnection (callback) {
    var r = new RSERVE.RservConnection();
    r.connect(function (requireLogin) {
        if (requireLogin) {
            nodelog (null, "RServe requires login. Using information from config.");
            if (Config.R.username && Config.R.password) {
                r.login (Config.R.username, Config.R.password, function (ok) {
                    nodelog (null, "Logged into R via RServe: " + ok);
                    callback (true, r);

                });
            } else {
                nodelog(null, "RServe requires login, but no credentials given by config.");
                callback (false);
            }
        } else {
            callback (true, r);
        }
    });
}


// Try a test R connection. If this fails, then we fail.
// if it succeeds, we can go ahead and start up our HTTP server.
// If we're using the R sessionManagement of "single", we keep
// the connection open as our sharedRConnection.
function testRConnection (callback) {
    var ourCallback = function (ok, conn) {
        if (ok) {
            sharedRConnection = conn;
            setupRSession (conn, callback); // need this even if we're doing per-user sessions. R-Node uses it.
            return;
        } 
        callback (ok);
    };

    getRConnection (ourCallback);
}


var requiredSetupSteps = {
    "auth": false,
    "testR": false
}

function conditionallyGoLive () {
    for (var s in requiredSetupSteps) {
        if (requiredSetupSteps[s] == false) {
            return;
        }
    }

    var ui = HTTP.createServer(requestMgr);
    ui.addListener ('listening', function () {
        nodelog (null, 'R-Node Listening on port: \'' + Config.listen.port + '\', interface: \'' + (Config.listen.interface ? Config.listen.interface : 'all') + '\'');
    });
    ui.listen (Config.listen.port, Config.listen.interface);
}

Authenticator.init (Config.authentication, function (ok) {
    "Setup authentication: " + (ok ? "ok" : "NOT ok");
    requiredSetupSteps["auth"] = ok;
    conditionallyGoLive();
});

testRConnection (function (ok) {
    "Tested R connection: " + (ok ? "ok" : "NOT ok");
    requiredSetupSteps["testR"] = ok;
    conditionallyGoLive();
});
