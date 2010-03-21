/**
 * An object representing a response from R. It provides access to all the internals,
 *
 * It does not provide general display functionality, though it will convert the
 * data to a string (basically a JSON string) for debug purposes.
 */
Ext.ns ('rnode.R');

rnode.R.RObject = function (serverData) {
    if (!serverData) {
        throw new Error ("rnode.R.RObject creating with null data.");
    }
    this.serverData = serverData;
}

rnode.R.RObject = Ext.extend (rnode.R.RObject, {
    /**
     * Returns the class of the object, if it has one.
     */
    class: function () {
        if (this.isArray()) {
            return 'array';    
        }

        if (this.serverData && this.serverData.attributes && this.serverData.attributes.class) {
            return this.serverData.attributes.class;
        }

        if (this.serverData.data) { // No class, but a data item == a list of data.
            return 'list'; 
        }

        throw new Error ('Cannot figure out class for R object');
    },

    isArray: function () {
        return Ext.isArray(this.serverData);
    },

    toArray: function () {
        if (!this.isArray())
            throw new Error ("rnode.R.RObject.toArray() called for non-array.");

        return this.serverData;
    },

    /**
     * Finds data with the given name
     */
    find: function (n) {
        if (Ext.isArray(this.serverData)) {
            return null;    
        }

        if (!this.serverData.data) {
            return null;
        }

        return this.serverData.data[n];
    },

    data: function () {
        if (Ext.isArray(this.serverData)) {
            return null;    
        }

        if (!this.serverData.data) {
            return null;
        }

        return this.serverData.data;
    },

    /**
     * Returns the data as a string.
     */
    toString: function () {
        return  JSON.stringify (this.serverData);
    },

    plottable: function () {
        return rnode.graph.Graph.find (this.class()) != null;
    }

});


