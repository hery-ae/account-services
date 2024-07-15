import { ServerResponse, IncomingMessage } from 'node:http'

export default function App( server: ServerResponse<IncomingMessage> ) {
    server.end(
        JSON.stringify(
            {
                status: 'ok'
            }
        )
    )
}
