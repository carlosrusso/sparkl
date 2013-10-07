/********************************** Sparkl namespace *******************************************/
var sparkl = sparkl || {};
(function(myself){

    myself.runEndpoint = function ( pluginId, endpoint, opts ) {

        if ( !pluginId && !endpoint){
            Dashboards.log('PluginId or endpointName not defined.');
            return false;
        }

        var _opts = {
            // NOTE: we might want to change success-> done and error->fail when we start using jQuery 1.8+
            success: function (){
                Dashboards.log( pluginId + ': ' + endpoint + ' ran successfully.');
            },
            error: function (){
                Dashboards.log( pluginId + ': error running ' + endpoint + '.');
            },
            params: {},
            systemParams: {} // NOTE: these are not being handled by coreQueries.js/CpkEndpoint
        };
        var opts = $.extend( {}, _opts, opts);

        var params = Dashboards.propertiesArrayToObject( opts.params );
        var qd = {
            endpoint: endpoint,
            pluginId: pluginId,
            queryType: 'cpk'
        };
        Dashboards.getQuery(qd).fetchData(params, opts.success, opts.error);

    };

    myself.getEndpointCaller = function( pluginId, endpoint, opts ) {
        var myself = this;
        return function (callback, errorCallback, params ) {
            var _opts = $.extend({}, opts);
            _opts.params = params || _opts.params;
            _opts.success = callback || _opts.success;
            _opts.error = errorCallback || _opts.error;
            myself.runEndpoint(pluginId, endpoint, _opts);
        };
    };

    myself.publishToServer = function (callback){
        $.ajax({
            url: Dashboards.getWebAppPath() + '/Publish',
            type:'POST',
            data: {
                'publish': 'now',
                'class': 'org.pentaho.platform.plugin.services.pluginmgr.PluginAdapter'
            },
            success: callback
        });
    };



})(sparkl);

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
     runEndpoint: function () {
         /***
          CpkComponent.runEndpoint: call the endpoint, passing any parameters

          Depends on sparkl.js
          ***/
         var qd = this.queryDefinition,
             params = Dashboards.propertiesArrayToObject( this.parameters );

         if (qd.queryType == "cpk") {
             return Dashboards.getQuery(qd).fetchData(params, this.successCallback, this.failureCallback);
         } else {
             Dashboards.log('CpkComponent.runEndpoint: Datasource is not a CPK endpoint', 'error');
         }
         if (Dashboards.debug) {
             Dashboards.log('CpkComponent.runEndpoint('+ qd.pluginId + ', ' + qd.endpoint + ') was called', 'debug');
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
