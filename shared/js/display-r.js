/**
 * Display functions for displaying R results.
 */
window.rnode = window.rnode || {};
rnode.R = rnode.R || {};

rnode.R.Display = function () {
}

rnode.R.Display.prototype.setPlotter = function(callback) {
    this.plotter = callback;
    return this;
}

rnode.R.Display.prototype.display = function (rResp) {

    if (!rResp) return "";
    
    if (rResp.length) { // Array
        return rResp;
    }

    if (rResp.attributes) {
        if (rResp.attributes.class == "histogram") {
            this.plotter (new rnode.graphs.Histogram(), rResp);
        }
    }
    return "";
}
