import { IncomingMessage, ServerResponse } from 'node:http'
import Auth from '../../lib/auth.mjs'
import MongoClient from '../../lib/mongo-client.mjs'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

interface DataProps {
    userName: string,
    password: string,
    'User Info': {
        fullName: string,
        accountNumber: string,
        emailAddress: string,
        registrationNumber: string
    }
}

export default function App( server: server, data: DataProps ) {
    Auth.authenticate(
        server,
        () => create( server, data )
    )
}

function create( server: server, data: DataProps ) {
    const mongoClient = new MongoClient()

    mongoClient.connect((client) => {
        client.db().collection( 'Account Login' )
        .insertOne( data )
        .then((value) => {
            if (!(value.acknowledged)) return server.writeHead( 500 ).end()

            server.end(
                JSON.stringify( value )
            )
        })
    })
}
