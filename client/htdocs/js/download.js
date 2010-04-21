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

