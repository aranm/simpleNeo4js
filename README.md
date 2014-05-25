simpleNeo4js
============

A (very) simple node.js connection client for Neo4j


###Usage

The client can be used via the transactional endpoint, at present it does not do more than one query per transaction (it uses '/db/data/transaction/commit')
```
            var cypherQuery = 'CREATE (n:User {name: {name}, age: {age} }) RETURN n';
            var queryParameters = {
                name: 'Billy Bob',
                age: 34
            };
            
            var queryResult = simpleNeo4js.query({
                cypherQuery: cypherQuery,
                parameters: queryParameters
            });

            queryResult.on('data', function (data) {
                //a key value dictionary is returned for every row returned from neo4j
                //this allows for returning non standard properties like Collect(n)
                //the return value from the cypher query was n, therefore the data has
                //a property n with the new data
                assert.equal(data.n.name, 'Billy Bob', 'User with name is same as passed');
                assert.equal(data.n['name'], 'Billy Bob', 'User with name is same as passed');
                assert.equal(data.n.age, 34, 'User with age is same as passed');
                done();
            });

            queryResult.on('error', function (error) {
                done(error);
            });
```

The client can also be used with the batched endpoint, this allows for multiple cypher queries to be executed in one transaction. (this uses '/db/data/batch')

```
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
                assert.equal(newNodes.length, 2, 'Two query results were returned as two were requested');
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

```

###Implementation

The client is a very thin wrapper and hits the Neo4j REST transactional endpoint, at present it does not do more than one query per transaction (it uses '/db/data/transaction/commit').
