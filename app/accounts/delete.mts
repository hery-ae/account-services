import { IncomingMessage, ServerResponse } from 'node:http'

export default function App( server: ServerResponse<IncomingMessage> & { req: IncomingMessage } ) {}
