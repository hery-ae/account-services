import { MongoClient as mongo } from 'mongodb'

export default class MongoClient {
    url: string = 'mongodb://localhost:27017/db_hery_ae_betest'

    connect( res: (client: mongo) => void ) {
        mongo.connect(this.url).then( (client) => res( client ) )
    }
}
