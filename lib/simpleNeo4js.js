/**
 * Created by aranmulholland on 19/01/2014.
 */
var request = require('superagent');

var simpleNeo4js = (function (){
    var url = 'http://localhost:7474';

    function urlProperty(){
        if (arguments.length > 0){
            url = arguments[0];
            return url;
        }
        return url;
    }

    function query(query, callback){
        request
            .post(url + '/db/data/cypher')
            .set('Content-Type', 'application/json')
            .send( { query: query } )
            .end(function(result) {
                switch(result.statusCode) {
                    case 200:
                        callback(null, result.body);
                        break;
                    default:
                        callback(new Error('HTTP Error ' + result.statusCode), null);
                }
            });
    }

    return {
        url: urlProperty,
        query: query
    };
})();

module.exports = simpleNeo4js;