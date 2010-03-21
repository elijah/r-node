
rnode.command.Histogram = Ext.extend (rnode.R.ParsedCommand, {
    canHandle: function (parsedCommand) {
        return parsedCommand.isFunction() && parsedCommand.getFunctionName() == 'hist';
    },

    execute: function (rApi, parsedCommand, userCallback) {
        // First, ensure we have 'plot=false' in the command (change it if we need to).
        parsedCommand.adjustFunctionParameter('hist', 'plot', 'FALSE');
        rApi.directlyExecute (parsedCommand, function (result, data) {
            userCallback (result, data);
        });
    }
});

rnode.command.CommandHandler.register (rnode.command.Histogram);
