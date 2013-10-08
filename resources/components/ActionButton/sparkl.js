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



function toCSV (value){
    value = value.toString();
    return value.split('],').join(';').split('[').join('').split(']').join('');
}
