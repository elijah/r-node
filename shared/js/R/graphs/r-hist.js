/**
 * Histogram
 */

rnode.graph.Histogram = Ext.extend (rnode.graph.Graph, {

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
                .text (function (d) { return d });
        }

        vis.render();
    }
});


rnode.graph.Graph.register ('histogram', rnode.graph.Histogram);

