import { IncomingMessage, ServerResponse } from 'node:http'
import Auth from '../../lib/auth.mjs'
import MongoClient from '../../lib/mongo-client.mjs'
import URL from '../../lib/url.mjs'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

export default function App( server: server ) {
    Auth.authenticate(
        server,
        () => find( server )
    )
}

function find( server: server ) {
    const url = new URL( server.req )
    const id = url.identifier( 'accounts' )

    const mongoClient = new MongoClient()

    mongoClient.connect((client) => {
        client.db().collection( 'Account Login' )
        .findOne({
            _id: id
        })
        .then((value) => {
            server.end(
                JSON.stringify( value )
            )
        })
    })
}
