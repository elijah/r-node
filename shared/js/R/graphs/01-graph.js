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
 * Graphs
 */

RNodeCore.ns ('rnode.graph');

rnode.graph.Graph = function () {
}

rnode.graph.Graph = RNodeCore.extend (rnode.graph.Graph,  {

    injectExtraPlots: function (visInfo, list, config) {
        if (!list)
            return;

        list.forEach (function (o) {
            var g = rnode.graph.Graph.find (o.robject.class());

            if (!g)
                throw new Error ("Cannot find graph for " + o.robject.class());

            g.plotOver (visInfo, o.robject, o.config);

        });
    },

    createCanvas: function (target, includeBuffers, buffers) {
        buffers.t = buffers.t || 10;
        buffers.b = buffers.b || 10;
        buffers.l = buffers.l || 10;
        buffers.r = buffers.r || 10;
        var c = {
            h: buffers.h,
            w: buffers.w,
            t: buffers.t,
            b: buffers.b,
            l: buffers.l,
            r: buffers.r
        };
        if (includeBuffers) {
            c.h = c.h - buffers.t - buffers.b;
            c.w = c.w - buffers.l - buffers.r;
            c.vis = new pv.Panel()
                .canvas (target)
                .width (c.w)
                .height (c.h)
                .left (c.l)
                .right (c.r)
                .top (c.t)
                .bottom (c.b)
                ;
        } else {
            c.vis = new pv.Panel()
                .canvas (target)
                .width (c.w)
                .height (c.h);
            c.l = c.t = c.r = c.b = 0;
        }
        return c;
    }
});

rnode.graph.Graph.register = function (class, constructor) {
    rnode.graph.Graph.availableGraphs = rnode.graph.Graph.availableGraphs || {};
    rnode.graph.Graph.availableGraphs[class] = constructor;
}

rnode.graph.Graph.find = function (class) {
    return rnode.graph.Graph.availableGraphs[class] ?
        new rnode.graph.Graph.availableGraphs[class] ()
        : null;
}


