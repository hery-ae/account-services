import { IncomingMessage, ServerResponse } from 'node:http'
import { ObjectId } from 'mongodb'
import Auth from '../../lib/auth.mjs'
import URL from '../../lib/url.mjs'
import MongoClient from '../../lib/mongo-client.mjs'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

export default function App( server: server ) {
    Auth.authenticate(
        server,
        () => del( server )
    )
}

function del( server: server ) {
    const url = new URL( server.req )
    const id = url.identifier( 'accounts' )

    let objectId: ObjectId

    try {
        objectId = new ObjectId( id )

    } catch (e) {
        return server.writeHead( 404 ).end()
    }

    const mongoClient = new MongoClient()

    mongoClient.connect((client) => {
        client.db().collection( 'Account Login' )
        .deleteOne({
            _id: objectId
        })
        .then((result) => {
            if (!(result.acknowledged)) return server.writeHead( 500 ).end()

            if (!(result.deletedCount)) return server.writeHead( 404 ).end()

            server.writeHead( 200 ).end()
        })
    })
}
