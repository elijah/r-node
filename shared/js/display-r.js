/**
 * Display functions for displaying R results.
 */
window.rnode = window.rnode || {};
rnode.R = rnode.R || {};

rnode.R.Display = function () {
}

rnode.R.display = function (rResp) {

    if (!rResp) return "";
    
    if (rResp.length) { // Array
        return rResp;
    }

    if (rResp.attributes) {
        if (rResp.attributes.class == "histogram") {
            (new rnode.graphs.Histogram()).plot(rResp);
            $('#plot').trigger('click');
        }
    }
    return "";
}
