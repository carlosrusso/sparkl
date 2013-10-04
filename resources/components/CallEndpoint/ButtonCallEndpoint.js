
var ButtonCallEndpoint = CpkComponent.extend({
    /*** ButtonCallEndpoint: a Button Component that calls an endpoint when clicked
     ***/
    draw: function() {
        var myself = this;
        var b = $("<button type='button'/>").text(this.label).unbind("click").bind("click", function(){
            return myself.runEndpoint.apply(myself);
        });
        if (typeof this.buttonStyle === "undefined" || this.buttonStyle === "themeroller")
            b.button();
        b.appendTo($("#"+ this.htmlObject).empty());
    }

});


// from CoreQueries: CpkEndpoint

    // buildQueryDefinition: function(overrides) {
    //   overrides = ( overrides instanceof Array) ? Dashboards.propertiesArrayToObject(overrides) : ( overrides || {} );
    //   var queryDefinition = $.extend(true, {}, this.getOption('systemParams'));

    //   var cachedParams = this.getOption('params'),
    //       params = $.extend( {}, cachedParams , overrides);

    //   _.each( params , function (value, name) {
    //     value = Dashboards.getParameterValue(value);
    //     if($.isArray(value) && value.length == 1 && ('' + value[0]).indexOf(';') >= 0){
    //       //special case where single element will wrongly be treated as a parseable array by cda
    //       value = doCsvQuoting(value[0],';');
    //     }
    //     //else will not be correctly handled for functions that return arrays
    //     if (typeof value == 'function') {
    //       value = value();
    //     }
    //     queryDefinition['param' + name] = value;
    //   });

    //   return queryDefinition;
    // }

function toCSV (value){
    value = value.toString();
    return value.split('],').join(';').split('[').join('').split(']').join('');
}
