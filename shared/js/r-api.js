/**
 * An API/R interface representing a single R workspace and connection.
 * Can be used client or server side.
 */

Ext.ns ('rnode');

rnode.R.API = function (config) {
    this.rUrlBase = "/R/";
    this.workspace = new rnode.R.Workspace();
    this.parser = new rnode.R.Parser();
    this.state = rnode.R.API.STATE_UNCONNECTED;
    Ext.apply (this, config);

};

rnode.R.API.STATE_UNCONNECTED = "unconnected";
rnode.R.API.STATE_CONNECTED = "connected";

rnode.R.API = Ext.extend (rnode.R.API, {
    
    /**
     * Connect to the R server, using the given username and password.
     *
     * Currently does nothing but calls the callback, with a single parameter 'true'.
     */
    connect: function (username, password, callback) {
        if (callback)
            callback (true);
        this.state = rnode.R.API.STATE_CONNECTED;
    },

    /**
     * Run the given R command.
     *
     * It will call the given callback function when the
     * R
     */
    eval: function (command, callback) {
        var parsedCommand = this.parse (command);
        if (this.state != rnode.R.API.STATE_CONNECTED) {
            callback (false, {command: parsedCommand, message: "unconnected" });
            return;
        }

        // First, try and find a specialist handler.
        var sh = rnode.command.CommandHandler.findHandler (parsedCommand);
        if (sh) {
            return sh.execute (this, parsedCommand, callback);
        }

        // If not, directly run it.
        if (parsedCommand.isSupported ()) {
            this.directlyExecute(parsedCommand, callback);
        } else {
            callback (false, { command: parsedCommand, message: "unsupported" });
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
        if (window.$) { // jQuery
            $.ajax({
                url: this.rUrlBase + encodeURIComponent(parsedCommand.get()),
                success: function (data) { 
                    callback (true, { 
                        response: new rnode.R.RObject ($.parseJSON(data)),
                        command: parsedCommand,
                        message: "ok"
                    }); 
                }
            });
        } else { // ExtJS
            Ext.Ajax.request ({
                url: this.rUrlBase + encodeURIComponent(parsedCommand.get()),
                method: 'GET',
                success: function (xhr, config) { 
                    callback (true, { 
                        response: new rnode.R.RObject(Ext.util.JSON.decode (xhr.responseText)),
                        command: parsedCommand,
                        message: "ok"
                    }); 
                }
            });
        }
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
            if (!this.lastGraph)
                return config.callback (false); // No previous graph

            this.lastGraph.extras.push ({ robject: robject, config: config });

            g = rnode.graph.Graph.find (this.lastGraph.robject.class());
            g.plot (div, this.lastGraph.robject,  this.lastGraph.config, this.lastGraph.extras);
        } else {
            this.lastGraph = {
                robject: robject,
                config: config,
                extras: []
            }

            g.plot (div, robject, config, null);
        }
        if (config.callback)
            config.callback (true);
    },

    /**
     * Formats for (HTML) display
     */
    formatForDisplay: function (robject) {
        var d = rnode.display.Display.find (robject);

        if (!d) {
            return robject.toString();
        }

        return d.toString (robject);
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
            var b = this[index];
            return this[name] || this[index] || null;
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
        Ext.each(pv.entries(params), function (d) {
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
