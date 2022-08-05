const esb = require('elastic-builder')
const BetterSocialBaseElasticSearchRepo = require('../BetterSocialBaseElasticSearchRepo')

const INDEX_NAME = 'getstream_news_link'

class ElasticNewsLink extends BetterSocialBaseElasticSearchRepo {
    constructor() {
        super(INDEX_NAME)
    }

    async searchLinkContextScreenRelatedArticle(newsLinkReference, offset = 0, limit = 10) {
        let { description, title, createdAt, news_link_id } = newsLinkReference
        const query = `${description} ${title}`

        const requestBody = esb
            .requestBodySearch()
            .query(
                esb.functionScoreQuery()
                    .query(
                        esb.boolQuery()
                            .mustNot(esb.matchQuery('news_link_id', news_link_id))
                            .should([
                                esb.matchQuery('description', query),
                                esb.matchQuery('title', query),
                            ])
                    )
                    .function(
                        esb.decayScoreFunction('gauss', 'content_created_at')
                            .origin(createdAt)
                            .decay(0.8)
                            .scale('3d')
                    )
            )
            .size(10)
            .from(0)
            .minScore(0)

        return await this.search(requestBody)
    }

    async putToIndex(item) {
        return await this.index(item.id, item)
    }

    async putToIndexFromGetstreamObject(getstreamObject) {
        const { id, content, content_created_at, domain } = getstreamObject
        const { description, domain_page_id, news_link_id, news_url, site_name, title } = content
        const { image, name } = domain

        return await this.index(id, {
            id, content_created_at, description, domain_page_id, news_link_id, news_url, site_name, title, image, name
        })
    }
}

module.exports = ElasticNewsLink