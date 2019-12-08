import { Router, HTTPRouter, compileRoute, URLReq } from '..'

describe(compileRoute, () => {
	it('should be defined', () => {
		expect(compileRoute).toBeDefined()
	})

	it('should compile a route', () => {
		expect(compileRoute('/basic/')).toStrictEqual(/^\/basic\/(\?[a-zA-Z0-9%_=&-]*)?$/)
		expect(compileRoute('/basic/:param')).toStrictEqual(/^\/basic\/(?<param>[,a-zA-Z0-9%_-]*)(\?[a-zA-Z0-9%_=&-]*)?$/)
		expect(compileRoute('/basic/*')).toStrictEqual(/^\/basic\/[,a-zA-Z0-9_-]*(\?[a-zA-Z0-9%_=&-]*)?$/)
		expect(compileRoute('/basic/**')).toStrictEqual(/^\/basic\/[,/a-zA-Z0-9_-]*(\?[a-zA-Z0-9%_=&-]*)?$/)
	})

	it('should compile routes with multiple params', () => {
		expect(compileRoute('/user/:name/:message')).toStrictEqual(/^\/user\/(?<name>[,a-zA-Z0-9%_-]*)\/(?<message>[,a-zA-Z0-9%_-]*)(\?[a-zA-Z0-9%_=&-]*)?$/)
	})

	it('should generate a routes that match what is expected', () => {
		expect(compileRoute('/').test('/')).toBeTruthy()
	})
})

describe(Router, () => {
	it('should be defined', () => {
		expect(Router).toBeDefined()
	})

	it('should instance', () => {
		const router = new Router()

		expect(router).toBeDefined()
		expect(router.routes).toStrictEqual([])
	})

	it('should add a route', () => {
		const router = new Router()

		expect(router.routes[0]).toBeUndefined()

		router.addRoute('/hello/world', () => {})

		expect(router.routes[0]).toBeDefined()

	})

	it('should find the route', () => {
		const router = new Router()

		router.addRoute('/hello/world', () => {})

		expect(router.findRoute('/hello/world')).toStrictEqual(router.routes[0])
	})

	it('should run the route', done => {
		const router = new Router()

		router.addRoute('/hello/world', () => {
			done()
		})

		router.runPath('/hello/world')
	})
})

describe(HTTPRouter, () => {
	it('should be defined', () => {
		expect(HTTPRouter).toBeDefined()
	})

	it('should instance', () => {
		const router = new HTTPRouter()

		expect(router).toBeDefined()
	})

	it('should add a route', () => {
		const router = new HTTPRouter()

		expect(router.router.routes[0]).toBeUndefined()

		router.on('GET', '/', () => {})

		expect(router.router.routes[0]).toBeDefined()
	})

	it('should find a route', done => {
		const router = new HTTPRouter()

		router.on('GET', '/app', () => {
			done()
		})

		router.lookup({ method: 'GET', url: '/app' }, {})
	})

	it('should handle multiple conflicting routes in the order they were defined', done => {
		const router = new HTTPRouter()

		router.on('GET', '/app', () => {
			done()
		})

		router.on('GET', '/:param', () => {})

		router.lookup({ method: 'GET', url: '/app' }, {})
	})

	it('should return the correct queries', done => {
		const router = new HTTPRouter()

		router.on('GET', '/user/:name', (req, _, params) => {
			expect(params).toMatchObject({ name: 'bree' })
			done()
		})

		router.lookup({ method: 'GET', url: '/user/bree'}, {})


	})

	it('should return the correct queries for advanced, possibly conflicting lookups', done => {
		const router = new HTTPRouter()

		router.on('GET', '/user/:name', (req, _, params) => {
			done.fail('Unexpectedly matched the wrong route')
		})

		router.on('DELETE', '/user/:name/:message', (req, _, params) => {
			expect(params).toMatchObject({ name: 'bree', message: '123' })
			done()
		})

		router.on('DELETE', '**', req => {
			done.fail(`failed to match ${req.url} with ${router.router.routes[1].route.source}`)
		})

		router.lookup({ method: 'DELETE', url: '/user/bree/123' }, {})
	})

	it('should return the correct queries for very advanced query lookups', done => {
		const router = new HTTPRouter()

		router.on('GET', '/user/:name', (req, _, params) => {
			done.fail('Unexpectedly matched the wrong route')
		})

		router.on('DELETE', '/user/:name/:message', (req, _, params) => {
			done.fail('Unexpectedly matched the wrong route')
		})

		router.on('GET', '/@:username/profile', (req, res, params) => {
			expect(req.url).toBe('/@bree/profile')
			expect(params).toMatchObject({ username: 'bree' })
			expect(res).toBe('passed data as res')
			done()
		})

		router.lookup({ method: 'GET', url: '/@bree/profile' }, 'passed data as res')
	})
})