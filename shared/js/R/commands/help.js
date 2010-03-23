
rnode.command.Help = Ext.extend (rnode.R.ParsedCommand, {
    canHandle: function (parsedCommand) {
        return parsedCommand.get().match(/^help/) || parsedCommand.get().match(/^\?/);
    },

    execute: function (rApi, parsedCommand, userCallback) {
            userCallback (false, { command: parsedCommand, message: "unsupported" });
    }
});

rnode.command.CommandHandler.register (rnode.command.Help);

