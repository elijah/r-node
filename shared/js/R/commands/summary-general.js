
rnode.command.SummaryGeneral = Ext.extend (rnode.R.ParsedCommand, {
    canHandle: function (parsedCommand) {
        return parsedCommand.isFunction() && parsedCommand.getFunctionName().match('^summary.*$') != null;
    },

    execute: function (rApi, parsedCommand, userCallback) {
        // Essentially, have the R server generate the text for this - to many summary commands exist.
        var wrappedCommand = "paste(capture.output(print(" + parsedCommand.get() + ")),collapse=\"\\n\")";
        var parsedWrappedCommand = rApi.parse (wrappedCommand);
        rApi.directlyExecute (parsedWrappedCommand, function (result, data) {
            userCallback (result, data);
        });
    }
});

rnode.command.CommandHandler.register (rnode.command.SummaryGeneral);

