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

rui.download = function(url, data, method){
    //url and data options required
    if( url && data ){ 
        //split params into form inputs
        var inputs = '';
        pv.keys(data).forEach(function(k){ 
            inputs+='<input type="hidden" name="'+ k +'" value="'+ encodeURIComponent(data[k]) +'" />'; 
        });
        //send request
        var id = Ext.id();
        Ext.getBody().insertHtml('beforeEnd', '<form id="' + id + '" action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>');
        document.getElementById(id).submit();
        Ext.get(id).remove();
    };
};

