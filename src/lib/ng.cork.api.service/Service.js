(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.api.service', [
        'ng.cork.util',
        'ng.cork.api.request'
    ]);
    var copy = angular.copy;

    var isString = angular.isString;
    var isFunction = angular.isFunction;
    var isObject = angular.isObject;

    /**
     * @ngdoc object
     * @name ng.cork.api.service.CorkApiService
     *
     * @description
     * Base class for API services.
     *
     * Middleware based methods can be generated dynamically by providing method definitions.
     *
     * This class can be extended with your own properties and methods.
     *
     * # Method definition
     *
     * Methods are defined by:
     * - a mandatory **verb** - one of `GET`, `POST`, etc...
     * - and one of:
     *   - **pattern** - url pattern, interpolated with `req.urlParams` just before execute()
     *   - **url** - string or function that renders the complete url, invoked just before execute()
     *
     * Optionally, methods can have:
     * - **config:** - predefined [$http() config options](https://docs.angularjs.org/api/ng/service/$http#usage)
     * - **args:** - an entry point fn, handles arguments and initializes a Request object
     * - **request:** - a list of middlewares to run before execute()
     * - **sucess** - a list of middlewares to run after a successful execute()
     * - **error** - a list of middlewares to run after a failed execute()
     *
     * # Method execution
     *
     * As follows:
     *
     * - entry point as `args(req)`
     * - all request middlewares as `request[i](req)`
     * - execute function as `execute(config)`
     * - followed by one of:
     *   - all success middlewares as `success[i](req, res)`
     *   - OR all error middlewares as `error[i](req, res)`
     *
     * Considering the following method:
     *
     * <pre>
     * var normalizeResponse = function (req, res) {
     *    // do something with res
     *    return res;
     * };
     * var normalizeError = function (req, err) {
     *    // do something with err
     *    return err;
     * };
     * var getCache = function (req) {
     *    return cache.get(req.id);
     * };
     * var updateCache = function (req, res) {
     *    cache.put(req.id, res);
     * };
     * var service = new CorkApiService({
     *   methods: {
     *     load: {
     *       verb: 'GET',
     *       pattern: '/foobar/:id',
     *       config: {
     *         timeout: 5000
     *       },
     *       args: function (req, id) {
     *         req.id = id;
     *         req.urlParams.id = id;
     *       },
     *       request: [getCache],
     *       success: [normalizeResponse, updateCache]
     *       error: [normalizeError]
     *     }
     *   }
     * });
     * service.load(42).then( ... handle success ... , ... error ... );
     * </pre>
     *
     * - An instance of `CorkApiRequest` is created, seeded with `{config: {timeout: 5000} }`
     * - Entry point fn is invoked `args(req)`
     * - Request middleware `getCache(req, res)` is invoked.
     *   - If cache returns something, the whole method is bypassed and resolved with the cache response
     * - request config is frozen and decorated with `method: GET` and the interpolated `url: /foobar/42`
     * - $http(config) is invoked
     *   - If execute was sucessful, success middleware `normalizeResponse(req, res)` and `updateCache(req, res)` are called.
     *   - If execute failed, error middleware `normalizeError(req, err)` is called
     *
     * # Middlewares:
     *
     * All middlewares are treated asynchronously.
     *
     * Middlewares are executed in series - one after the other - not in parallel.
     *
     * For synchronous middlewares, depending returning a value can have a different outcomes like **resolving** or **rejecting**
     * the middleware stack or even bypassing the method enitrely.
     *
     * ## Request Middlewares
     *
     * Are invoked with the request instance: `middleware(req)` and can modify it.
     *
     * Can bypass the rest of the pipeline and immediately **resolve** or **reject** the whole method.
     *
     * Synchronous middleware:
     * - if one **returns a value**, the whole method is **bypassed** and **resolved** with it
     *
     * Asynchronous middleware:
     * - if one **resolves with a value**, the whole method is **bypassed** and **resolved** with this value
     * - if one **rejects with a value**, the whole method is **bypassed** and **rejected** with this value
     *
     * *NOTE:* If a request middleware **rejects** or **resolves**:
     * - no more request middlewares are invoked,
     * - the entire  `execute()`, `success` and `error` pipeline is bypassed
     * - and the service method resolves, or rejects, with the payload provided by that middleware.
     *
     * ## Success Middlewares
     *
     * Are invoked with both the request **and** the `$http()` response: `middleware(req, res)`.
     *
     * Can **modify** the `res` object directly or **replace** it by another object
     *
     * Can **turn a success into an error** by rejecting the promise with an error.
     *
     * Synchronous middlewares:
     * - if it **returns a value**, this value **replaces the result** and the **next** middleware is invoked
     *
     * Asynchronous middleware:
     * - if it **resolves with a value**, this value **replaces the result** and the **next** middleware is invoked
     * - if one **rejects with a value**, the outcome is **converted into error** and the whole method is **rejected** with this value
     *
     * *NOTE:* If a success middleware **rejects**:
     * - no more success middlewares are invoked,
     * - the error middlewares are NOT invoked
     * - and the service method rejects with the error provided by that middleware.
     *
     * ## Error Middlewares
     *
     * Are invoked with both the request **and** the `$http()` error: `middleware(req, err)`.
     *
     * Should not modify the `req` instance.
     *
     * Can **modify** the `err` object directly or **replace** it by another object, by rejecting with another error.
     *
     * Can **convert an error into a success** by resolving the promise with a payload.
     *
     * Synchronous middlewares:
     * - if it **returns a value**, this value **replaces the error** and the **next** middleware is invoked
     *
     * Asynchronous middleware:
     * - if it **rejects with a value**, this value **replaces the error** and the **next** middleware is invoked
     * - if one **resolves with a value**, the outcome is **converted into success** and the whole method is **resolved** with this value
     *
     * *NOTE:* If an error middleware **resolves**:
     * - no other middlewares are invoked,
     * - the error middlewares are NOT invoked
     * - and the service method resolves with the payload provided by that middleware.
     *
     */
    module.factory('CorkApiService', [
        '$q',
        '$http',
        'CorkApiRequest',
        'corkUtil',
        function CorkApiServiceFactory($q, $http, CorkApiRequest, corkUtil) {

            var isPromise = corkUtil.isPromise;
            var extend = corkUtil.extend;

            function compileURL(pattern, params) {
                var data = params || {};

                var hasParam;
                var regexp;
                var replace;

                var url = pattern.replace(/(\/)?:(\w+)(\?|\*)?/g, function matches(result, slash, key, flag) {
                    hasParam = data.hasOwnProperty(key);
                    // error on mandatory parameters
                    if (flag !== '?' && !hasParam) {
                        throw new Error('Missing parameter "' + key + '" when compiling URL for pattern "' + pattern + '".');
                    }
                    regexp = ':' + key;
                    // optional parameters
                    if (flag === '?') {
                        regexp += '\\?';
                        // replace preceeding / if optional parameter is not provided
                        if (!hasParam || !data[key]) {
                            regexp = '\/' + regexp;
                        }
                    }
                    // greedy parameters
                    else if (flag === '*') {
                        regexp += '\\*';
                    }
                    replace = (hasParam && data[key]) || '';
                    return result.replace(new RegExp(regexp), replace);
                });

                return url;
            }

            /**
             * invokes a list of middlewares in series, waiting for each to return/resolve
             * REQUEST middlewares:
             *  - are provided with (req) only,
             *  - bails out if one returns/resolves
             * ERROR and SUCCESS middlewares:
             *  - are provided with both (req, res)
             *  - and if one returns/resolves that value replaces the current res
             */
            function execMiddlewares(method, mode, req, res) {
                var deferred = $q.defer();
                var index = 0;
                var middlewares = method[mode];
                var middlewareRetValue;

                function next(res) {
                    if (index < middlewares.length) {
                        if (mode !== 'request') {}
                        // call middleware with (req) only if running REQUEST middlewares, invoke with (req, res) if SUCCESS or ERROR
                        middlewareRetValue = (mode === 'request') ? middlewares[index](req) : middlewares[index](req, res);
                        // use q.all to treat all middlewares alike, whether they returned a promise or not
                        $q.all([middlewareRetValue]).then(function (replaceRes) {
                            // bail out and from REQUEST middlewares if one resolves
                            if (mode === 'request' && typeof replaceRes[0] !== 'undefined') {
                                deferred.resolve(replaceRes[0]);
                            }
                            // convert into a success if ERROR middleware returns and resolves a promise with a defined value
                            else if (mode === 'error' && isPromise(middlewareRetValue) && typeof replaceRes[0] !== 'undefined') {
                                deferred.resolve(replaceRes[0]);
                            }
                            // other cases, only replace the payload if previous middleware returned a promise or something NOT undefined
                            else {
                                next('undefined' !== typeof replaceRes[0] ? replaceRes[0] : res);
                            }
                        }, function (replaceErr) {
                            if (mode === 'error') {
                                next('undefined' !== typeof replaceErr ? replaceErr : res);
                            } else {
                                deferred.reject(replaceErr);
                            }
                        });
                        index++;
                    } else {
                        // reject if zero middlewares, or no middleware resolve/rejected
                        if (mode === 'error') {
                            deferred.reject(res);
                        } else {
                            deferred.resolve(res);
                        }
                    }
                }

                next(res);

                return deferred.promise;
            }

            /**
             * @param {string} name
             * @param {object} all
             * @param {object} method
             */
            function normalizeServiceMethod(name, method, all) {

                if (method.hasOwnProperty('url') && !isString(method.url) && !isFunction(method.url)) {
                    throw new Error('Invalid url for service method "' + name + '".');
                }
                if (method.hasOwnProperty('pattern') && !isString(method.pattern)) {
                    throw new Error('Invalid pattern for service method "' + name + '".');
                }
                if (!isString(method.verb)) {
                    throw new Error('Invalid verb for service method "' + name + '".');
                }
            }

            /**
             * returns a service method that implements the args > request > execute > success|error flow
             * @param {function} RequestConstructor
             * @param {function} execute
             * @returns {function}
             */
            function createServiceMethod(RequestConstructor, execute, method) {
                method.args = method.args || angular.noop;
                method.request = method.request || [];
                method.success = method.success || [];
                method.error = method.error || [];

                function executeAndProcess(req) {
                    // acquired by copy
                    var config = req.config;
                    config.method = method.verb;
                    // compile url from pattern if url not provided
                    config.url = config.url || method.url;
                    if (isFunction(config.url)) {
                        config.url = config.url(config);
                    } else if (!config.url) {
                        config.url = compileURL(method.pattern, req.urlParams);
                    }

                    return execute(config).then(function success(res) {
                        return execMiddlewares(method, 'success', req, res);
                    }, function error(res) {
                        return execMiddlewares(method, 'error', req, res).then(function (err) {
                            return err;
                        }, function (err) {
                            return $q.reject(err);
                        });
                    });
                }

                return function serviceMethod() {
                    var args = Array.prototype.slice.call(arguments);
                    var req = new RequestConstructor(method.config);

                    req.replay = function requestReplay(replayConfig) {
                        extend(req, replayConfig);
                        return executeAndProcess(req);
                    };

                    args.unshift(req);
                    method.args.apply(null, args);

                    return execMiddlewares(method, 'request', req).then(function (res) {
                        if (res) {
                            return res;
                        } else {
                            return executeAndProcess(req);
                        }
                    });
                };
            }

            /**
             * @ngdoc function
             * @name CorkApiService
             * @methodOf ng.cork.api.service.CorkApiService
             *
             * @description
             * Constructor
             *
             * Provide an `object` with the service config.
             *
             * You may define `methods`, a default config for `all` methods and provide an alternative implementaion for `execute`.
             *
             * All are optional.
             *
             * Ex:
             *
             * <pre>
             * {
             *   methods: {
             *     search: { ... },
             *     delete: { ... }
             *   },
             *   all: {
             *     config: { ... }
             *   },
             *   execute: function (config) { ... },
             * }
             * </pre>
             *
             * @param {object} options The service options.
             *
             * <pre>
             * var userService = new CorkApiService( ... options ... );
             * </pre>
             *
             * ## **options.methods** - *Object*
             *
             * Provide an object map of methods you wish to attach to the service.
             *
             * <pre>
             * var options = {
             *   methods: {
             *     search: { ... },
             *     delete: { ... }
             *   }
             * }
             * var userService = new CorkApiService(options);
             * </pre>
             *
             * The object keys will become the name of the method attached to the service.
             *
             * <pre>
             * userService.save(user).then( ... );
             * userService.search('query').then( ... );
             * </pre>
             *
             * *NOTE:* for method options, see **addMethod** just bellow.
             *
             * ## **options.all** - *Object*
             *
             * Provide an object with default options for all methods, to avoid repeating yourself.
             *
             * <pre>
             * var options = {
             *   all: {
             *     config: { .... $http config ... },
             *     response: [ ... response middlewares ... ],
             *     error: [ ... ]
             *   },
             *   methods: {
             *     search: {
             *       verb: 'POST',
             *       url: '/api/search'
             *     }
             *   }
             * }
             * </pre>
             *
             * *Note:* Middleware lists defined with each method will extend the middlewares provided in `all`:
             * - add middlewares in `all` if they should run in all methods
             * - middlewares provided in `all` will run before middlewares defined with each method.
             *
             * Other options provided with each method will override any same options in `all`.
             *
             * ## **options.execute** *Function*
             *
             * Provide a function to execute the requests. Default is `$http()`.
             *
             * <pre>
             * var options = {
             *   $execute: function (config) {
             *     // do extra stuff, delegate to `$http()`
             *     return $http(config);
             *   }
             * }
             * </pre>
             */
            var CorkApiService = function (options) {
                var self = this;

                var config = copy(options);

                // default execute function
                config.execute = config.execute || $http();

                if (!isFunction(config.execute)) {
                    throw new Error('Invalid execute fn for service "' + self.name + '".');
                }

                /**
                 * @ngdoc function
                 * @name addMethod
                 * @methodOf ng.cork.api.service.CorkApiService
                 *
                 * @description
                 * Adds a method to the service.
                 *
                 * Provide an *Object* with the method options.
                 *
                 * Property `verb` is mandatory
                 *
                 * At least one of `url` and `pattern` need to be provided.
                 *
                 * Everything else is optional.
                 *
                 * @param {string} name The name of the method.
                 * @param {object} options The method options. Ex:
                 *
                 * <pre>
                 * service.addMethod('save', {
                 *     verb: 'POST',
                 *     pattern: '/foobar/:foo',
                 *     config: { ... $http config ... },
                 *     args: function () { ... },
                 *     request: [ ... middlewares ... ],
                 *     success: [ ... middlewares ... ],
                 *     error: [ ... middlewares ... ]
                 * });
                 * </pre>
                 *
                 * ## **options.verb** *String*
                 *
                 * One of `GET`, `POST`, ...
                 *
                 * ## **options.pattern** *String*
                 *
                 * Provide a *String* to be used as a pattern for the URL.
                 *
                 * The pattern will be interpolated with the values in **options.urlParams**
                 *
                 * <pre>
                 * service.addMethod('load', {
                 *   method: 'GET'
                 *   pattern: '/api/foo/:id',
                 *   args: function (req, id) { req.urlParams.id = id; }
                 * });
                 * </pre>
                 *
                 * ## **options.url** - *String|Function*
                 *
                 * If **options.url** is provided, **options.pattern** is ignored.
                 *
                 * Provide a *String* to be used as the request URL.
                 *
                 * <pre>
                 * service.addMethod('all', {
                 *   method: 'GET'
                 *   url: '/api/foo'
                 * });
                 * service.all();
                 * </pre>
                 *
                 * Alternatively, provide a *Function* that returns the target URL.
                 *
                 * It will be invoked just before the request is executed and provided with the full
                 * {@link ng.cork.api.request.CorkApiRequest CorkApiRequest} object
                 *
                 * <pre>
                 * service.addMethod('load', {
                 *   method: 'GET',
                 *   url: function (req) { return '/api/foo/' + req.id; },
                 *   args: function (req, id) { req.urlParams.id = id; }
                 * });
                 * </pre>
                 *
                 * ## **options.config** - *Object*
                 *
                 * Provide an *Object* to seed the $http() config options.
                 *
                 * <pre>
                 * service.addMethod('status', {
                 *   method: 'GET',
                 *   url: '/api/status',
                 *   config: {
                 *     timeout: 5000
                 *   }
                 * });
                 * </pre>
                 *
                 * ## **options.args** - *Function*
                 *
                 * Provide a *Function* to handle the method arguments and decorate the request.
                 *
                 * <pre>
                 * service.addMethod('load', {
                 *   method: 'GET',
                 *   url: '/api/foo/:id',
                 *   args: function (req, id) { req.urlParams.id = id; }
                 * });
                 * </pre>
                 *
                 * Every argument passed into the service method will be available in the args function.
                 *
                 * <pre>
                 * service.load(1, 2, 3); // => args(req, 1, 2, 3)
                 * </pre>
                 *
                 * ## **options.request** - *Array*
                 *
                 * Provide a list of middlewares to be invoked before `execute()`.
                 *
                 * Each middleware should be a *Function* accepting `(req)`;
                 *
                 * <pre>
                 * service.addMethod('all', {
                 *   method: 'GET',
                 *   url: '/api/foo',
                 *   request: [function getCache(req) { ... }]
                 * });
                 * </pre>
                 *
                 * ## **options.success** - *Array*
                 *
                 * Provide a list of middlewares to be invoked if `execute()` was successful.
                 *
                 * Each middleware should be a *Function* accepting `(req, res)`.
                 *
                 * <pre>
                 * service.addMethod('all', {
                 *   method: 'GET',
                 *   url: '/api/foo',
                 *   success: [function normalizeResponse(req, res) { ... }]
                 * });
                 * </pre>
                 *
                 * ## **options.request** - *Array*
                 *
                 * Provide a list of middlewares to be invoked if `execute()` failed.
                 *
                 * Each middleware should be a *Function* accepting `(req, err)`.
                 *
                 * <pre>
                 * service.addMethod('all', {
                 *   method: 'GET',
                 *   url: '/api/foo',
                 *   request: [function normalizeError(req, err) { ... }]
                 * });
                 * </pre>
                 *
                 */
                self.addMethod = function (name, method) {
                    if (!corkUtil.isObjectObject(method)) {
                        throw new Error('Invalid options for service method "' + name + '".');
                    }
                    var baseConfig = config.all ? copy(config.all) : {};
                    method = extend(baseConfig, method);
                    normalizeServiceMethod(name, method);
                    Object.defineProperty(self, name, {
                        value: createServiceMethod(CorkApiRequest, config.execute, method)
                    });
                };

                // store methods
                var methods = config.methods || {};
                for (var name in methods) {
                    self.addMethod(name, methods[name]);
                }

                Object.defineProperty(self, 'name', {
                    get: function () {
                        return config.name;
                    }
                });
            };

            return CorkApiService;
        }
    ]);

})(angular);
