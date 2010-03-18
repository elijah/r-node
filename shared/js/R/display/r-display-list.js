/**
 * A list
 */

rnode.display.List = Ext.extend (rnode.display.Display, {
    toString: function (robject) {
        var data = robject.data();

        var keys = pv.keys (data);
        var ret = "<dl>";
        keys.forEach (function (d) {
            ret += "<dt>$" + d;
            ret += "<dd><pre style='padding-left: 10px'>" + rnode.display.Array.formatArray(data[d]) + "\n</pre></dd>";
        });
        ret += '</dl>';
        return {
            html: true,
            content: ret
        };
    }
});

rnode.display.Display.register ('list', rnode.display.List);
