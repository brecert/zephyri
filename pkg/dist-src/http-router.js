import { Router } from './router.js';
/**
 * A router specifically meant for use with HTTP servers
 *
 * ```typescript
 * import * as http from 'http';
 * import { HTTPRouter, URLReq } from 'zephyri';
 *
 * // IncomingMessage does not always have url or method
 * type Request = http.IncomingMessage & URLReq
 * type Response = http.ServerResponse
 *
 * const router = new HTTPRouter<Request, Response>()
 *  .on('GET', '/:param', (req, res, params) => res.end(JSON.stringify(params)))
 *  .on('GET', '/user/:id', (req, res, params) => res.end(params.id))
 *  .on('GET', '**', (req, res) => res.end('404'));
 *
 * // We cast req as Request because we know `url` and `method` is on `http.Server` incoming requests
 * http
 *  .createServer((req, res) => router.lookup(req as Request, res))
 *  .listen(3000)
 *
 * ```
 *
 * @typeparam T  where T is the type of `req` in the context of `(req, res, params)` for [[HttpRouterHandler]]
 * @typeparam U  where U is the type of `res` in the context of `(req, res, params)` for [[HttpRouterHandler]]
 */
export class HTTPRouter {
    constructor() {
        /**
         * The base router
         */
        this.router = new Router();
    }
    /**
     * Lookup a path and see if one exists, if it exists then the corresponding handler to the match will be called
     *
     * ```
     * router.lookup('/user/1')
     * ```
     */
    lookup(req, res) {
        this.router.runPath(req.url, req, res);
    }
    /**
     * Add a listener with a handler that will be called if a lookup match is found
     *
     * ```
     * router.on('GET', '/user/:id', (req, res, params) => {
     *   res.end(JSON.stringify(params.id))
     * })
     * ```
     */
    on(method, path, handler) {
        /** @todo move the match logic to some a function like `recognize` or something for potential future memoization */
        this.router.addRoute(path, (params, req, res) => {
            if (req.method === method) {
                handler(req, res, params);
            }
        });
        return this;
    }
}
