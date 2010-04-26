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

/**
 * This provides the R-Node feedback form
 */

Ext.ns('rui.ux');

rui.ux.Feedback = Ext.extend(Ext.Window, {

    initComponent: function () {
        Ext.apply (this, {
            layout: 'border'
            , title: 'Please Give Feedback'
            , width: 400
            , height: 300
            , items: [
                {
                    region: 'north'
                    , html: " <p> Suggestions, comments?  <p> Have you found a bug?  <p> Jamie would love to hear from you: <p> "
                    , padding: 5
                    , border: false
                }
                , new Ext.form.TextArea({
                    id: 'feedbacktext'
                    , region: 'center'
                    , border: false
                })
                , {
                    region: 'south'
                    , html: "Join the discussion in the <a href='http://groups.google.com/group/r-node-users'>R-Node users group "
                    , padding: 5
                    , border: false
                }
            ]
            , buttons: [
                {
                    text: 'Deliver'
                    , handler: function () {
                        var t = this.findById('feedbacktext').getValue();
                        if (t.length > 0) {
                            Ext.Ajax.request ({
                                url: '/feedback'
                                , method: 'POST'
                                , params: t
                            })
                            Ext.Msg.alert('Success', 'Thankyou! Feedback delivered');
                        }
                        this.close();
                    }.createDelegate (this)
                }
            ]
        });
        rui.ux.Feedback.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('rui-feedback', rui.ux.Feedback);
