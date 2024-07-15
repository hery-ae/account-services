import { IncomingMessage, ServerResponse } from 'node:http'
import Auth from '../../lib/auth.mjs'
import MongoClient from '../../lib/mongo-client.mjs'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

export default function App( server: server ) {
    Auth.authenticate(
        server,
        () => index( server )
    )
}

function index( server: server ) {
    const mongoClient = new MongoClient()

    mongoClient.connect((client) => {
        client.db().collection( 'Account Login' ).find().toArray()
        .then((value) => {
            server.end(
                JSON.stringify( value )
            )
        })
    })
}
