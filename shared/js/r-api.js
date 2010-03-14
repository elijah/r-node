/**
 * An API/R interface representing a single R workspace and connection.
 * Can be used client or server side.
 */

Ext.ns ('rnode');

rnode.R.API = function (config) {
    Ext.apply (this, config);

    this.rUrlBase = "/R/";
    this.workspace = new rnode.R.Workspace();
    this.parser = new rnode.R.Parser();
    this.state = rnode.R.API.STATE_UNCONNECTED;
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
        var parsedCommand = this.parser.parse (command);
        if (this.state != rnode.R.API.STATE_CONNECTED) {
            callback (false, {command: parsedCommand, message: "unconnected" });
            return;
        }
        if (parsedCommand.isSupported ()) {
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
        } else {
            callback (false, { command: parsedCommand, message: "unsupported" });
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

        g.plot (div, robject, config);

        if (config.callback)
            config.callback (true);
    }
});
