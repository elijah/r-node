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
 * Provides core functions for javascript code, to ensure that all R-Node shared code does
 * not rely on a single underlying library.
 */

RNodeCore = function () {
    return {

        /**
         * Creates a namespace, if one doesn't already exist, at the top level. Format is
         * dot notation, just like ExtJS supports.
         */
        ns: function (s) {
            return Ext.ns(s);
        },

        /**
         * Merges all properties from arguments provided to the first argument.
         */
        apply: function () {
            var args = Array.prototype.slice.call(arguments);
            return Ext.apply.apply (this, args);
        },

        /**
         * Extends an object with the properties and functions of one or more additional
         * objects. This extends the object prototype, having the same semantics as
         * Ext.extend from ExtJS.
         */
        extend: function () {
            var args = Array.prototype.slice.call(arguments);
            return Ext.extend.apply (this, args);
        },

        /**
         * Tests whether the given object is a real javascript array or not, or at least
         * fakes one well enough to pass as an array.
         */
        isArray: function (a) {
            return Ext.isArray (a);
        },

        /**
         * Perform an Ajax call. pass in:
         *
         * url: Url for Ajax call
         * success: success handler
         * error: error handler.
         */
        ajax: function (config) {
            config.type = config.type || "json";
            if (window.$) { // jQuery
                $.ajax({
                    url: config.url,
                    success: function (data) { if (config.success) config.success (config.type == "json" ? $.parseJSON(data) : data); },
                    error: function (xhr, status, errorThrown) { if (config.error) config.error (xhr, status, errorThrown); }
                });
            } else { // ExtJS
                Ext.Ajax.request ({
                    url: config.url,
                    method: 'GET',
                    success: function (xhr, config) { if (config.success) config.success (config.type == "json" ? Ext.util.JSON.decode (xhr.responseText) : xhr.responseText); },
                    error: function (xhr, config) { if (config.error) config.error (xhr, 'unknown', 'unknown'); }
                });
            }
        }
    };
}();
