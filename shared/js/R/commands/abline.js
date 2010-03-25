
rnode.command.AbLine = Ext.extend (rnode.R.ParsedCommand, {
    canHandle: function (parsedCommand) {
        return parsedCommand.isFunction() && parsedCommand.getFunctionName() == 'abline';
    },

    execute: function (rApi, parsedCommand, userCallback) {

        rApi.extractAllParameters (parsedCommand, 'abline', function (results) {
            var serverData = {
                attributes: { class: 'abline.default' },
                data: { 
                    a: results.get(0, 'a').data,
                    b: results.get(1, 'b').data
                }
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

rnode.command.CommandHandler.register (rnode.command.AbLine);



