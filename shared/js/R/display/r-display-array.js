/**
 * Histogram
 */

rnode.display.DisplayArray = Ext.extend (rnode.display.Display, {
    toString: function (robject) {
        if (!robject.isArray()) {
            return "rnode.display.DisplayArray: cannot display. " + robject.toString();
        }

        var a = robject.toArray();
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
});

