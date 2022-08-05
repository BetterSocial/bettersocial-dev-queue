require('dotenv').config()
const elasticsearch = require('elasticsearch')
const esb = require('elastic-builder')
const { reject } = require('lodash')

class BetterSocialElasticSearch {
    /**
     * @type {elasticsearch.Client}
     */
    static client = null

    /**
     * 
     * @returns {elasticsearch.Client}
     */
    static getClient() {
        if (!this.client) {
            this.client = new elasticsearch.Client({
                host: process.env.SEARCHBOX_SSL_URL
            })
        }

        return this.client
    }

    /**
     * 
     * @param {String} indexName 
     * @param {esb.RequestBodySearch} body
     */
    static search(indexName, body) {
        const client = this.getClient()
        return new Promise((resolve, reject) => {
            client.search({
                index: indexName,
                body: body.toJSON()
            }, (err, response) => {
                const data = response?.hits?.hits?.reduce((acc, next) => {
                    acc.push(next._source)
                    return acc
                }, [])

                resolve(data)
            })
        })
    }

    /**
     * 
     * @param {String} indexName
     * @param {String} id
     * @param {Any} item
     */
    static index(indexName, id, item) {
        const client = this.getClient()
        return new Promise((resolve, reject) => {
            client.index({
                index: indexName,
                type: 'document',
                id: id,
                body: {
                    ...item
                }
            }, function (error, response) {
                console.log(response);
                resolve(response)
            });
        })
    }
}

module.exports = BetterSocialElasticSearch