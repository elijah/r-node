/**
 * Parser to parse R code into expression trees.
 */

window.rnode = window.rnode || {};
rnode.R = rnode.R || {};

rnode.R.Parser = function () {
};

/**
 * Like a completely crap method, just for testing :-) 
 */
rnode.R.Parser.prototype.parse = function (s) {

    var trimmed = s.replace(/^\s+/, '');
    trimmed = trimmed.replace(/\s+$/, '');

    if (trimmed.search (/^hist/) == 0 && trimmed.search (/plot.*=.*false/i) == -1) {
        trimmed = trimmed.replace (/hist\s*\(/, "hist(plot=FALSE,");
    }

    return trimmed;
}
