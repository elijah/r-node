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
 *  The R-Node UI object holding global handlers and data for the R-Node UI
 */

Ext.ns ('rui');
rui.R = new rnode.R.API();

rui.loadHelp = function (url) {
    window.open (url, 'rnode-help', 'status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=1,scrollbars=1,height=600,width=700');
}

rui.login = function (callback) {
    if (rui.loginAuthMethod == "None") {
        // Even though we need no username/password, we still log in to get a session ID.
        rui.R.connect ('', '', function (result) { 
            callback();
        });
    } else if (rui.loginAuthMethod == "UserAndPassword") {
        new rui.ux.LoginWindow({
            listeners: {
                close: function () { // Current approach - if window closes, we're logged in!
                    callback();
                }
            }
        }).show();
    }
}

