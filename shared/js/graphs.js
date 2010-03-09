/**
 * Graphs
 */

window.rnode = window.rnode || {};
rnode.graphs = rnode.graphs || {};

rnode.graphs.Histogram = function (config) {
    this.axes = true;
}

rnode.graphs.Histogram.prototype.plot = function (d) { 

    console.log ("data", d);

    var vis = new pv.Panel()
        .canvas ('plot')
        .width (800 - 80)
        .height (400 - 80)
        .left (60)
        .right (20)
        .top (40)
        .bottom (40)
        ;

    var yscale = pv.Scale.linear (0, pv.max (d.values[1])).range (0, 400 - 80).nice();
    var xscale = pv.Scale.linear (0, d.values[1].length).range (0, 800 - 80);

    vis.add (pv.Bar)
        .data (d.values[1])
        .bottom (0)
        .height (yscale)
        .left (function (d) { return xscale(this.index); })
        .width (xscale(1) - xscale(0))
        ;

    var yticks = yscale.ticks();
    yticks[yticks.length - 1] = pv.max(d.values[1]);
    vis.add (pv.Rule)
        .data (yticks)
        .left (-10)
        .width(function (d) { return this.index != 0 ? 10 : 10 + 800 - 80; })
        .bottom (function (d) { return yscale(d); })
        .antialias(false)
        .anchor('left').add(pv.Label)
        .text (function (d) { return d });

    vis.add (pv.Rule)
        .data (d.values[0])
        .left (function (d) { return xscale(this.index); })
        .height (function (d) { return this.index != 0 ? 10 : 10 + yscale(yticks[yticks.length - 1]); })
        .bottom (-10)
        .antialias(false)
        .anchor('bottom').add(pv.Label)
        .text (function (d) { return d });



    vis.render();
}
