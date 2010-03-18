/**
 * Plain array of data.
 */

rnode.display.Array = Ext.extend (rnode.display.Display, {
    toString: function (robject) {
        if (!robject.isArray()) {
            return "rnode.display.DisplayArray: cannot display. " + robject.toString();
        }

        return rnode.display.Array(robject.toArray());
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
        ret += sprintf ("% 4.4f ", a[i]);
    }

    return ret;
}

rnode.display.Display.register ('array', rnode.display.Array);
