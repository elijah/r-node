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
 * Provides a login screen to log into the R-Node server.
 */
Ext.ns('rui.ux');

rui.ux.LoginWindow = Ext.extend(Ext.Window, {

    login: function () {
        var u = this.findById('username');
        var p = this.findById('password');
        if (u.getValue().length > 0 && p.getValue().length > 0) {
                this.loadMask.show();
                this.findById('loginfailuremsg').setVisible(false);
                rui.R.connect (u.getValue(), p.getValue(), function (result) {
                    this.loadMask.hide();
                    if (result) {
                        this.close();
                    } else {
                        this.findById('loginfailuremsg').setVisible(true);
                        p.setValue('');
                    }

                }.createDelegate(this));
        }
    }

    , initComponent: function () {
        this.loadMask = new Ext.LoadMask(Ext.getBody(), {msg:"Logging in..."});

        Ext.apply (this, {
            layout: 'form'
            , title: 'Login to the R Server'
            , width: 300
            , closable: false
            , padding: 10
            , modal: true
            , items: [
                new Ext.form.TextField({
                    fieldLabel: 'Username'
                    , width: 160
                    , minLength: 1
                    , allowBlank: false
                    , id: 'username'
                })
                , new Ext.form.TextField({
                    fieldLabel: 'Password'
                    , width: 160
                    , minLength: 1
                    , allowBlank: false
                    , id: 'password'
                    , listeners: {
                        specialkey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                this.login();
                            }
                        }.createDelegate(this)
                    }
                })
                , new Ext.form.Label ({
                    id: 'loginfailuremsg'
                    , hidden: true
                    , style: {
                        color: 'red'
                    }
                    , text: 'Login failure, username or password mismatch.'
                })
            ]
            , buttons: [
                {
                    id: 'login'
                    , text: 'Login'
                    , handler: function () {
                        this.login();
                    }.createDelegate (this)
                }
            ]
        });

        rui.ux.LoginWindow.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('rui-login', rui.ux.LoginWindow);

