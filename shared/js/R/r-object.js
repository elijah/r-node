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
        if (Ext.isArray(this.serverData)) {
            return '';    
        }

        if (this.serverData && this.serverData.attributes && this.serverData.attributes.class) {
            return this.serverData.attributes.class;
        }

        return '';
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

    /**
     * Returns the data as a string.
     */
    toString: function () {
        return  JSON.stringify (this.serverData);
    }

});


