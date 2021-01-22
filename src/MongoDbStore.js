import mongodb from "mongodb"

class MongoDbStore {
    constructor(mongoClient, databaseName, collectionName) {
        this.client = mongoClient
        this.databaseName = databaseName
        this.collectionName = collectionName

        this.db = mongoClient.db(databaseName)
        this.init()
    }

    // :::::::: STORE INITIALISATION AND CONNECTIVITY ::::::::

    init() {
        this.collection = this.db.collection(this.collectionName)
    }

    /**
     * Checks if all specified databases exist and creates them, if not.
     * @returns {Promise} - a promise resolving true when all databases are checked and exist.
     */
    checkCollectionExists() {
        return new Promise((resolve, reject) => {
            const admin = this.client.db("admin").admin()
            admin.listDatabases().then(response => {
                let found = false
                response.databases.forEach(dbInfo => {
                    if (dbInfo.name === this.databaseName) {
                        resolve()
                        found = true
                    }
                })
                if (!found) {
                    reject()
                }
            })
        })
    }

    // :::::::: ATOMIC STORE OPERATIONS ::::::::

    getAll(paging = { pageSize: 25, page: 0 }) {
        if (paging.pageSize == null) {
            paging.pageSize = 25
        }
        return new Promise((resolve, reject) => {
            this.collection
                .find()
                .skip(paging.page * paging.pageSize)
                .limit(paging.pageSize)
                .toArray()
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    insert(doc) {
        return new Promise((resolve, reject) => {
            this.collection
                .insertOne(doc)
                .then(result => {
                    resolve(result.insertedId.toString())
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    count(query = {}) {
        return new Promise((resolve, reject) => {
            this.collection
                .countDocuments(query)
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    get(docId) {
        return new Promise((resolve, reject) => {
            this.collection
                .findOne({ _id: mongodb.ObjectID(docId) })
                .then(doc => {
                    resolve(doc)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    find(query, projection, sort, paging = { pageSize: 25, page: 0 }) {
        return new Promise((resolve, reject) => {
            let res = this.collection.find(query).project(projection)
            if (sort != null) {
                res = res.sort(sort.keys, sort.ascending ? 1 : -1)
            }
            if (paging != null) {
                res.skip(paging.pageSize * paging.page)
                    .limit(paging.pageSize)
                    .toArray()
                    .then(result => {
                        resolve(result)
                    })
                    .catch(err => {
                        reject(err)
                    })
            } else {
                res.toArray().then(result => {
                    resolve(result)
                })
            }
        })
    }

    findOne(query) {
        return new Promise((resolve) => {
            const res = this.collection.findOne(query)
            if (res) {
                resolve(res)
            } else {
                resolve(null)
            }
        })
    }

    update(query, update) {
        return new Promise((resolve, reject) => {
            this.collection
                .updateMany(query, update)
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    updateDocument(update) {
        return new Promise((resolve, reject) => {
            this.collection
                .updateOne({ _id: update._id }, { $set: update })
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    delete(docId) {
        return new Promise((resolve, reject) => {
            this.collection
                .deleteOne({ _id: mongodb.ObjectID(docId) })
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    // :::::::: PROXY FUNCTIONS ::::::::

    create(doc) {
        return this.insert(doc)
    }

    list() {
        return this.getAll()
    }

    remove(docId) {
        return this.delete(docId)
    }
}

export default MongoDbStore
