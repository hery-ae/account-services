import { ServerResponse, IncomingMessage } from 'node:http'
import { env } from 'node:process'
import JWT, { JwtPayload } from 'jsonwebtoken'
import { createClient as RedisClient } from 'redis'
import Auth from '../../lib/auth.mjs'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

export default function App( server: server ) {
    Auth.authenticate(
        server,
        () => logout( server )
    )
}

async function logout( server: server ) {
    const authorization = server.req.headers.authorization as string
    const accessToken = authorization.substring( String('Bearer ').length )

    const { username, iat } = JWT.verify( accessToken, env['SECRET_KEY'] as string ) as JwtPayload

    const client = await RedisClient().connect()

    client.hDel( username.concat(':').concat(iat), 'authenticated' )
    .then((value) => {
        client.disconnect()

        if (!value) return server.writeHead( 500 ).end()

        server.writeHead( 200 ).end()
    })
}
