/**
 * Router provides an interface for creating complex routes that can be used in an use-case agnostic way
 */
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
export declare const compileRoute: (route: string) => RegExp;
export declare type RouteMatchParams = {
    [key: string]: string;
};
export declare type RouteHandler<T extends unknown[]> = (params: RouteMatchParams, ...data: T) => void;
/**
 * A route used to match paths
 *
 * @typeparam T  Where T is the types of the values passed from [[runPath]] to the [[RouteHandler]]
 */
export interface Route<T extends unknown[]> {
    /**
     * A `RegExp` pattern used for matching the path
     * It is not recommended to manually set this
     */
    route: RegExp;
    /**
     * The handler called when a path is matched
     */
    handler: RouteHandler<T>;
}
/**
 * A use-case agnostic router for holding and matching routes
 *
 * @typeparam T  Where T is the types of the values passed from [[runPath]] to the [[RouteHandler]]
 */
export declare class Router<T extends unknown[]> {
    /**
     * The list of routes
     */
    routes: Route<T>[];
    /**
     * Find a route that matches the path, returns undefined if nothing is found
     */
    findRoute(path: string): Route<T> | undefined;
    /**
     * Adds a route to match when testing paths
     *
     * The route handler is the callback that is executed when the program
     */
    addRoute(route: string, handler: RouteHandler<T>): void;
    /**
     * Find and run the route handler for the path if any matches are found
     *
     * Optionally data can be passed to the handler
     */
    runPath(path: string, ...data: T): void;
}
//# sourceMappingURL=router.d.ts.map