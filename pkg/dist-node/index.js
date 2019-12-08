'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Router provides an interface for creating complex routes that can be used in an use-case agnostic way
 */

/**
 * @hidden
 */
const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * @hidden
 *
 * Replaces all matches in a string with a value provided by a callback
 */


const replaceAll = (string, regex, cb) => {
  // make sure that string actually has a match
  while (regex.test(string)) {
    // guranteed because already tested
    string.match(regex).slice(1).map(val => {
      string = string.replace(regex, cb(val));
    });
  }

  return string;
};
/**
 * Compiles a route to a `RegExp` pattern
 *
 * ```typescript
 * compileRoute('/user/:id')
 * // /^\/user\/(?<id>[,a-zA-Z0-9%_-]*)(\?[a-zA-Z0-9%_=&-]*)?$/
 *
 * compileRoute('/@(\\w{1,16})/get/:id')
 * // /^\/@(\w{1,16})\/get\/(?<id>[,a-zA-Z0-9%_-]*)(\?[a-zA-Z0-9%_=&-]*)?$/
 * ```
 */


const compileRoute = route => {
  const replaced = route.replace('**', '__DOUBLE_WILDCARD__').replace('*', "[,a-zA-Z0-9_-]*").replace("__DOUBLE_WILDCARD__", "[,/a-zA-Z0-9_-]*");
  const withCaptures = replaceAll(replaced, /:([,a-zA-Z0-9_-]*)/, val => `(?<${escapeRegExp(val)}>[,a-zA-Z0-9%_-]*)`);
  let fin = `^${withCaptures}(\\?[a-zA-Z0-9%_=&-]*)?$`;
  return new RegExp(fin);
};
/**
 * A use-case agnostic router for holding and matching routes
 *
 * @typeparam T  Where T is the types of the values passed from [[runPath]] to the [[RouteHandler]]
 */

class Router {
  constructor() {
    /**
     * The list of routes
     */
    this.routes = [];
  }
  /**
   * Find a route that matches the path, returns undefined if nothing is found
   */


  findRoute(path) {
    // tests based on order added, the order the paths were added matters!
    return this.routes.find(({
      route,
      handler
    }) => route.test(path));
  }
  /**
   * Adds a route to match when testing paths
   *
   * The route handler is the callback that is executed when the program
   */


  addRoute(route, handler) {
    this.routes.push({
      route: compileRoute(route),
      handler
    });
  }
  /**
   * Find and run the route handler for the path if any matches are found
   *
   * Optionally data can be passed to the handler
   */


  runPath(path, ...data) {
    const route = this.findRoute(path);

    if (route) {
      // guranteed because tested earlier
      route.handler(route.route.exec(path).groups || {}, ...data);
    }
  }

}

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

class HTTPRouter {
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

exports.HTTPRouter = HTTPRouter;
exports.Router = Router;
exports.compileRoute = compileRoute;
//# sourceMappingURL=index.js.map
