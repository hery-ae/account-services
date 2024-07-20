import { URL as NodeURL } from 'node:url'
import { IncomingMessage } from 'node:http'

export default class URL {
    pathname: string

    constructor( request: IncomingMessage ) {
        const url = new NodeURL( (request.url as string), String().concat( 'http://', (request.headers['Host'] as string) ) )

        this.pathname = url.pathname
    }

    identifier( collection: string ) {
        const regExp = new RegExp( collection.concat( '/(.+?(/|$))' ) )
        const match = this.pathname.match( regExp )

        return match?.at( -2 )?.replace( match.at( -1 ) as string, '' )
    }
}
