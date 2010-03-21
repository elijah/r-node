

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

