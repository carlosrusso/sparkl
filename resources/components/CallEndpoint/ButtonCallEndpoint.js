var CpkComponent = UnmanagedComponent.extend({
    _docstring: function (){
    /***
     CpkComponent: abstract class that calls a CPK endpoint


     ***/
        return this.help(this._docstring);
    },
    update: function () {
        /**
         CpkComponent.update: manage the actions
         */
        var qd = this.queryDefinition,
            cd = this.chartDefinition;

        if ( this.valuesArray && this.valuesArray.length > 0) {
            var handler = _.bind(function() {
                this.draw(this.valuesArray);
            },this);
            this.synchronous(handler);
        } else if (qd) {
            var handler = _.bind(function(data){
                var filtered;
                if(this.valueAsId) {
                    filtered = data.resultset.map(function(e){
                        return [e[0],e[0]];
                    });
                } else {
                    filtered = data.resultset;
                }
                this.draw(filtered);
            },this);
            this.triggerQuery(qd,handler);
        } else {
            /* Legacy XAction-based components are a wasps' nest, so
             * we'll steer clearfrom updating those for the time being
             */
            var handler = _.bind(function() {
                var data = this.getValuesArray();
                this.draw(data);
            },this);
            this.synchronous(handler);
        }
    },


    runEndpoint: function (){

    },

    help: function (fun) {
        /**
         Prints the help text of a function.

         Arguments:
         fun -- The function (or alternatively an object with help defined)
         */

        fun = this[fun];
        if (fun === undefined)
            //return Dashboards.log("What function do you need help with?");
            fun = this;

        if (!(fun instanceof Function)) {
            if (fun.help)
                return Dashboards.log(fun.help);
            return Dashboards.log("I can not help you with that topic.");
        }

        var sf = new String(fun);
        var matches = sf.match(/\/\*\*([\s\S]*)\*\//m); // /** */

        if (matches)
            return Dashboards.log(matches[1]);

        return Dashboards.log("I can not help you with that function.");
    }
});


var ButtonCallEndpoint = CpkComponent.extend({
    draw : function() {
        // adapted from pentaho-cdf/js/components/input.js:ButtonComponent
        var myself = this;
        var opts = {
            success: function (data, textStatus, jqXHR){
                Dashboards.log( myself.pluginId + ': ' + myself.endpoint + ' ran successfully.');
                if (myself.successCallback){
                    //return myself.successCallback.apply(myself, data, textStatus, jqXHR);
                    return myself.successCallback(data, textStatus, jqXHR);
                }
            },
            error: function (data, textStatus, jqXHR){
                Dashboards.log( myself.pluginId + ': error running ' + myself.endpoint + '.');
                if (myself.failureCallback){
                    //return myself.failureCallback.apply(myself, data, textStatus, jqXHR);
                    return myself.failureCallback(data, textStatus, jqXHR);
                }
            },
            params: {},
            systemParams: {},
            type: 'POST',
            dataType: 'json'
        };
        // _.each(this.parameters, function f(v){
        //     opts.params[v[0]] = v[1];
        // });

        opts.params = Dashboards.propertiesArrayToObject(this.parameters);

        var b = $("<button type='button'/>").text(this.label).unbind("click").bind("click", function(){
            return sparkl.runEndpoint( myself.pluginId, myself.endpoint, opts );
        });
        if (typeof this.buttonStyle === "undefined" || this.buttonStyle === "themeroller")
            b.button();
        b.appendTo($("#"+ this.htmlObject).empty());
    }

});

/*

    buildQueryDefinition: function(overrides) {
      overrides = ( overrides instanceof Array) ? Dashboards.propertiesArrayToObject(overrides) : ( overrides || {} );
      var queryDefinition = $.extend(true, {}, this.getOption('systemParams'));

      var cachedParams = this.getOption('params'),
          params = $.extend( {}, cachedParams , overrides);

      _.each( params , function (value, name) {
        value = Dashboards.getParameterValue(value);
        if($.isArray(value) && value.length == 1 && ('' + value[0]).indexOf(';') >= 0){
          //special case where single element will wrongly be treated as a parseable array by cda
          value = doCsvQuoting(value[0],';');
        }
        //else will not be correctly handled for functions that return arrays
        if (typeof value == 'function') {
          value = value();
        }
        queryDefinition['param' + name] = value;
      });

      return queryDefinition;
    }
*/
