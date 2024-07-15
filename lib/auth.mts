import { IncomingMessage, ServerResponse } from 'node:http'
import { env } from 'node:process'
import JWT, { JwtPayload } from 'jsonwebtoken'
import { createClient as RedisClient } from 'redis'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

export default class Auth {
    static authenticate( server: server, valid: () => void, invalid: () => void = () => server.writeHead( 403 ).end() ) {
        if (!(server.req.headers.authorization) || !(server.req.headers.authorization.startsWith('Bearer'))) return invalid()

        const authorization = server.req.headers.authorization as string
        const token = authorization.substring( String('Bearer ').length )

        try {
            const payload = JWT.verify( token, env['SECRET_KEY'] as string ) as JwtPayload

            RedisClient().connect()
            .then(
                (client) => {
                    client.hGet( payload.username.concat( ':' ).concat( payload.iat ), 'authenticated' )
                    .then(
                        (authenticated) => {
                            client.disconnect()

                            if (!authenticated) return invalid()

                            valid()
                        }
                    )
                }
            )

        } catch (e) {
            invalid()
        }

    }
}
