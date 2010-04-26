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

rui.ux.FileUpload = Ext.extend(Ext.Window, {

    doFileUpload: function () {
        // response...
        this.layout.activeItem.getForm().submit({
            clientValidation: true
            , success: function (form, action) {
                this.close();
                Ext.Msg.alert('Success', action.result.message);
            }.createDelegate(this)
            , failure: function(form, action) {
                switch (action.failureType) {
                    case Ext.form.Action.CLIENT_INVALID:
                        Ext.Msg.alert('Failure', 'Please fill in all required fields.');
                        break;
                    case Ext.form.Action.CONNECT_FAILURE:
                        Ext.Msg.alert('Failure', 'Ajax communication failed');
                        break;
                    case Ext.form.Action.SERVER_INVALID:
                       Ext.Msg.alert('Failure', action.result.message);
               }
            }
        });
    }

    , navHandler: function (direction) {
        var form = this.layout.activeItem.getForm ? this.layout.activeItem.getForm() : null;
        var vals = form ? form.getValues() : null;
        
        if (this.layout.activeItem.id == 'chooseUploadType') {
            // Confirm type of load is selected
            this.layout.setActiveItem (1);
            this.getBottomToolbar().items.get(0).setDisabled(false);
        } else if (this.layout.activeItem.id == 'chooseFile') {
            if (direction < 0) {
                this.layout.setActiveItem(0);
            } else {
                this.doFileUpload();
            }
        } 
    }

    , initComponent: function () {

        Ext.apply (this, {
            layout: 'card'
            , modal: true
            , activeItem: 1
            , title: 'Data Upload'
            , width: 400
            , height: 300
            , defaults: {
                // applied to each contained panel
                border: false
            }
            , items: [
                new Ext.form.FormPanel ({
                    id: 'chooseUploadType'
                    , labelWidth: 240
                    , padding: 10
                    , items: [
                        {
                            xtype: 'fieldset'
                            , title: 'Please select from the following options'
                            , autoHeight:true
                            , items: [
                                new Ext.form.Radio ({
                                    fieldLabel: 'Upload data file from my computer'
                                    , id: 'uploadtypefromcomputer'
                                    , name: 'uploadtype'
                                    , inputValue: 'fromcomputer'
                                })
                                , new Ext.form.Radio ({
                                    fieldLabel: 'Load data from a web service (HTTP URL)'
                                    , name: 'uploadtype'
                                    , inputValue: 'fromweb'
                                })
                            ]
                        }
                    ]
                    , listeners: {
                        afterrender: function (f) {
                            f.findById('uploadtypefromcomputer').setValue(true);
                        }
                    }
                })
                , new Ext.form.FormPanel({
                    id: 'chooseFile'
                    , padding: 10
                    , fileUpload: true
                    , labelWidth: 80
                    , url: '/R/upload'
                    , method: 'GET'
                    , baseParams: {
                        sid: rui.R.sid
                    }
                    , items: [
                        {
                            xtype: 'fieldset'
                            , title: 'Select File'
                            , items: [
                                new Ext.form.TextField ({
                                    inputType: 'file'
                                    , fieldLabel: 'File'
                                    , name: 'fileToLoad'
                                    , allowBlank: false
                                })
                                , new Ext.form.TextField ({
                                    fieldLabel: 'R variable'
                                    , name: 'nameOfRVariable'
                                    , allowBlank: false
                                    , maxLength: 200
                                    , regex: /^[a-zA-Z_]+$/
                                    , id: 'nameOfRVariable'
                                })
                            ]
                        }
                        , {
                            xtype: 'fieldset'
                            , title: 'R Loading Approach'
                            , labelWidth: 200
                            , items: [
                                new Ext.form.Radio ({
                                    fieldLabel: 'Use the default (uses "data.read")'
                                    , name: 'rloading'
                                    , inputValue: 'rloadingdefault'
                                    , id: 'rloadingdefault'
                                })
                                , new Ext.form.Radio ({
                                    fieldLabel: 'Let me choose'
                                    , name: 'rloading'
                                    , inputValue: 'rloadingcustom'
                                })
                            ]
                        }
                    ]
                    , listeners: {
                        afterrender: function (f) {
                            f.findById('rloadingdefault').setValue(true);
                        }
                    }
                })
            ]
            , bbar: [
                {
                    id: 'move-prev'
                    , text: 'Back'
                    , handler: this.navHandler.createDelegate(this, [-1])
                    , disabled: true
                }
                , '->'
                , {
                    id: 'move-next'
                    , text: 'Next'
                    , handler: this.navHandler.createDelegate(this, [1])
                }
            ]
        });

        rui.ux.FileUpload.superclass.initComponent.apply(this, arguments);
    }
});

Ext.reg('rui-fileupload', rui.ux.FileUpload);


