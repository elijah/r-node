/*
  Copyright 2010 Jamie Love. All rights reserved.
  
  Redistribution and use in source and binary forms, with or without modification, are
  permitted provided that the following conditions are met:
  
     1. Redistributions of source code must retain the above copyright notice, this list of
        conditions and the following disclaimer.
  
     2. Redistributions in binary form must reproduce the above copyright notice, this list
        of conditions and the following disclaimer in the documentation and/or other materials
        provided with the distribution.
  
  THIS SOFTWARE IS PROVIDED BY JAMIE LOVE ``AS IS'' AND ANY EXPRESS OR IMPLIED
  WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JAMIE LOVE OR
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
  ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
  The views and conclusions contained in the software and documentation are those of the
  authors and should not be interpreted as representing official policies, either expressed
  or implied, of Jamie Love.
*/
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


