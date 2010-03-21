/**
 * Plain array of data.
 */

rnode.display.Array = Ext.extend (rnode.display.Display, {
    toString: function (robject) {
        if (!robject.isArray()) {
            return "rnode.display.DisplayArray: cannot display. " + robject.toString();
        }

        var a = robject.toArray();
        if (a.length == 1 && typeof a[0] === 'string') {
            return a[0]; // If it's only a single string, just return it as a string.
        }

        return rnode.display.Array.formatArray(a);
    }
});

//
// Formats an array into a textual string
// 
rnode.display.Array.formatArray = function (a) {
    var ret = "";
    for (var i = 0; i < a.length; i++) {
        if (i % 10 == 0) {
            if (i > 0) 
                ret += "\n"; 
            ret += "[" + (i+1) + "] ";
        }
        if (typeof a[i] === 'string') {
            ret += '"' + a[i] + '" ';
        } else {
            ret += sprintf ("% 4.4f ", a[i]);
        }
    }

    return ret;
}

rnode.display.Display.register ('array', rnode.display.Array);
