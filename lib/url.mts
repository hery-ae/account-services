import { URL as NodeURL } from 'node:url'
import { IncomingMessage } from 'node:http'

export default class URL {
    pathname: string

    constructor( request: IncomingMessage ) {
        const url = new NodeURL( (request.url as string), String().concat( 'http://', (request.headers['Host'] as string) ) )

        this.pathname = url.pathname
    }

    identifier( collection: string ) {
        const regExp: RegExp = new RegExp( collection.concat( '/(.+)/' ) )

        return this.pathname.match( regExp )?.at( -1 )
    }
}
