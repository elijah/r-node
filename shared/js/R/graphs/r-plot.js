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


rnode.graph.PlotDefault = Ext.extend (rnode.graph.Graph, {

    constructor: function () {
        this.axes = true;
        rnode.graph.PlotDefault.superclass.constructor.call (this);
    },


    plot: function (target, d, config, extra) {

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

        var yDataToGraph = d.find('y');
        var dataToGraph = [];

        if (yDataToGraph == null) {
            yDataToGraph = d.find('x');
            counter = 0;
            yDataToGraph.forEach (function (y) { dataToGraph.push ( { x: counter++, y: y } ); });
        } else {
            var xDataToGraph = d.find('x');
            counter = 0;
            yDataToGraph.forEach (function (y) { dataToGraph.push ( { x: xDataToGraph[counter++], y: y } ); });
        }

        var xmin = pv.min(dataToGraph, function (d) { return d.x });
        var ymin = pv.min(dataToGraph, function (d) { return d.y });
        var xmax = pv.max(dataToGraph, function (d) { return d.x });
        var ymax = pv.max(dataToGraph, function (d) { return d.y });

        var yscale = pv.Scale.linear (ymin, ymax).range (0, elHeight - buffer).nice();
        var xscale = pv.Scale.linear (xmin, xmax).range (0, elWidth - buffer).nice();

        vis.add (pv.Dot)
            .data (dataToGraph)
            .bottom (function (d) { return yscale(d.y); })
            .left (function (d) { return xscale (d.x); })
            .size (config.small ? 1 : 5)
            ;

        if (!config.small) {
            var yticks = yscale.ticks();
            vis.add (pv.Rule)
                .data (yticks)
                .left (-10)
                .width(function (d) { return this.index != 0 ? 10 : 10 + elWidth - buffer; })
                .bottom (function (d) { return yscale(d); })
                .antialias(false)
                .anchor('left').add(pv.Label)
                .text (function (d) { return yscale.tickFormat(d) });
            var xticks = xscale.ticks();
            vis.add (pv.Rule)
                .data (xticks)
                .bottom (-10)
                .height (function (d) { return this.index != 0 ? 10 : 10 + elHeight - buffer; })
                .left (function (d) { return xscale(d); })
                .antialias(false)
                .anchor('bottom').add(pv.Label)
                .text (function (d) { return xscale.tickFormat(d) });
        }

        this.injectExtraPlots ({
            root: vis,
            xscale: xscale,
            yscale: yscale
        }, extra, config);


        vis.render();
    }
});


rnode.graph.Graph.register ('plot.default', rnode.graph.PlotDefault);

