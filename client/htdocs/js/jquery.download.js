jQuery.download = function(url, data, method){
    //url and data options required
    if( url && data ){ 
        //split params into form inputs
        var inputs = '';
        pv.keys(data).forEach(function(k){ 
            inputs+='<input type="hidden" name="'+ k +'" value="'+ encodeURIComponent(data[k]) +'" />'; 
        });
        //send request
        jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
        .appendTo('body').submit().remove();
    };
};

