# MongoDB Store for NodeJS

General MongoDB Store Wrapper for NodeJS, wrapping individual collections.

1. [Usage](#usage)
2. [Methods](#methods)

## Usage

**Generic Store without Custom Functionality**

```javascript
import mongodb from "mongodb"
import MongoDbStore from "@frappy/js-mongo-store"

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017"
// create mongoDB connection
mongodb.MongoClient.connect(MONGO_URL, {
    useNewUrlParser: true,
}).then(client => {
    // initialise store
    const myStore = new MongoDbStore(client, "myDatabaseName", "myCollectionName")
  
    // run some operations on the store
    myStore.create({ foo: "bar" }).then(newDocId => myStore.get(newDocId)).then(newDoc => {
        console.log("Created a new document", newDoc)
        myStore.delete(newDoc._id)
    })
})
```

**Custom Store Class**

```javascript
import mongodb from "mongodb"
import MongoDbStore from "@frappy/js-mongo-store"

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017"

class MyCustomStore extends MongoDbStore {
    findCustomValues(attributeValue) {
        return this.find({ customAttribute: attributeValue }).then(matchingDocuments => {
            // map the list of documents to one of their attributes (or return it directly)
            return matchingDocuments.map(doc => doc.someOtherAttribute)
        })
    } 
}

// create mongoDB connection
mongodb.MongoClient.connect(MONGO_URL, {
    useNewUrlParser: true,
}).then(client => {
    const myStore = new MyCustomStore(client, "myDatabaseName", "myCollectionName")
    myStore.findCustomValues("foobar").then(result => {
        // this will print out a list of `someOtherAttribute` returned by the store method
        console.log("someAttributes:", result)
    })
})  
```

## Methods

**All methods return a `Promise`**, which returns either a document (`get`), a string (`create`), a number (`count`) or a
 list of documents (`find`).

- `getAll(paging)` - retrieves all documents from the collection and returns them as list, `paging` is optional, 
defaults to `page: 0` and  `pageSize: 25` - alias `list()`
- `insert(doc)` - creates a new document and returns the new document `_id` - alias: `create(doc)`
- `find(query, projection, sort, paging)` - runs a query and returns an array of matches. All parameters are optional 
and default to `null`, except the `paging`, which behaves as described in `getAll(paging)`. All options get proxied to 
MongoDB. 
- `findOne(query)` - tries to find a single document, will return the first matching document or null, if no document 
 matches the query
- `get(docId)` - returns a document with the given `_id`
- `count(query)` - finds out how many documents match the search `query`, which is optional (`null` returns the total 
number of documents in the collection)
- `delete(docId)` - deletes a document with the given `_id`, returns nothing - alias `remove(docId)`
- `update(query, update)` - performs a given update on potentially multiple documents, where `query` determines which 
documents to update and `update` can be a `$set` update statement or any other MongoDB operations, such as `$push` - 
 returns nothing
- `updateDocument(update)` - updates a single document with the provided `update`. The `update` needs to be the complete
 MongoDB document including `_id` - returns nothing.
