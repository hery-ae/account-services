import { IncomingMessage, ServerResponse } from 'node:http'
import { ObjectId } from 'mongodb'
import Auth from '../../lib/auth.mjs'
import MongoClient from '../../lib/mongo-client.mjs'
import URL from '../../lib/url.mjs'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

interface DataProps {
    userName?: string,
    password?: string,
    'User Info'?: {
        fullName?: string,
        accountNumber?: string,
        emailAddress?: string,
        registrationNumber?: string
    }
}

export default function App( server: server, data: DataProps ) {
    Auth.authenticate(
        server,
        () => update( server, data )
    )
}

function update( server: server, data: DataProps ) {
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
        .updateOne(
            {
                _id: objectId
            },
            {
                $set: data
            }
        )
        .then((result) => {
            if (!(result.matchedCount)) return server.writeHead( 404 ).end()

            if (!(result.acknowledged)) return server.writeHead( 500 ).end()

            server.end(
                JSON.stringify( result )
            )
        })
    })
}
