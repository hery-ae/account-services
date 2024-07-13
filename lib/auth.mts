import { IncomingMessage, ServerResponse } from 'node:http'
import { env } from 'node:process'
import JWT, { JwtPayload } from 'jsonwebtoken'
import { createClient as RedisClient } from 'redis'

type server = ServerResponse<IncomingMessage> & {
    req: IncomingMessage
}

export default class Auth {
    server: server

    constructor( server: server ) {
        this.server = server
    }

    authenticate() {
        return new Promise(
            (resolve, reject) => {
                if( !this.server.req.headers.authorization || !this.server.req.headers.authorization.startsWith('Bearer') ) {
                    this.server.statusCode = 403
                    reject()
                }

                const authorization = this.server.req.headers.authorization as string
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

                                    if (authenticated) {
                                        resolve( payload )

                                    } else {
                                        this.server.statusCode = 403
                                        reject()
                                    }
                                }
                            )
                        }
                    )

                } catch (e) {
                    this.server.statusCode = 403
                    reject()
                }

            }
        )
    }
}
