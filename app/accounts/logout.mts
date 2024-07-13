import { ServerResponse, IncomingMessage } from 'node:http'
import { env } from 'node:process'
import JWT, { JwtPayload } from 'jsonwebtoken'
import { createClient as RedisClient } from 'redis'
import Auth from '../../lib/auth.mjs'

export default async function App( server: ServerResponse<IncomingMessage> & { req: IncomingMessage } ) {
    const auth = new Auth( server )

    try {
        await auth.authenticate()

    } catch (e) {
        return server.end()
    }

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
