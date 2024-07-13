import { IncomingMessage, ServerResponse } from 'node:http'

type RouteFunc = ( server: ServerResponse<IncomingMessage> & { req: IncomingMessage }, data?: any ) => void

export default class Route {
    routes: Array<{
        route: string,
        allowMethods: Array<string>,
        func: RouteFunc
    }>

    constructor() {
        this.routes = []
    }

    setRoute( route: string, allowMethods: string, func: RouteFunc ) {
        if (this.routes.find( value => value.route === route )) this.routes.splice( this.routes.findIndex( value => value.route === route ), 1 )

        this.routes.push({
            route: route,
            allowMethods: allowMethods.split(', '),
            func: func
        })
    }

    findRoute( pathname: string ) {
        return this.routes.find(
            (route) => {
                const regExp: RegExp = new RegExp( String().concat( '^', route.route, '$' ) )

                return pathname.match( regExp )
            }
        )
    }
}
