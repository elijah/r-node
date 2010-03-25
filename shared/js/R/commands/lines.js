
rnode.command.Lines = Ext.extend (rnode.R.ParsedCommand, {
    canHandle: function (parsedCommand) {
        return parsedCommand.isFunction() && parsedCommand.getFunctionName() == 'lines';
    },

    execute: function (rApi, parsedCommand, userCallback) {

        rApi.extractAllParameters (parsedCommand, 'lines', function (results) {
            var serverData = {
                attributes: { class: 'lines.default' },
                data: { 
                }
            }
            if (results.get (1, 'y')) {
                // has y data, so get x explicitly
                serverData.data.x = results.get(0, 'x').data
                serverData.data.y = results.get(1, 'y').data
            } else {
                serverData.data.x = results.get(0, 'x').data
            }
            var resp = new rnode.R.RObject (serverData);
            userCallback (true, {
                command: parsedCommand,
                response: resp,
                message: 'ok'
            });
        });
    }
});

rnode.command.CommandHandler.register (rnode.command.Lines);


