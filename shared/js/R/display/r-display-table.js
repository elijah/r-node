
rnode.display.Table = Ext.extend (rnode.display.Display, {
    toString: function (robject) {
        var r = "<table><tr>";
        var data = robject.data();
        var keys = pv.keys (data);
        keys.forEach (function (d) {
            r += "<th>" + d + "</th>";
        });
        r += "</tr><tr>";
        keys.forEach (function (d) {
            r += "<td>" + data[d] + "</td>";
        });
        r += "</tr></table>";
        return {
            html: true,
            content: r
        };
    }
});

rnode.display.Display.register ('table', rnode.display.Table);
