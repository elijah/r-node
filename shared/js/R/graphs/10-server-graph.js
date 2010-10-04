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
 * Wrapper to handle the display of graphs generated on the server,
 * and provided to us via JPG, PNG, PDF etc.
 *
 * As some of these are not really loadable in the UI well, we deal
 * with providing download as well as load into target DIV.
 */

rnode.graph.ServerGraph = RNodeCore.extend (rnode.graph.Graph, {

    constructor: function () {
        rnode.graph.ServerGraph.superclass.constructor.call (this);
    },


    plot: function (target, d, config, extra) {
        var type = d.getAttribute('type');
        if (type == 'png' || type == 'jpg') {
            var el = Ext.get (target);
            el.update('<img src="/pager/' + d.values()[0] + '?keep=1" width="' + config.width  + '" height="' + config.height + '"/>');
        } else {
            window.open ('/pager/' + d.values()[0], 'server-graph', 'status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=1,scrollbars=1,height=600,width=600');
        }
    }
});


rnode.graph.Graph.register ('RNodeGraph', rnode.graph.ServerGraph);


