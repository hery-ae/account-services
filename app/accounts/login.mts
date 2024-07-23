import { ServerResponse, IncomingMessage } from 'node:http'
import { env } from 'node:process'
import { createClient as RedisClient } from 'redis'
import Bcrypt from 'bcryptjs'
import JWT, { JwtPayload } from 'jsonwebtoken'
import MongoClient from '../../lib/mongo-client.mjs'

export default function App( server: ServerResponse<IncomingMessage> & { req: IncomingMessage }, data: { username: string, password: string } ) {
    const { username, password } = data

    const mongo = new MongoClient()

    mongo.connect((mongoClient) => {
        mongoClient.db().collection( 'Account Login' )
        .findOne(
            {
                userName: username
            }
        )
        .then((account) => {
            Bcrypt.compare( password, account?.password, ( err ) => {
                if (err) return server.writeHead( 401 ).end()

                mongoClient.db().collection( 'Account Login' )
                .updateOne(
                    {
                        _id: account?._id
                    },
                    {
                        $set: {
                            lastLoginDateTime: new Date()
                        }
                    }
                )
                .then((result) => {
                    if (!result.acknowledged) return server.writeHead( 500 ).end()

                    const accessToken = JWT.sign(
                        {
                            user_id: account?._id,
                            username: account?.userName,
                            email: account?.['User Info'].emailAddress
                        },
                        env['SECRET_KEY'] as string,
                        {
                            expiresIn: 1800
                        }
                    )

                    const { iat } = JWT.verify( accessToken, env['SECRET_KEY'] as string ) as JwtPayload

                    RedisClient().connect()
                    .then((redisClient) => {
                        redisClient.hSet( account?.userName.concat(':').concat(iat), 'authenticated', 1 )
                        .then((value) => {
                            redisClient.disconnect()
                            mongoClient.close()

                            if (!value) return server.writeHead( 500 ).end()

                            server.end(
                                JSON.stringify(
                                    {
                                        user_id: account?._id,
                                        access_token: accessToken,
                                        scheme: 'Bearer'
                                    }
                                )
                            )
                        })
                    })
                })
            })
        })
    })
}
