simpleNeo4js
============

A (very) simple node.js connection client for Neo4j


###Usage

```
            var cypherQuery = 'CREATE (n:User {name: {name}, age: {age} }) RETURN n';
            var queryParameters = {
                name: 'Billy Bob',
                age: 34
            };
            
            var queryResult = simpleNeo4js.query(cypherQuery, queryParameters);

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
