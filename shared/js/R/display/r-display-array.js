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
 * Plain array of data.
 */

rnode.display.Array = RNodeCore.extend (rnode.display.Display, {
    toString: function (robject) {
        if (!robject.isArray()) {
            return "rnode.display.DisplayArray: cannot display. " + robject.toString();
        }

        var a = robject.toArray();
        if (a.length == 1 && typeof a[0] === 'string') {
            return a[0]; // If it's only a single string, just return it as a string.
        }

        return rnode.display.Array.formatArray(a);
    }
});

//
// Formats an array into a textual string
//
rnode.display.Array.formatArray = function (a) {
    var ret = "";
    for (var i = 0; i < a.length; i++) {
        if (i % 10 == 0) {
            if (i > 0)
                ret += "\n";
            ret += "[" + (i+1) + "] ";
        }
        if (typeof a[i] === 'string') {
            ret += '"' + a[i] + '" ';
        } else {
            ret += sprintf ("% 4.4f ", a[i]);
        }
    }

    return ret;
}

rnode.display.Display.register ('array', rnode.display.Array);
