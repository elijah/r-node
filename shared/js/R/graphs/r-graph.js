/**
 * Graphs
 */

Ext.ns ('rnode.graph');

rnode.graph.Graph = function () {
}

rnode.graph.Graph = Ext.extend (rnode.graph.Graph,  {

    injectExtraPlots: function (visInfo, list, config) {
        if (!list) 
            return;

        list.forEach (function (o) {
            var g = rnode.graph.Graph.find (o.robject.class());

            if (!g) 
                throw new Error ("Cannot find graph for " + o.robject.class());

            g.plotOver (visInfo, o.robject, o.config);

        });
    }
});

rnode.graph.Graph.register = function (class, constructor) {
    rnode.graph.Graph.availableGraphs = rnode.graph.Graph.availableGraphs || {};
    rnode.graph.Graph.availableGraphs[class] = constructor;
}

rnode.graph.Graph.find = function (class) {
    return rnode.graph.Graph.availableGraphs[class] ?
        new rnode.graph.Graph.availableGraphs[class] ()
        : null;
}


