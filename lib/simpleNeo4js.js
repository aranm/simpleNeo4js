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

    function flatten(resultData){
        if (resultData.length == 0){
            return null;
        }

        if (resultData.length == 1){
            return flatten(resultData[0]);
        }

        return resultData;
    }

    function packageData(resultData){
        if (resultData == null){
            return null;
        }
        else if (resultData.results == null){
            return null;
        }
        else if (resultData.results.length == 0){
            return null;
        }
        else {
            var returnValue = [];

            resultData.results.forEach(function (result){
                var returnResult = [];
                result.data.forEach(function (dataItem){
                    var returnData = {}
                    result.columns.forEach(function (column, index){
                        returnData[column] = dataItem.row[index];
                    });
                    returnResult.push(returnData);
                });

                returnValue.push(returnResult);
            });

            returnValue = flatten(returnValue);

            return returnValue;
        }
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

                        //return any errors
                        if (result.body.errors.length > 0){
                            result.body.errors.forEach(function (error){
                                eventEmitter.emit('error', error.message)
                            });

                            //if we have had an error and there is no results then we don't emit the body
                            if (result.body.results.length == 0){
                                return;
                            }
                        }

                        //emit the raw data
                        eventEmitter.emit('rawData', result.body)

                        //emit the packaged data (javascript objects built from the return values)
                        eventEmitter.emit('data', packageData(result.body))
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