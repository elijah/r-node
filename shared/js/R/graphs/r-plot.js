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

        var canvas = this.createCanvas (target, !config.small, { l: 60, t: 40, b: 40 });
        var vis = canvas.vis;

        var yDataToGraph = d.find('y');
        var dataToGraph = [];
        var randomX = false;

        if (yDataToGraph == null) {
            yDataToGraph = d.find('x');
            counter = 0;
            yDataToGraph.forEach (function (y) { dataToGraph.push ( { x: counter++, y: y } ); });
        } else {
            var xDataToGraph = d.find('x');
            counter = 0;
            var randomX = true;
            yDataToGraph.forEach (function (y) { dataToGraph.push ( { x: xDataToGraph[counter++], y: y } ); });
        }

        var xmin = pv.min(dataToGraph, function (d) { return d.x });
        var ymin = pv.min(dataToGraph, function (d) { return d.y });
        var xmax = pv.max(dataToGraph, function (d) { return d.x });
        var ymax = pv.max(dataToGraph, function (d) { return d.y });

        var yscale = pv.Scale.linear (ymin, ymax).range (0, canvas.h).nice();
        var xscale = pv.Scale.linear (xmin, xmax).range (0, canvas.w).nice();

        vis.event("mousemove", pv.Behavior.point(Infinity).collapse("y"));

        var type = d.find('type') || ['p'];
        var plotted = false;
        type = type[0];

        var title = function (d) {
            return randomX ?  "(" + d.x + ", " + d.y + ")" : d.y;
        }

        var tipsyConfig = {
            gravity: 's',
        }

        if (type == 'l' || type == 'o') {
            var l = vis.add (pv.Line)
                .data (dataToGraph)
                .bottom (function (d) { return yscale(d.y); })
                .left (function (d) { return xscale (d.x); });

            if (!config.small) {
                l.title (title);
                //.event("point", pv.Behavior.tipsy(tipsyConfig));
            }
            plotted = true;
        }
        if (type == 'p' || type == 'o') {
            var l = vis.add (pv.Dot)
                .data (dataToGraph)
                .bottom (function (d) { return yscale(d.y); })
                .left (function (d) { return xscale (d.x); })
                .size (config.small ? 1 : 8);

            if (!config.small && type == 'p') {
                l.title (title);
                //.event("point", pv.Behavior.tipsy(tipsyConfig));
            }
            plotted = true;
        }
        if (!plotted)
            throw new Error ('Error in plot(): Invalid plot type "' + type + '"');

        if (!config.small) {
            var yticks = yscale.ticks();
            if (yticks[0] != ymin)
                yticks.unshift (ymin);
            vis.add (pv.Rule)
                .data (yticks)
                .left (-10)
                .width(function (d) { return this.index != 0 ? 10 : 10 + canvas.w; })
                .bottom (function (d) { return yscale(d); })
                .antialias(false)
                .anchor('left').add(pv.Label)
                .text (function (d) { return yscale.tickFormat(d) });
            var xticks = xscale.ticks();
            if (xticks[0] != xmin)
                xticks.unshift (xmin);
            vis.add (pv.Rule)
                .data (xticks)
                .bottom (-10)
                .height (function (d) { return this.index != 0 ? 10 : 10 + canvas.h; })
                .left (function (d) { return xscale(d); })
                .antialias(false)
                .anchor('bottom').add(pv.Label)
                .text (function (d) { return xscale.tickFormat(d) });

            var xlab = d.find ('xlab');
            if (xlab) {
                vis.add (pv.Label)
                    .data (xlab)
                    .left (canvas.w / 2)
                    .bottom (-1 * canvas.b)
                    .textBaseline ("bottom")
                    .textAlign("center");
            }

            var ylab = d.find ('ylab');
            if (ylab) {
                vis.add (pv.Label)
                    .data (ylab)
                    .top (canvas.h / 2)
                    .left (-1 * canvas.l)
                    .textBaseline ("top")
                    .textAlign("center")
                    .textAngle (-Math.PI / 2);
            }

            var main = d.find ('main');
            if (main) {
                vis.add (pv.Label)
                    .data (main)
                    .left (canvas.w / 2)
                    .top (-1 * canvas.t)
                    .textBaseline ("top")
                    .textAlign("center");
            }
            var sub = d.find ('sub');
            if (sub) {
                vis.add (pv.Label)
                    .data (sub)
                    .left (canvas.w / 2)
                    .top (-1 * canvas.t + 15)
                    .textBaseline ("top")
                    .textAlign("center");
            }
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

