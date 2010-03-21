/**
 * Specialist command handler.
 */

Ext.ns ('rnode.command');

rnode.command.CommandHandler = function () {
}

rnode.command.CommandHandler = Ext.extend (rnode.command.CommandHandler, {

    canHandle: function (parsedCommand) {
        throw new Error ('rnode.command.CommandHandler.canHandle base function is abstract.');
    },

    execute: function (rApi, parsedCommand) {
        throw new Error ('rnode.command.CommandHandler.execute base function is abstract.');
    }
});

rnode.command.CommandHandler.register = function (constructor) {
    rnode.command.CommandHandler.specialistCommands = rnode.command.CommandHandler.specialistCommands || [];
    rnode.command.CommandHandler.specialistCommands.push( {
        checker: new constructor(),
        constructor: constructor
    });
}

rnode.command.CommandHandler.findHandler = function (parsedCommand) {
    var handler = null;
    rnode.command.CommandHandler.specialistCommands.forEach(function (h) {
        if (h.checker.canHandle (parsedCommand)) {
            handler = h;
        }
    });
    if (handler) {
        return new handler.constructor();
    }
    return null;
}


