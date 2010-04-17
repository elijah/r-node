/*
  Copyright 2010 Jamie Love. All rights reserved.

  Redistribution and use in source and binary forms, with or without modification, are
  permitted provided that the following conditions are met:

     1. Redistributions of source code must retain the above copyright notice, this list of
        conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright notice, this list
        of conditions and the following disclaimer in the documentation and/or other materials
        provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY JAMIE LOVE ``AS IS'' AND ANY EXPRESS OR IMPLIED
  WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JAMIE LOVE OR
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
  ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  The views and conclusions contained in the software and documentation are those of the
  authors and should not be interpreted as representing official policies, either expressed
  or implied, of Jamie Love.
*/

/**
 * An API/R interface representing a single R workspace and connection.
 * Can be used client or server side.
 */

RNodeCore.ns ('rnode');

rnode.R.API = function (config) {
    this.rUrlBase = "/R/";
    this.workspace = new rnode.R.Workspace();
    this.parser = new rnode.R.Parser();
    this.state = rnode.R.API.STATE_UNCONNECTED;
    RNodeCore.apply (this, config);

};

rnode.R.API.STATE_UNCONNECTED = "unconnected";
rnode.R.API.STATE_CONNECTED = "connected";

rnode.R.API = RNodeCore.extend (rnode.R.API, {

    /**
     * Connect to the R server, using the given username and password.
     */
    connect: function (username, password, callback) {
        var me = this;
        RNodeCore.ajax({
            url: "/__login?username=" + encodeURIComponent(username) + '&password=' + encodeURIComponent(password),
            type: "text",
            success: function (data) {
                me.sid = data;
                me.state = rnode.R.API.STATE_CONNECTED;
                if (callback)
                    callback (true);
            },
            error: function () {
                me.sid = '';
                me.state = rnode.R.API.STATE_UNCONNECTED;
                if (callback)
                    callback (false);
            }
        });
    },

    /**
     * Run the given R command.
     *
     * It will call the given callback function when the
     * R result is returned.
     */
    eval: function (command, callback) {
        var parsedCommand = this.parse (command);
        if (this.state != rnode.R.API.STATE_CONNECTED) {
            callback (false, {command: parsedCommand, message: "unconnected" });
            return;
        }

        var commands = RNodeCore.isArray (parsedCommand) ? parsedCommand : [parsedCommand];
        for (var i = 0; i < commands.length; ++i) {
            var sh = rnode.command.CommandHandler.findHandler (commands[i]);
            if (sh) {
                // First, try and find a specialist handler.
                sh.execute (this, commands[i], callback);
            }
            else if (commands[i].isSupported ()) {
                // If not, directly run it.
                this.directlyExecute(commands[i], callback);
            } else {
                // Finally, fail. If we fail, we fail all future ones
                // 'cause they may rely on this earlier one.
                callback (false, { command: commands[i], message: "unsupported" });
            }
        }
    },

    /**
     * Parse an R command, return the parsed command.
     */
    parse: function (command) {
        return this.parser.parse (command);
    },

    /**
     * Directly executes/runs a R command on the R server, without any
     * checking or further evaluation.
     */
    directlyExecute: function (parsedCommand, callback) {
        var url = this.rUrlBase + encodeURIComponent(parsedCommand.get()) + "?sid=" + this.sid;
        var success = function (jsonData) {
            callback (true, {
                response: new rnode.R.RObject (jsonData, parsedCommand),
                command: parsedCommand,
                message: "ok"
            });
        };
        var error = function (xhr, status, errorThrown) {
            callback (false, {
                command: parsedCommand,
                message: (status || '') + ' ' + (errorThrown || '') + ' (' + xhr.status + ': ' + xhr.statusText + ')',
                status: xhr.status
            });
        };

        RNodeCore.ajax ({
            url: url,
            success: success,
            error: error
        });
    },

    /**
     * Requests that the given R object is graphed to a div
     * with the given name.
     */
    graph: function (robject, div, config) {
        var g = rnode.graph.Graph.find (robject.class());

        if (!g) {
            if (config.callback)
                config.callback (false);
            return;
        }

        if (g.requiresPreviousGraph) {
            if (!this.lastGraph) {
                if (config.callback)
                    config.callback (false); // No previous graph
                return;
            }

            this.lastGraph.extras.push ({ robject: robject, config: config });

            g = rnode.graph.Graph.find (this.lastGraph.robject.class());
            g.plot (div, this.lastGraph.robject, config, this.lastGraph.extras);
        } else {
            g.plot (div, robject, config, null);

            // Store last graph after plot - ensures that if there is a plot
            // error, we don't do this.
            this.lastGraph = {
                robject: robject,
                config: config,
                extras: []
            }
        }
        if (config.callback)
            config.callback (true);
    },

    /**
     * Formats for (HTML) display
     */
    formatForDisplay: function (robject, callback) {
        var d = rnode.display.Display.find (robject);

        if (!d) {
            // If the object is a simple named object,
            // then get pretty format from R itself.
            var cmd = robject.getSourceCommand();
            if (cmd && cmd.isVariable()) {
                var parsedCommand = this.parse ("paste(capture.output(print(" + cmd.get() + ")),collapse=\"\\n\")");
                this.directlyExecute (parsedCommand, function (success, data) {
                    if (success)
                        this.formatForDisplay(data.response, callback);
                    else
                        callback (robject.toString());
                }.createDelegate (this));
                return;
            }

            callback(robject.toString());
            return;
        }

        callback(d.toString (robject));
    },

    /**
     * Extracts all parameters from a command call,
     * and returns the results in an object. non-named
     * parameters are 'named' as '0', '1' etc.
     */
    extractAllParameters: function (parsedCommand, functionName, callback) {
        var params = parsedCommand.extractAllParameters (functionName);
        var getfunction = function (index, name) {
            var a = this[name];
            var nothing = { data: null, result: false };
            var b = index == null || index < 0 ? nothing : this[index];
            return a || b || nothing;
        };

        if (pv.keys(params).length == 0)
            return callback ({ get: getfunction });

        var handler = function (key, result, data) {
            params[key].result = result;
            params[key].data = data.response.serverData;

            var completed = true;
            pv.entries(params).forEach (function (d) {
                if (d.value.result == null) {
                    completed = false;
                }
            });

            if (completed) {
                params.get = getfunction;
                callback (params);
            }
        }

        var sent = false;
        pv.entries(params).forEach (function (d) {
            params[d.key] = { result: null, robject: d.value };
            if (d.value.isLiteral()) {
                params[d.key].result = true;
                params[d.key].data = [d.value.getLiteralValue()];
            } else {
                this.directlyExecute(d.value, function (r, v) { handler(d.key, r, v); });
                sent = true;
            }
        }, this);

        if (!sent) {
            params.get = getfunction;
            callback (params);
        }
    }

});
