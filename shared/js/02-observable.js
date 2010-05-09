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
 * An observable object, similar in core ideas to the ExtJS Observable
 * object.
 */

RNodeCore.ns ('rnode');

rnode.Observable = function (config) {

    // Get list of listeners from config.
    if (config && config.listeners) {
        for (var f in config.listeners) {
            if (!this.events[f])
                throw new Error ('Event "' + f + '" in rnode.Observable.');
            this.events[f].listeners.push(config.listeners[f]);
        }
    }
}

rnode.Observable = RNodeCore.extend (rnode.Observable, {

    events: {},

    fireEvent: function (eventName, args) {
        if (!this.events[eventName])
            throw new Error ('Event "' + eventName + '" in rnode.Observable.');

        this.events[eventName].listeners.forEach (function (f) {
            f.call (this, args);
        });
    }

    , addEvent: function (eventName) {
        if (RNodeCore.isArray (eventName)) {
            var me = this;
            eventName.forEach (function (f) { me.addEvent(f); });
        } else {
            this.events[eventName] = {
                listeners: []
            }
        }
    }

    , on: function (eventName, callback) {
        if (!this.events[eventName])
            throw new Error ('Event "' + eventName + '" in rnode.Observable.');
        this.events[eventName].listeners.push (callback);
    }
});


