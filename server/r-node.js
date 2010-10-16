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
var SHA256  = require("./sha256");

var rServerProcess = null; // Only set if we manage the R server.
var restrictedUrls = []; 
var capabilities = {};
var nodelog = UTILS.nodelog; // Makes code a little nicer to read.
var sharedRConnection = null;
var globalSessionSid = SHA256.hex_sha256 (new Date().getTime() + '-' + Math.random().toFixed(4));

nodelog(null, "Global session ID: " + globalSessionSid);

var Config = UTILS.loadJsonFile("configuration", "etc/config.js", "etc/config-example.js");
var AUTH = require ('./authenticators/' + Config.authentication.type.replace(/[^a-zA-Z-_]/g, '')).auth;
var Authenticator = AUTH.instance();
var sessions = {};

var requiredSetupSteps = {
    "auth": false,
    "testR": false
}

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
	, extend: function (n, f) {
		this[n] = f;
	}
    , getRaccessibleTempFile: function (suffix) {
        var s = UTILS.getRandomString('tmp_', suffix);
        return {
            ours: Config.R.tempDirectoryFromOurPerspective + '/' + s,
            r: Config.R.tempDirectoryFromRperspective + '/' + s
        }
    }
    , getSidContext: function (sid, allowShared) {
        var s = sid || (allowShared ? globalSessionSid : null);
        if (!sessions[s])
            return null;

        if (!sessions[s].context)
            sessions[s].context = {};

        return sessions[s].context;
    }
    , Rversion: function (sid) {
        var ctx = rNodeApi.getSidContext(sid || globalSessionSid);
        var version = ctx.Rversion.match(/version (\d+)\.(\d+)\.(\d+)/);
        return version.slice(1);
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

function cleanOutSessions() {
    var maxTime = Config.R.idleSessionTimeout || 30; // default to 30 minutes;
    maxTime = maxTime * 60 * 1000;
    var todelete = [];
    for (var s in sessions) {
        if (!sessions[s].globalSession &&
            new Date().getTime() - sessions[s].lastAccessTime.getTime() > maxTime)
            todelete.push (s);
    }

    todelete.forEach (function (s) { 
        nodelog(null, "Removing session " + s);
        Authenticator.remove (s);
        
        // Only delete if we're doing perUser R connections.
        // And the global session won't have one as well, so check we have an
        // Rconnection variable.
        if (Config.R.sessionManagement == "perUser") {
            if (sessions[s].Rconnection)
                sessions[s].Rconnection.close();
        }
        delete sessions[s];
    });
}

function createSessionContext (sid) {
    if (!sessions[sid]) {
        sessions[sid] = {
            active: true,
            lastAccessTime: new Date(),
            context: {
                preferences: {}
            }
        };
    }

    return sessions[sid];
}

function login (req, resp) {
    Authenticator.login (req, function (sid, username) {
        if (sid) {
            var session = createSessionContext(sid);
            session.username = username;

            // If now, find a R session for them
            if (!session.Rconnection) { // re-logins - we don't replace their session
                switch (Config.R.sessionManagement) {
                    case "single":
                        session.Rconnection = sharedRConnection;
                        session.context.Rversion = sessions[globalSessionSid].context.Rversion;
                        resp.writeHeader(200, { "Content-Type": "text/plain" });
                        resp.write(sid);
                        resp.end();
                        break;
                    case "perUser":
                        var cb = function (ok, r) {
                            if (ok) {
                                setupRSession (r, session, function (ok) {
                                    // Note assume ok.
                                    session.Rconnection = r;
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
        if (req.url.search (p) >= 0) {
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

function setupRSession (connection, sessionData, callback) {

    // Each session has a graphing target that is
    // set up to take all graphing commands. It then
    // copies them to actual files for the user to download.
    var graphingFile = rNodeApi.getRaccessibleTempFile ('.png');

    // Core setup commands, not delegated to separate files.
    var rnodeSetupCommands = [
          { command:  "R.version.string", callback: function (result) { sessionData.context.Rversion = result[0]; } }
        , "rNodePager = function (files, header, title, f) { r <- files; attr(r, 'class') <- 'RNodePager'; attr(r, 'header') <- header; attr(r, 'title') <- title; attr(r, 'delete') <- f; r; }"
        , "rNodePrint = function (c) { if (class(c) == \"RNodePager\") c else paste(capture.output(print(c)),collapse=\"\\n\"); }"
        , "options(pager=rNodePager)"
        , "png('" + graphingFile.r + "');"
        , "dev.control(\"enable\");"
    ]

    var scripts = [], globalScripts = [], userScripts = [];
    var globalScriptDirectory = Config.sessionManagement ? (Config.sessionManagement.postConnectionScripts ? Config.sessionManagement.postConnectionScripts : []) : [];
    var userScriptDirectory = Config.sessionManagement ? (Config.sessionManagement.perUserPostConnectionScripts ? Config.sessionManagement.perUserPostConnectionScripts : []) : [];
    try {
        globalScripts = FS.readdirSync(globalScriptDirectory).sort();
    } catch (e) {
        nodelog (null, "WARNING: global post connection script directory '" + globalScriptDirectory + "' is not readable: " + e);
    }
    try {
        userScripts = FS.readdirSync(userScriptDirectory).sort();
    } catch (e) {
        nodelog (null, "WARNING: user post connection script directory '" + userScriptDirectory + "' is not readable: " + e);
    }

    scripts = globalScripts.map(function (s) { return [s, globalScriptDirectory + "/" + s]; });
    if (sessionData.username) { // Username only set on per user sessions, and user login required.
        var userMatch = '_' + sessionData.username + '_';
        userScripts.forEach (function (s) { 
            if (s.match (userMatch)) {
                scripts.push ([s, userScriptDirectory + "/" + s]);
            }
        });
    }
    nodelog (null, "Running R setup files: " + scripts.map (function (s) { return s[0] }).join (","));

    var runPostConnectionScripts = function(fi) {
        if (fi < scripts.length) {
            // Copy file to R's tmp directory, then source it into the session
            var dest = Config.R.tempDirectoryFromOurPerspective + "/" + scripts[fi][0];
            UTILS.cp (scripts[fi][1], dest, function (err) {
                if (err) {
                    nodelog (null, "Error running R setup file '" + scripts[fi][0] + "': " + err);
                    callback (false); 
                } else {
                    connection.request ("source(\"" + dest + "\")", function (resp) { 
                        nodelog(null, 'Successfull run R setup file: ' + scripts[fi][0]);
                        runPostConnectionScripts (++fi);
                    });
                }
            });
        } else {
            callback (true);
        }
    }

    // Run aech core setup command in turn, then once finished,
    // call the above function to do the post connectino scripts,
    // if there are any.
    var runs = function (i) {
        if (i < rnodeSetupCommands.length) {
            var cmd = rnodeSetupCommands[i];
            var cb = null;
            if (typeof cmd !== "string") {
                cb = cmd.callback;
                cmd = cmd.command;
            }
            nodelog (null, "Running R setup command '" + cmd + "'");
            connection.request (cmd, function (resp) { 
                nodelog(null, 'Setup command response: ' + JSON.stringify (resp));
                if (cb) cb(resp);
                runs (++i);
            });
        } else {
            runPostConnectionScripts(0);
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

// Run the R server, if we are asked to.
if (Config.R.manageRserver) {
    nodelog(null, 'Config Requested we manage our own R process. Starting R & Rserve up now.');
    var rServerProcess = UTILS.getRandomString ('', '', 4);
    var p = CHILD.spawn('R', ['CMD', 'Rserve', '--vanilla', '--RN' + rServerProcess]);

    p.stdout.addListener('data', function (data) {
        SYS.debug('R stdout: ' + data);

        if (/Rserv started in daemon mode/.test(data.slice(0,data.length))) {
            triggerGoLiveChecks();
        }
    });

    p.stderr.addListener('data', function (data) {
        if (/^execvp\(\)/.test(data.slice(0,data.length))) {
            nodelog(null, 'Failed to start R child process. Exiting R-Node');
            rServerProcess = null;
            process.exit(-1);
        }
        SYS.debug('R stderr: ' + data);
    });

    p.addListener('exit', function (code) {
        nodelog(null, 'R process exited with code: ' + code + '.');
        rServerProcess = null;
    });
} else {
    triggerGoLiveChecks();
}

process.addListener('SIGINT', function () {
    nodelog(null, 'Caught SIGINT - exiting R-Node.');
    if (rServerProcess) {
        // The Rserve process actually forks into a daemon, which is just... frustrating.
        // so instead, we look for the Rserver process and kill it.
        // Pretty uncool huh.
        nodelog(null, 'Attempting to kill Rserve process. This should work!');
        
        CHILD.exec ('ps -fu ' + process.getuid() + ' 2>&1 | grep \'[R]serve.*' + rServerProcess + '\' 2>&1 | awk \'{print $2}\' 2>&1 | xargs kill 2>&1', { timeout: 1000 }, function (error, stdout, stderr) {
            if (error) {
                nodelog(null, 'Attempt failed: code ' + error.code + ' ' + error.message);
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Try a test R connection. If this fails, then we fail.
// if it succeeds, we can go ahead and start up our HTTP server.
// If we're using the R sessionManagement of "single", we keep
// the connection open as our sharedRConnection.
function testRConnection (callback) {
    var ourCallback = function (ok, conn) {
        if (ok) {
            sharedRConnection = conn;
            var c = createSessionContext(globalSessionSid); 
            c.globalSession = true;
            setupRSession (conn, c, callback); // need this even if we're doing per-user sessions. R-Node uses it.
            return;
        } 
        callback (ok);
    };

    getRConnection (ourCallback);
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

function triggerGoLiveChecks() {
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
}
