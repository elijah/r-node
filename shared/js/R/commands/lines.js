
rnode.command.Lines = Ext.extend (rnode.R.ParsedCommand, {
    canHandle: function (parsedCommand) {
        return parsedCommand.isFunction() && parsedCommand.getFunctionName() == 'lines';
    },

    execute: function (rApi, parsedCommand, userCallback) {

        // We can't call the lines function, we need to re-implement it's functionality.

        // First, lets get the first (and if it exists, the second) data object
        rApi.directlyExecute(parsedCommand.extractParameter('lines', 0), function (xresult, xdata) {
            if (xresult) {
                var x = xdata.response;
                var ycmd = parsedCommand.extractParameter('lines', 1);

                if (xresult && ycmd && ycmd.ast.id != '=') { // If we have a y array
                    rApi.directlyExecute (ycmd, function (yresult, ydata) {
                        var y = ydata.response;
                        // Create a fake 'lines' R object, which can then be used and plotted.
                        var serverData = {
                            attributes: { class: 'lines.default' },
                            data: { x: x.serverData, y: y.serverData }
                        }
                        var resp = new rnode.R.RObject (serverData);
                        ydata.response = resp;
                        userCallback (yresult, ydata);
                    });
                } else {
                    // Create a fake 'lines' R object, which can then be used and plotted.
                    var serverData = {
                        attributes: { class: 'lines.default' },
                        data: { x: x.serverData }
                    }
                    var resp = new rnode.R.RObject (serverData);
                    xdata.response = resp;
                    userCallback (xresult, xdata);
                }
            }
        });
    }
});

rnode.command.CommandHandler.register (rnode.command.Lines);


