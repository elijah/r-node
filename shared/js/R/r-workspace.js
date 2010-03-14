/**
 * A reproduction of the R object space (as well as we know about it).
 */

Ext.ns ('rnode.R');

rnode.R.Workspace = function () {
    this.objects = {};
}

rnode.R.Workspace = Ext.extend (rnode.R.Workspace, {
    store: function (name, o) {
        this.objects[name] = o;
    },

    has: function (name) {
        return this.objects[name] != null;
    },

    get: function (name) {
        return this.objects[name];
    }
});
