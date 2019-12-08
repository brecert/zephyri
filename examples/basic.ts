import * as http from 'http';
import { HTTPRouter, URLReq } from 'zephyri';

// IncomingMessage does not always have url or method
type Request = http.IncomingMessage & URLReq
type Response = http.ServerResponse

const router = new HTTPRouter<Request, Response>()
 .on('GET', '/:param', (req, res, params) => res.end(JSON.stringify(params)))
 .on('GET', '/user/:id', (req, res, params) => res.end(params.id))
 .on('GET', '**', (req, res) => res.end('404'));

// We cast req as Request because we know `url` and `method` is on `http.Server` incoming requests
http
 .createServer((req, res) => router.lookup(req as Request, res))
 .listen(3000)