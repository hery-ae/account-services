import { createServer } from 'node:http'
import { env } from 'node:process'
import Route from './lib/route.mjs'
import URL from './lib/url.mjs'
import Home from './app/index.mjs'
import Index from './app/accounts/index.mjs'
import Login from './app/accounts/login.mjs'
import Logout from './app/accounts/logout.mjs'
import Create from './app/accounts/create.mjs'
import Find from './app/accounts/find.mjs'
import Update from './app/accounts/update.mjs'
import Delete from './app/accounts/delete.mjs'

/*
* Set routes
*/
const route = new Route()

route.setRoute( '/', 'GET', Home )

route.setRoute( '/accounts', 'GET', Index )

route.setRoute( '/accounts/login', 'POST', Login )

route.setRoute( '/accounts/logout', 'HEAD', Logout )

route.setRoute( '/accounts/create', 'PUT', Create )

route.setRoute( '/accounts/[0-9]+/find', 'GET', Find )

route.setRoute( '/accounts/[0-9]+/update', 'PATCH', Update )

route.setRoute( '/accounts/[0-9]+/delete', 'HEAD', Delete )

/*
* Serve
*/
createServer(
    ( request, response ) => {
        response.setHeader( 'Content-Type', 'application/json' )

        const url = new URL( request )
        const currentRoute = route.findRoute( url.pathname )

        const method = request.method as string
        const hasDataMethods = ['POST', 'PUT', 'PATCH']

        if( !(currentRoute) ) return response.writeHead( 404 ).end()

        if( !(currentRoute.allowMethods.includes( method )) ) return response.writeHead( 405, {'Allow': currentRoute.allowMethods.join()} ).end()

        if( !(hasDataMethods.includes( method )) ) return currentRoute.func( response )

        const data: any[] = []

        request.on( 'data', (chunk) => data.push( chunk ) )

        request.on( 'end', () => currentRoute.func( response, JSON.parse( Buffer.concat( data ).toString() ) ) )

    }
)
.listen( env['PORT'], () => console.log( `Listening on ${env['PORT']}` ) )
