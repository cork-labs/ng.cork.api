(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.api.client', [
        'ng.cork.util',
    ]);

    var copy = angular.copy;

    var isString = angular.isString;
    var isFunction = angular.isFunction;

    /**
     * makes sure baseUrl ends with a traling /
     * @param {string} url
     * @returns {string}
     */
    function trailingSlash(url) {
        url = url || '';
        return (!/\/$/.test(url)) ? url += '/' : url;
    }

    /**
     * @ngdoc object
     * @name ng.cork.api.client.CorkApiClient
     *
     * @description
     * Base class for api.
     *
     * @property {string} baseUrl Prepended to all requests. Configurable via constructor, defaults to '/'.
     */
    module.factory('CorkApiClient', [
        '$injector',
        '$http',
        'corkUtil',
        function CorkApiClientFactory($injector, $http, corkUtil) {

            var isInjectable = corkUtil.isInjectable;

            /**
             * @type {object} default api configuration
             */
            var defaults = {
                baseUrl: '/'
            };

            /**
             * @param {string} baseUrl
             * @param {string} url
             * @returns {string}
             */
            function prefixWithBaseUrl(baseUrl, url) {
                if (!(/^(http[s]?:)?\/\//.test(url))) {
                    // remove "/" from start of url
                    // since we already ensured at config time that baseUrl has a trailing "/"
                    if (/^\//.test(url)) {
                        url = url.substring(1);
                    }
                    url = baseUrl + url;
                }
                return url;
            }

            var CorkApiClient = function (config) {
                var self = this;

                config = corkUtil.extend(copy(defaults), config || {});

                // makes sure baseUrl ends with a traling /
                config.baseUrl = trailingSlash(config.baseUrl);
                // @todo config.execute = config.execute || $injector('$http');

                // -- middlewares

                /**
                 * @type {object} stores middleawres
                 */
                var middlewares = {};

                /**
                 * @ngdoc function
                 * @name middleware
                 * @methodOf ng.cork.api.client.CorkApiClient
                 *
                 * @description
                 * Registers or retrieves a middleware.
                 *
                 * If only a name is provided it will retrieve the middleware or throw an error
                 * if the middleware is unkonwn. If an implementation is provided it will store it or throw an
                 * error if the middleware is invalid or a middleware with this name was registered before.
                 *
                 * @param {string} name The middleware name.
                 * @param {function|Array} middleware A middleware function or an array defining an injectable function.
                 * @returns {boolean} Some result.
                 */
                self.middleware = function (name, middleware) {
                    if (!isString(name)) {
                        throw new Error('Invalid middleware name.');
                    }
                    if (arguments.length > 1) {
                        if (middlewares[name]) {
                            throw new Error('Middleware "' + name + '" is already registered.');
                        }
                        if (isFunction(middleware) || isInjectable(middleware)) {
                            middlewares[name] = middleware;
                        } else {
                            throw new Error('Invalid middleware "' + name + '".');
                        }
                        return this;
                    } else {
                        if (!middlewares[name]) {
                            throw new Error('Unknown middleware "' + name + '".');
                        }
                        return middlewares[name];
                    }
                };

                // -- services

                /**
                 * @type {object} stores service factories
                 */
                var factories = {};

                /**
                 * @type {object} stores service instances
                 */
                var services = {};

                /**
                 * @ngdoc function
                 * @name service
                 * @methodOf ng.cork.api.client.CorkApiClient
                 *
                 * @description
                 * Registers a service factory or retrieves a service instance.
                 *
                 * If no factory function or service name is provided as the second argument, it will retrieve the
                 * service instance or throw an error if the service is unkonwn.

                 * If a factory function or service name is provided as the second argument, it will store a the service
                 * factory or throw an error if a service with this name was registered before.
                 *
                 * @param {string} name The service name.
                 * @param {function=} factory A function that returns the service instance or a name of an injectable service.
                 * @returns {boolean} Some result.
                 */
                self.service = function (name, factory) {
                    if (!isString(name)) {
                        throw new Error('Invalid service name.');
                    }
                    if (arguments.length > 1) {
                        if (factories[name]) {
                            throw new Error('Service "' + name + '" is already registered.');
                        } else if (isString(factory)) {
                            factories[name] = function () {
                                return $injector.get(name);
                            };
                        } else if (isFunction(factory)) {
                            factories[name] = factory;
                        } else {
                            throw new Error('Invalid factory or configuration for service "' + name + '".');
                        }
                        return this;
                    } else {
                        if (!services[name]) {
                            if (!factories[name]) {
                                throw new Error('Unknown service "' + name + '".');
                            }
                            services[name] = factories[name]();
                        }
                        return services[name];
                    }
                };

                // -- execute

                /**
                 * @ngdoc function
                 * @name execute
                 * @methodOf ng.cork.api.client.CorkApiClient
                 *
                 * @description
                 * Wrapper for $http(), prepends url with the configured baseUrl.
                 *
                 * @param {object} httpConfig Options for $http.
                 * @returns {object} The underlying $http promise.
                 */
                self.execute = function (httpConfig) {

                    // resolves url in case it is a function
                    var url = isFunction(httpConfig.url) ? httpConfig.url(httpConfig) : httpConfig.url;
                    url = url || '';
                    // and prefix with url if not absolute
                    httpConfig.url = prefixWithBaseUrl(config.baseUrl, url);

                    // normalise response object
                    return $http(httpConfig);
                };

                // -- properties

                Object.defineProperty(this, 'baseUrl', {
                    get: function () {
                        return config.baseUrl;
                    }
                });
            };

            return CorkApiClient;
        }
    ]);

})(angular);
