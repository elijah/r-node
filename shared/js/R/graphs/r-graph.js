/**
 * Graphs
 */

Ext.ns ('rnode.graph');

rnode.graph.Graph = function () {
}

rnode.graph.Graph.register = function (class, constructor) {
    rnode.graph.Graph.availableGraphs = rnode.graph.Graph.availableGraphs || {};
    rnode.graph.Graph.availableGraphs[class] = constructor;
}

rnode.graph.Graph.find = function (class) {
    return new rnode.graph.Graph.availableGraphs[class] ();
}


