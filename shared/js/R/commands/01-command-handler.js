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
 * Specialist command handler.
 */

RNodeCore.ns ('rnode.command');

rnode.command.CommandHandler = function () {
}

rnode.command.CommandHandler = RNodeCore.extend (rnode.command.CommandHandler, {

    canHandle: function (parsedCommand) {
        throw new Error ('rnode.command.CommandHandler.canHandle base function is abstract.');
    },

    execute: function (rApi, parsedCommand, userCallback, consolePrint) {
        throw new Error ('rnode.command.CommandHandler.execute base function is abstract.');
    },

    /**
     * isGraphingCommand() is used once a command object has been identified
     * as being able to handle a R command.  It is used to identify graphing
     * commands, and possibly not use them if the client doesn't want the
     * graphs to be done via SVG and protovis.
     */
    isGraphingCommand: function () {
        return false;
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


