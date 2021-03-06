/**
 * Created by Aran Mulholland on 28/01/2014.
 */

var simpleNeo4js = require('../')

function cleanDatabase(done) {

    var queryResult = simpleNeo4js.query({
        cypherQuery:'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r',
        parameters: {}
    });

    queryResult.on('data', function (data) {
        done();
    });

    queryResult.on('error', function (error) {
        done(error);
    });
}

module.exports.clean = cleanDatabase;