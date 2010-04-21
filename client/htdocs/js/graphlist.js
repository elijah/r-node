/**
 *  Copyright 2010 Jamie Love

 *  This file is part of the "R-Node Client".

 *  R-Node Client is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  R-Node Client is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with R-Node Client.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * An ExtJS widget to show a list of the graphs created by users.
 */
Ext.ns('rui.ux');

rui.ux.GraphList = Ext.extend(Ext.Panel, {

    addGraph: function(robject, originalCommand) {
    },

    initComponent: function () {
        this.graphlistDiv = Ext.id();

        Ext.apply (this, {
            layout: 'border'
            , items: [
                new Ext.BoxComponent({
                    region: 'center'
                    , autoEl: {
                        id: this.graphlistDiv
                        , tag: 'div'
                    }
                })
            ]
        });

        rui.ux.GraphList.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('rui-graph-list', rui.ux.GraphList);

