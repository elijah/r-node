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

rnode.command.Plot = Ext.extend (rnode.R.ParsedCommand, {
    canHandle: function (parsedCommand) {
        return parsedCommand.isFunction() && parsedCommand.getFunctionName() == 'plot';
    },

    execute: function (rApi, parsedCommand, userCallback) {

        // We can't call the plot function, we need to re-implement it's functionality
        // which is basically 'impossible' in general (as it actually calls per-class
        // plot functions if the internal one won't work).
        //
        // Still, we do what we can.

        // First, lets get the first (and if it exists, the second) data object
        rApi.directlyExecute(parsedCommand.extractParameter('plot', 0), function (xresult, xdata) {
            if (xresult) {
                var x = xdata.response;
                var ycmd = parsedCommand.extractParameter('plot', 1);

                if (xresult && ycmd && ycmd.ast.id != '=') { // If we have a y array
                    rApi.directlyExecute (ycmd, function (yresult, ydata) {
                        var y = ydata.response;
                        // Create a fake 'plot' R object, which can then be used and plotted.
                        var serverData = {
                            attributes: { class: 'plot.default' },
                            data: { x: x.serverData, y: y.serverData }
                        }
                        var resp = new rnode.R.RObject (serverData);
                        ydata.response = resp;
                        userCallback (yresult, ydata);
                    });
                } else {
                    // Create a fake 'plot' R object, which can then be used and plotted.
                    var serverData = {
                        attributes: { class: 'plot.default' },
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

rnode.command.CommandHandler.register (rnode.command.Plot);

