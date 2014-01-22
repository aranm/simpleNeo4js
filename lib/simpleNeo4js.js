/**
 * Created by Aran Mulholland on 19/01/2014.
 */
var events = require('events');
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

    function query(cypherQuery, parameters){
        var eventEmitter = new events.EventEmitter();

        request
            .post(url + '/db/data/transaction/commit')
            .set('Content-Type', 'application/json')
            .send({
                statements:[{
                    statement: cypherQuery,
                    parameters: parameters
                }]
            })
            .end(function(result) {
                switch(result.statusCode) {
                    case 200:
                        eventEmitter.emit('data', result.body)
                        break;
                    default:
                        eventEmitter.emit('error', result.statusCode)
                }
            });

        return eventEmitter;
    }

    return {
        url: urlProperty,
        query: query
    };
})();

module.exports = simpleNeo4js;