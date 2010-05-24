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
 * An object representing a response from R. It provides access to all the internals
 * of the response, and provides some helper functions that help hide the exact return
 * format.
 *
 * TODO: Define general valid formats of data that R will return, and what they mean
 *       x.values vs. x.data vs. x.attributes
 *
 * It does not provide general display functionality, though it will convert the
 * data to a string (basically a JSON string) for debug purposes.
 */

RNodeCore.ns ('rnode.R');

/**
 * Constructor.
 *
 * Parameters:
 *      serverData    The data returned from the server, as an object (rather than
 *                    in JSON format).
 *
 *      originalParsedCommand
 *                    The original command that caused the response, or null if
 *                    this is not relevant or available.
 */
rnode.R.RObject = function (serverData, originalParsedCommand) {
    if (!serverData) {
        throw new Error ("rnode.R.RObject created with null server data.");
    }
    this.originalParsedCommand = originalParsedCommand;
    this.serverData = serverData;
}

rnode.R.RObject = RNodeCore.extend (rnode.R.RObject, {

    /**
     * Returns the class of the object, if it has one.
     */
    class: function () {
        if (this.isArray()) {
            return 'array';
        }

        if (this.serverData) {
            if (this.serverData.attributes && this.serverData.attributes.class) {
                return this.serverData.attributes.class;
            }

            if (this.serverData.data) { // No class, but a data item == a list of data.
                return 'list';
            }

            if (this.serverData.message) { // Errors are provided as just an object with a property 'message'
                return 'error';
            }
        }

        throw new Error ('Cannot figure out class for R object');
    },

    /**
     * Test if the R object is a plain array of data.
     *
     * Returns true when it is, false otherwise.
     */
    isArray: function () {
        return RNodeCore.isArray(this.serverData);
    },

    /**
     * Returns the R data as an array. It only does this if it is possible to
     * present the R data as a single array of information.
     */
    toArray: function () {
        if (!this.isArray())
            throw new Error ("rnode.R.RObject.toArray() called for non-array.");

        return this.serverData;
    },

    /**
     * Attempts to find some data from the R response with the given name.
     * It currently only looks at the returned R data.
     *
     * TODO: Expand on what can be searched.
     *
     * Parameters
     *      n   The name of the data to return.
     */
    find: function (n) {
        if (this.isArray() || !this.serverData || !this.serverData.data) {
            return null;
        }

        return this.serverData.data[n];
    },

    /**
     * Returns true if the server data includes named data 'n'.
     *
     * Parameters
     *      n   The name of the data to return.
     */
    has: function (n) {
        return this.find(n) != null;
    },

    data: function () {
        if (!this.serverData || !this.serverData.data || RNodeCore.isArray(this.serverData)) {
            return null;
        }

        return this.serverData.data;
    },

    values: function () {
        if (!this.serverData || !this.serverData.values) {
            return null;
        }

        return this.serverData.values;
    },

    /**
     * Returns the data as a string.
     */
    toString: function () {
        return  JSON.stringify (this.serverData);
    },

    plottable: function () {
        return rnode.graph.Graph.find (this.class()) != null;
    },

    getSourceCommand: function () {
        return this.originalParsedCommand;
    },

    getAttribute: function (attr) {
        if (!this.serverData || !this.serverData.attributes) {
            return null;
        }

        return this.serverData.attributes[attr];
    }
});


