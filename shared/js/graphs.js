/**
 * Graphs
 */

window.rnode = window.rnode || {};
rnode.graphs = rnode.graphs || {};

rnode.graphs.Histogram = function (config) {
    this.axes = true;
}

rnode.graphs.Histogram.prototype.plot = function (target, d, small) { 

    var elHeight = $('#' + target).height();
    var elWidth = $('#' + target).width();
    var vis;

    if (small) {
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
    var buffer = small ? 0 : 80;

    var yscale = pv.Scale.linear (0, pv.max (d.data.counts)).range (0, elHeight - buffer).nice();
    var xscale = pv.Scale.linear (0, d.data.counts.length).range (0, elWidth - buffer);

    vis.add (pv.Bar)
        .data (d.data.counts)
        .bottom (0)
        .height (yscale)
        .left (function (d) { return xscale(this.index); })
        .width (xscale(1) - xscale(0))
        ;

    if (!small) {

        var yticks = yscale.ticks();
        yticks[yticks.length - 1] = pv.max(d.data.counts);
        vis.add (pv.Rule)
            .data (yticks)
            .left (-10)
            .width(function (d) { return this.index != 0 ? 10 : 10 + elWidth - buffer; })
            .bottom (function (d) { return yscale(d); })
            .antialias(false)
            .anchor('left').add(pv.Label)
            .text (function (d) { return d });

        vis.add (pv.Rule)
            .data (d.data.breaks)
            .left (function (d) { return xscale(this.index); })
            .height (function (d) { return this.index != 0 ? 10 : 10 + yscale(yticks[yticks.length - 1]); })
            .bottom (-10)
            .antialias(false)
            .anchor('bottom').add(pv.Label)
            .text (function (d) { return d });
    }

    vis.render();
}
