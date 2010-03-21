
/**
 * Lines
 */

rnode.graph.LinesDefault = Ext.extend (rnode.graph.Graph, {

    requiresPreviousGraph: true,

    constructor: function () {
        rnode.graph.LinesDefault.superclass.constructor.call (this);
    },


    plot: function (target, d, config) { 
        // does not get implemented.
        throw new Error ('rnode.graph.LinesDefault requires a previous graph.');
    },

    plotOver: function (visInfo, d, config) {
         
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
        
        visInfo.root.add (pv.Line)
            .data (dataToGraph)
            .bottom (function (d) { return visInfo.yscale(d.y); })
            .left (function (d) { return visInfo.xscale (d.x); })
            ;
    }
});


rnode.graph.Graph.register ('lines.default', rnode.graph.LinesDefault);


