/********************************** Sparkl namespace *******************************************/
var sparkl = sparkl || {};
(function(myself){

    myself.runEndpoint = function ( pluginId, endpoint, opts ) {

        if ( !pluginId && !endpoint){
            Dashboards.log('PluginId or endpointName not defined.');
            return false;
        }

        var _opts = {
            // we might want to change success-> done and error->fail when we start using jQuery 1.8+
            success: function (){
                Dashboards.log( pluginId + ': ' + endpoint + ' ran successfully.');
            },
            error: function (){
                Dashboards.log( pluginId + ': error running ' + endpoint + '.');
            },
            params: {},
            systemParams: {},
            type: 'POST',
            dataType: 'json'
        };
        var opts = $.extend( {}, _opts, opts);
        var url = Dashboards.getWebAppPath() + '/content/' + pluginId + '/' + endpoint;

        function successHandler (json) {
            if ( json && json.result == false ) {
                opts.error.apply(this, arguments);
            } else {
                opts.success.apply( this, arguments );
            }
        }

        function errorHandler (){
            opts.error.apply(this, arguments);
        }

        // we might want to change success-> done and error->fail when we start using jQuery 1.8+
        var ajaxOpts = {
            url: url,
            async: true,
            type: opts.type,
            dataType: opts.dataType,
            success: successHandler,
            error: errorHandler,
            data: {}
        };

        _.each( opts.params , function ( value , key ) {
            ajaxOpts.data['param' + key] = value;
        });
        _.each( opts.systemParams , function ( value , key){
            ajaxOpts.data[key] = value;
        });

        $.ajax(ajaxOpts);
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
