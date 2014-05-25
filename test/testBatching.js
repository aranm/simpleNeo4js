/**
 * Created by Aran Mulholland on 30/01/2014.
 */

var chai = require('chai');
var assert = chai.assert;

var simpleNeo4js = require('../')
var cleanDatabase = require('./cleanDatabase');

describe('Testing batching multiple cypher calls', function(){

    describe('Returning multiple nodes', function(){

        beforeEach(function(done){
            cleanDatabase.clean(done);
        })

        //first create two nodes
        beforeEach(function(done){
            var cypherQuery = 'CREATE (n:User {name: {name}, age: {age} })-[:has]->(b:Bicycle {make: {make} }) RETURN n';
            var queryParameters = {
                name: 'Billy Bob',
                age: 34,
                make: 'Malvern Star'
            };
            var queryResult = simpleNeo4js.query({
                cypherQuery: cypherQuery,
                parameters: queryParameters
            });

            queryResult.on('data', function () {
                done();
            });

            queryResult.on('error', function (error) {
                done(error);
            });
        })

        beforeEach(function(done){
            var cypherQuery = 'CREATE (n:User {name: {name}, age: {age} })-[:has]->(b:Bicycle {make: {make} }) RETURN n';
            var queryParameters = {
                name: 'Johno Riso',
                age: 18,
                make: 'BMX'
            };
            var queryResult = simpleNeo4js.query({
                cypherQuery: cypherQuery,
                parameters: queryParameters
            });

            queryResult.on('data', function () {
                done();
            });

            queryResult.on('error', function (error) {
                done(error);
            });
        })

        it('should return two results from the batched query', function(done){

            var queries = [{
                cypher: 'MATCH (n:User) RETURN n',
                parameters: { }
            },
            {
                cypher: 'MATCH (n:User) RETURN n.age',
                parameters: { }
            }];

            var queryResult = simpleNeo4js.batchedQuery({
                queries: queries
            });

            queryResult.on('data', function (newNodes) {
                assert.equal(newNodes.length, 2, 'Two query results were returned');
                assert.equal(newNodes[0].length, 2, 'Two nodes were returned');
                assert.equal(newNodes[1].length, 2, 'Two results were returned');

                var names = newNodes[0].map(function (item) {
                    return item.n.name;
                });

                assert.ok(names.indexOf('Johno Riso') > -1, "Names returned contains John Riso");
                assert.ok(names.indexOf('Billy Bob') > -1, "Names returned contains Billy Bob");

                var ages = newNodes[1].map(function (item) {
                    return item['n.age'];
                });

                assert.equal(ages[0], 34, 'First node age = 34');
                assert.equal(ages[1], 18, 'Second result age = 18');

                done();
            });

            queryResult.on('error', function (error) {
                done(error);
            });
        })

        it('should return one error and one result', function(done){

            var queries = [{
                cypher: 'MATCcH (n:User) RETURN n',
                parameters: { }
            },
            {
                cypher: 'MATCH (n:User) RETURN n',
                parameters: { }
            }];

            var queryResult = simpleNeo4js.batchedQuery({
                queries: queries
            });

            queryResult.on('data', function (newNodes) {
                done('failed as a batched query should not return a data result');
            });

            queryResult.on('error', function (error) {
                assert.ok(error.exception.indexOf('SyntaxException') > -1, "Error was a syntax exception");
                done();
            });
        })

        it('should return an array of objects when multiple return types are requested', function(done){

            var queries = [{
                cypher: 'MATCH (n:User) RETURN n.age, n, COUNT(n), COLLECT(n)',
                parameters: { }
            }];

            var queryResult = simpleNeo4js.batchedQuery({
                queries: queries
            });

            queryResult.on('data', function (newNodes) {
                assert.equal(newNodes.length, 1, 'A single query was returned');
                assert.equal(newNodes[0].length, 2, 'Two results sets were returned');
                assert.equal(newNodes[0][0]['n.age'], 34, 'n.age = 34');
                assert.equal(newNodes[0][1]['n.age'], 18, 'n.age = 18');
                assert.equal(newNodes[0][0]['n'].name, 'Billy Bob', 'name is Billy Bob');
                assert.equal(newNodes[0][1]['n'].name, 'Johno Riso', 'name is Johno Riso');
                done();
            });

            queryResult.on('error', function (error) {
                done(error);
            });
        })
    })
})