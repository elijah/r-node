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
 * Histogram
 */

rnode.graph.Histogram = RNodeCore.extend (rnode.graph.Graph, {

    constructor: function () {
        this.axes = true;
        rnode.graph.Histogram.superclass.constructor.call (this);
    },


    plot: function (target, d, config) {

        var elHeight = $('#' + target).height();
        var elWidth = $('#' + target).width();
        var vis;

        if (config.small) {
            vis = new pv.Panel()
                .canvas (target)
                .width (elWidth)
                .height (elHeight);
        } else {
            vis = new pv.Panel()
                .canvas (target)
                .width (elWidth - 80)
                .height (elHeight - 80)
                .left (60)
                .right (20)
                .top (40)
                .bottom (40)
                ;
        }
        var buffer = config.small ? 0 : 80;

        var dataToGraph = d.find('counts');

        var yscale = pv.Scale.linear (0, pv.max (dataToGraph)).range (0, elHeight - buffer).nice();
        var xscale = pv.Scale.linear (0, dataToGraph.length).range (0, elWidth - buffer);

        vis.add (pv.Bar)
            .data (dataToGraph)
            .bottom (0)
            .height (yscale)
            .left (function (d) { return xscale(this.index); })
            .width (xscale(1) - xscale(0))
            ;

        if (!config.small) {

            var yticks = yscale.ticks();
            yticks[yticks.length - 1] = pv.max(dataToGraph);
            vis.add (pv.Rule)
                .data (yticks)
                .left (-10)
                .width(function (d) { return this.index != 0 ? 10 : 10 + elWidth - buffer; })
                .bottom (function (d) { return yscale(d); })
                .antialias(false)
                .anchor('left').add(pv.Label)
                .text (function (d) { return d });

            vis.add (pv.Rule)
                .data (d.find('breaks'))
                .left (function (d) { return xscale(this.index); })
                .height (function (d) { return this.index != 0 ? 10 : 10 + yscale(yticks[yticks.length - 1]); })
                .bottom (-10)
                .antialias(false)
                .anchor('bottom').add(pv.Label)
                .text (function (d) { return d.toFixed(2); });
        }

        vis.render();
    }
});


rnode.graph.Graph.register ('histogram', rnode.graph.Histogram);

