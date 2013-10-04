var CpkComponent = UnmanagedComponent.extend({
    _docstring: function (){
    /*** CpkComponent: abstract class that calls a CPK endpoint

     Uses a UnmanagedComponent.synchronous() lifecycle.
     Properties a child class should define in their component.xml:

     <Property name="parameters">valuesArray</Property>
     <Property>successCallback</Property> (function)
     <Property>failureCallback</Property> (function)
     <Definition name="queryDefinition">
         <Property type="query">dataSource</Property>
     </Definition>

     Each descendent is expected to override the following methods:
     - draw()

     Quirks:
     - in this.parameters, static values should be quoted, in order to survive the "eval" in Dashboards.getParameterValue:

     ***/
        return this.help(this._docstring);
    },
    update: function () {
        /***
         CpkComponent.update: entry-point of the component, manages the actions
         ***/
        var draw = _.bind(this.draw, this);
        if(typeof this.manageCallee == "undefined" || this.manageCallee) {
            this.synchronous(draw);
        } else {
            draw();
        }

    },
    _queryEngine: "cpk",
    runEndpoint: function () {
        /***
         CpkComponent.runEndpoint: call the endpoint, passing any parameters

         Depends on sparkl.js
        ***/
        var qd = this.queryDefinition,
            params = Dashboards.propertiesArrayToObject( this.parameters );

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
            if ($.isArray(value)){ //Introduced by CR
                value = value.toString();
            }
            params[name] = value;
        });


        if (qd.queryType == "cpk") {
            switch (this._queryEngine){
            case "core":
                _.each( params , function (value, name) {
                    params[name] = value.toString().quote(); //must quote for some mystic reason
                });
                return Dashboards.getQuery(qd).fetchData(params, this.successCallback, this.failureCallback);
            default:
                var opts = {
                    success: this.successCallback,
                    error: this.failureCallback,
                    params: params
                };

                return sparkl.runEndpoint( qd.pluginId, qd.endpoint, opts );

            }
        } else {
            Dashboards.log('Datasource is not a CPK endpoint', 'error');
        }
        if (Dashboards.debug) {
            Dashboards.log('CpkComponent.runEndpoint was called', 'debug');
        }
    },


    help: function (fun) {
        /***
         Prints the help text of a function.

         Arguments:
         fun -- The function (or alternatively an object with help defined)
         ***/
        /*

         It's nice because you can do extend it to do this (not always desired):

         var global = (function () { return this; })();
         Function.prototype.toString = function () { help(global[this.name]); }

         Then everytime you just type the function and hit enter you will get the documentation.
         Function.prototype.doc = function () { help(global[this.name]); }
         Would create a doc() method for all functions.﻿
         */
        fun = this[fun];
        if (fun === undefined)
            //return Dashboards.log("What function do you need help with?");
            fun = this._docstring;

        if (!(fun instanceof Function)) {
            if (fun.help)
                return Dashboards.log(fun.help);
            return Dashboards.log("I can not help you with that topic.");
        }

        var sf = new String(fun);
        var matches = sf.match(/\/\*\*\*([\s\S]*)\*\*\*\//m);

        if (matches)
            return Dashboards.log(matches[1]);

        return Dashboards.log("I can not help you with that function.");
    }
});



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
