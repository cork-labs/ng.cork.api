/**
 * @ngdoc module
 * @name cxApi
 * @module cxApi
 *
 * @description
 * Provides an abstraction layer for the b2s API.
 */
angular.module('cxApi', [])

/**
 * @ngdoc provider
 * @name apiProvider
 * @module cxApi
 *
 * @description
 * Allows configuration of the {@link cxApi.api api} service.
 */
.provider('api', [

    function () {
        'use strict';

        var baseUrl;

        /**
         * @type {Object} provider configuration.
         */
        var apiConfig = {
            baseUrl: null
        };

        /**
         * @ngdoc method
         * @name apiProvider#configure
         *
         * @description
         * Configures the {@link courseService}.
         *
         * @param {Object} config Object with configuration options, extends base configuration.
         *
         * - baseUrl: Prepended to all API request URLs that do not include scheme://host:port
         */
        this.configure = function (config) {
            angular.extend(apiConfig, config);
            // make sure baseUrl ends with "/"
            if (apiConfig.baseUrl) {
                if (!/\/$/.test(apiConfig.baseUrl)) {
                    apiConfig.baseUrl += '/';
                }
            }
        };

        /**
         * @ngdoc service
         * @name api
         * @module cxApi
         *
         * @description
         * Api abstraction service.
         *
         * Normalises response objects, extracting `data`, `meta` and `error` from `response.data`.
         *
         * @property {string} baseUrl **READ-ONLY** The `baseUrl` configuration property, as provided to `apiProvider.configure()`
         *
         * See also {@link cxApi.apiProvider apiProvider} which allows you to configure the api service.
         */
        this.$get = [
            '$q',
            '$http',
            function ($q, $http) {

                /**
                 * @param  {string} url As provided to method.
                 * @returns {string}     Prefixed url.
                 */
                function prefixWithBaseUrl(url) {
                    if (apiConfig.baseUrl) {
                        // remove "/" from start of url
                        // since we already ensured at config time that baseUrl has a trailing "/"
                        if (/^\//.test(url)) {
                            url = url.substring(1);
                        }
                        if (!(/^(http[s]?:)?\/\//.test(url))) {
                            url = apiConfig.baseUrl + url;
                        }
                    }
                    return url;
                }

                /**
                 * normalises the response, extracting `data`, `meta` and `error` if available
                 * @param {obejct} response The underlying `$http` response object.
                 */
                function normaliseResponse(response) {
                    if (response.data && (response.data.meta || response.data.error || response.data.data)) {
                        response.meta = response.data.meta ? response.data.meta : {};
                        delete response.data.meta;
                        response.error = response.data.error ? response.data.error : {};
                        delete response.data.error;
                        response.data = response.data.data ? response.data.data : {};
                        delete response.data.data;
                    }
                }

                var api = {

                    /**
                     * @ngdoc method
                     * @name api#execute
                     *
                     * @description
                     * Wrapper for `$http({method: '', ... });`.
                     *
                     * @param  {string}          method  One of "GET", "DELETE", "JSONP", "HEAD", "POST", "PUT".
                     * @param  {string|Function} url     The url to invoke. If a function is provided it will be invoked and should return a string.
                     * @param  {object|string=}  data    Data to be sent with request.
                     * @param  {object=}         options Options to extend/override $http method configuration.
                     *   See @link https://docs.angularjs.org/api/ng/service/$http#usage
                     *
                     * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked
                     * with a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
                     */
                    execute: function (method, url, data, options) {

                        var promise;
                        var config = angular.isObject(options) ? angular.copy(options) : {};

                        // resolves url in case it is a function
                        // and prefix with url if not absolute
                        if (angular.isFunction(url)) {
                            url = url();
                        }
                        url = prefixWithBaseUrl(url);

                        // prepare $http config
                        angular.extend(config, {
                            url: url,
                            method: method,
                        });
                        if (data) {
                            config.data = data;
                        }

                        // normalise response object
                        promise = $http(config).then(function (response) {
                            normaliseResponse(response);
                            return response;
                        }, function (response) {
                            normaliseResponse(response);
                            return $q.reject(response);
                        });

                        return promise;
                    },

                    /**
                     * @ngdoc method
                     * @name api#get
                     *
                     * @description
                     * Shorcut method for `execute({method: 'GET', ... });`
                     *
                     * @param  {string|Function} url     The url to invoke. If a function is provided it will be invoked and should return a string.
                     * @param  {object=}         options Options to extend/override $http method configuration. See @link https://docs.angularjs.org/api/ng/service/$http#usage
                     * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked
                     * with a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
                     */
                    get: function (url, options) {
                        return this.execute('GET', url, null, options);
                    },

                    /**
                     * @ngdoc method
                     * @name api#delete
                     *
                     * @description
                     * Shorcut method for `execute({method: 'DELETE', ... });`
                     *
                     * @param  {string|Function} url     The url to invoke. If a function is provided it will be invoked and should return a string.
                     * @param  {object=}         options Options to extend/override $http method configuration. See @link https://docs.angularjs.org/api/ng/service/$http#usage
                     * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked
                     * with a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
                     */
                    delete: function (url, options) {
                        return this.execute('DELETE', url, null, options);
                    },

                    /**
                     * @ngdoc method
                     * @name api#jsonp
                     *
                     * @description
                     * Shorcut method for `execute({method: 'JSONP', ... });`
                     *
                     * @param  {string|Function} url     The url to invoke. If a function is provided it will be invoked and should return a string.
                     * @param  {object=}         options Options to extend/override $http method configuration. See @link https://docs.angularjs.org/api/ng/service/$http#usage
                     * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked
                     * with a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
                     */
                    jsonp: function (url, options) {
                        return this.execute('JSONP', url, null, options);
                    },

                    /**
                     * @ngdoc method
                     * @name api#head
                     *
                     * @description
                     * Shorcut method for `execute({method: 'HEAD', ... });`
                     *
                     * @param  {string|Function} url     The url to invoke. If a function is provided it will be invoked and should return a string.
                     * @param  {object=}         options Options to extend/override $http method configuration. See @link https://docs.angularjs.org/api/ng/service/$http#usage
                     * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked
                     * with a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
                     */
                    head: function (url, options) {
                        return this.execute('HEAD', url, null, options);
                    },

                    /**
                     * @ngdoc method
                     * @name api#post
                     *
                     * @description
                     * Shorcut method for `execute({method: 'POST', ... });`
                     *
                     * @param  {string|Function} url     The url to invoke. If a function is provided it will be invoked and should return a string.
                     * @param  {object|string}   data    Data to be sent with request.
                     * @param  {object=}         options Options to extend/override $http method configuration. See @link https://docs.angularjs.org/api/ng/service/$http#usage
                     * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked
                     * with a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
                     */
                    post: function (url, data, options) {
                        return this.execute('POST', url, data, options);
                    },

                    /**
                     * @ngdoc method
                     * @name api#put
                     *
                     * @description
                     * Shorcut method for `execute({method: 'PUT', ... });`
                     *
                     * @param  {string|Function} url     The url to invoke. If a function is provided it will be invoked and should return a string.
                     * @param  {object|string}   data    Data to be sent with request.
                     * @param  {object=}         options Options to extend/override $http method configuration. See @link https://docs.angularjs.org/api/ng/service/$http#usage
                     * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked
                     * with a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
                     */
                    put: function (url, data, options) {
                        return this.execute('PUT', url, data, options);
                    }
                };

                Object.defineProperty(api, 'baseUrl', {
                    get: function () {
                        return apiConfig.baseUrl;
                    }
                });

                return api;
            }
        ];
    }
])

/**
 * @ngdoc service
 * @name ApiService
 * @module cxApi
 *
 * @description
 * Base class for API services.
 *
 * All methods invoke the underlying {@link cxApi.api api service} and return promises.
 *
 * Subclasses:
 * - {@link ApiServiceCRUD}
 */
.factory('ApiService', [
    '$q',
    '$http',
    'api',
    function ($q, $http, api) {
        'use strict';

        // serves as reference for the expected config data
        var configDefaults = {
            baseUrl: null,
            urlPattern: {}
        };

        /**
         * @ngdoc method
         * @name ApiService#ApiService
         *
         * @description
         * Constructor.
         *
         * @param {object=} config Service configuration object.
         */
        var ApiService = function (config) {

            this.config = angular.copy(configDefaults);

            angular.extend(this.config, angular.copy(config || {}));

            /**
             * @ngdoc method
             * @name ApiService#compileUrl
             *
             * @description
             * Retrieves a pre-configured URL pattern.
             *
             * @param {string} url A pre-configured URL pattern name.
             * @returns {string} The pattern string.
             */
            this.getUrlPattern = function (patternName) {

                if (!this.config.urlPattern.hasOwnProperty(patternName)) {
                    throw 'Unknown pattern "' + patternName + '".';
                }

                return this.config.urlPattern[patternName] ? this.config.urlPattern[patternName] : '';
            };

            /**
             * @ngdoc method
             * @name ApiService#compileUrl
             *
             * @description
             * Interpolates the url pattern with the given params.
             *
             * @param {string} url    A pre-configured URL pattern name.
             * @param {oject=} params Optional data to interpolate.
             * @returns {string} The compiled url.
             */
            this.compileUrl = function (patternName, params) {
                var data = params || {};
                var compiledUrl = this.config.baseUrl || '';
                var pattern = this.getUrlPattern(patternName);

                compiledUrl += pattern.replace(/:(\w+)/g, function (match, key) {

                    if (!angular.isUndefined(data[key])) {
                        match = match.replace(':' + key, data[key]);
                    } else {
                        throw 'Cannot compile pattern "' + patternName + '" parameter "' + key + '" is missing.';
                    }
                    return match;

                });
                return compiledUrl;
            };
        };

        return ApiService;
    }
])

/**
 * @ngdoc service
 * @name ApiServiceCRUD
 * @module cxApi
 *
 * @description
 * Base class for CRUD API services. Extends the base {@link ApiService}.
 *
 * All methods invoke the underlying {@link cxApi.api api service} and return promises.
 */
.factory('ApiServiceCRUD', [
    '$q',
    '$http',
    'api',
    'ApiService',
    function ($q, $http, api, ApiService) {
        'use strict';

        // serves as reference for the expected config data
        var configDefaults = {
            baseUrl: null,
            urlPattern: {
                collection: null,
                instance: null
            }
        };

        /**
         * @ngdoc method
         * @name ApiServiceCRUD#ApiServiceCRUD
         *
         * @description
         * Constructor.
         *
         * @param {object} config Service configuration object.
         */
        var ApiServiceCRUD = function (ModelConstructor, config) {

            var instanceConfig = angular.copy(configDefaults);

            angular.extend(instanceConfig, angular.copy(config || {}));

            ApiService.call(this, instanceConfig);

            /**
             * @ngdoc method
             * @name ApiServiceCRUD#createInstance
             *
             * @description
             * Creates and populates an instance of the service's model and links it to the service.
             *
             * @param  {object} data A plain javascript object.
             * @returns {object} Populated instance of the service's model.
             */
            this.createInstance = function (data) {
                var instance = new ModelConstructor(data);
                instance.service = this;
                return instance;
            };

            /**
             * @ngdoc method
             * @name ApiServiceCRUD#createInstances
             *
             * @description
             * Replaces the list elements with populated instances of the service's model and links them to the service.
             *
             * @param  {array} list A list of plain javascript objects.
             */
            this.createInstances = function (list) {
                var instances = [];
                for (var ix = 0; ix < list.length; ix++) {
                    instances[ix] = this.createInstance(list[ix]);
                }
                return instances;
            };

            /**
             * @ngdoc method
             * @name ApiServiceCRUD#get
             * @description
             * Load an instance.
             *
             * @param  {object} data An object with the properties needed to interpolate a instance url.
             * @returns {Promise} A promise that wraps the underlying `api` promise, resolved with the populated instance.
             */
            this.get = function (data) {
                var defer = $q.defer();

                var url = this.compileUrl('instance', data);

                api.get(url).then(angular.bind(this, function (res) {
                    var instance = this.createInstance(res.data);
                    defer.resolve(instance);
                }), defer.reject);

                return defer.promise;
            };

            /**
             * @ngdoc method
             * @name ApiServiceCRUD#post
             * @description
             * xxx
             *
             * @param  {object} data The model to post.
             * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked with
             * a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
             */
            this.create = function (data) {
                var url = this.compileUrl('collection');
                return api.post(url, data);
            };

            /**
             * @ngdoc method
             * @name ApiServiceCRUD#update
             * @description
             * xxx
             *
             * @param  {object} data The model to post.
             * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked with
             * a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
             */
            this.update = function (data) {
                var url = this.compileUrl('instance', data);
                return api.put(url, data);
            };

            /**
             * @ngdoc method
             * @name ApiServiceCRUD#delete
             * @description
             * xxx
             *
             * @param  {object} data The model to post.
             * @returns {Promise} The underlying `$http` promise. Both resolve and reject callbacks will be invoked with
             * a normalised `response` object containing `data`, `meta`, `error`, `status`, `headers`, `config` properties.
             */
            this.delete = function (data) {
                var url = this.compileUrl('instance', data);
                return api.delete(url);
            };

        };

        // inherits from ApiService
        ApiServiceCRUD.prototype = Object.create(ApiService.prototype);

        return ApiServiceCRUD;
    }
])

/**
 * @ngdoc service
 * @name Model
 * @module cxApi
 *
 * @description
 * Abstract class for models, provide data encapuslation.
 *
 * NOTE: subclasses of Model are not connected to a {@link ApiServiceCRUD CRUD Service} and do not expose service methods (load, save, delete).
 * For that purpose, use the {@link ApiModel} subclass.
 *
 * Subclasses:
 * - {@link ApiModel}
 */
.factory('Model', [

    function () {
        'use strict';

        /**
         * Performs recursive extension of the model with provided data.
         * @param  {object} model The model to extend.
         * @param  {object} data  The data to extend the model with.
         */
        function extendDeep(model, data) {
            if (model !== data) {
                for (var property in data) {
                    // data is object (or array) go go recursive
                    if (angular.isObject(data[property])) {
                        // initialize (or smash) model property to Array
                        if (angular.isArray(data[property]) && !angular.isArray(model[property])) {
                            model[property] = [];
                        }
                        // initialize (or smash) model property to Object
                        else if (angular.isObject(data[property]) && !angular.isArray(data[property]) && (!angular.isObject(model[property]) || angular.isArray(model[property]))) {
                            model[property] = {};
                        }
                        extendDeep(model[property], data[property]);
                    } else {
                        model[property] = data[property];
                    }
                }
            }
        }

        /**
         * @ngdoc method
         * @name Model#Model
         * @description
         * Constructor.
         * @param {object} data Instance data.
         */
        var Model = function (data) {

            // extends model with with  initialization data
            // and triggers the `decorate()` method. Override in subclasses to act on populated data.
            if (data) {
                extendDeep(this, data);
                this.decorate();
            }

        };

        /**
         * @ngdoc method
         * @name Model#empty
         *
         * @description
         * Deletes all instance data.
         */
        Object.defineProperty(Model.prototype, 'empty', {
            value: function () {
                for (var prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        delete this[prop];
                    }
                }
            }
        });

        /**
         * @ngdoc method
         * @name Model#replaceData
         *
         * @description
         * Replaces all instance data.
         *
         * @oaram {object} data Data to replace with.
         */
        Object.defineProperty(Model.prototype, 'replaceData', {
            configurable: true,
            value: function (data) {
                this.empty();
                angular.extend(this, angular.copy(data));
                this.decorate();
            }
        });

        /**
         * @ngdoc method
         * @name Model#mergeData
         *
         * @description
         * Merges existing instance data.
         *
         * @oaram {object} data Data to replace with.
         */
        Object.defineProperty(Model.prototype, 'mergeData', {
            value: function (data) {
                extendDeep(this, data);
                this.decorate();
            }
        });

        /**
         * @ngdoc method
         * @name Model#decorate
         *
         * @description
         * Invoked on initialization, and when {@link Model#mergeData mergeData()} or {@link Model#replaceData replaceData()} are invoked.
         * Override this method in subclasses to act on populated data, for instance, replacing POJSO with instances of appropriate objects.
         */
        Object.defineProperty(Model.prototype, 'decorate', {
            configurable: true,
            value: function () {}
        });

        return Model;
    }
])

/**
 * @ngdoc service
 * @name ApiModel
 * @module cxApi
 *
 * @description
 * Abstract class for API models. Extends the base {@link Model} class to add `load`, `save`, `delete` methods.
 *
 * When creating instances directly, via `new FooModel()`, theses instances will not have a reference to
 * their service and invoking the following methods will  result in an error:
 *  - `load()`
 *  - `save()`
 *  - `delete()`
 *
 * Always create the model instances via the corresponding service, either via `fooService.createInstance(data)` or one
 * of the methods that returns populated instances, like `fooService.get()` or `fooService.search()`.
 */
.factory('ApiModel', [
    'Model',
    function (Model) {
        'use strict';

        /**
         * @ngdoc method
         * @name ApiModel#ApiModel
         * @description
         * Constructor.
         * @param {object} data Instance data.
         */
        var ApiModel = function (data) {

            // NOTE: keep this at the bottom of the model construct, after initializing any defaults and declaring custom properties and methods
            // populates with initialization data and triggers the populate() method
            Model.call(this, data);

            /**
             * @ngdoc property
             * @name  ApiModel#service
             *
             * @description
             * An `Object`, a reference to the service for this model. Without this property being set it's not possible to use the
             *     persistance methods. If you acquire your model instances via a service method like `createInstance()`, `get()`
             *     or `search()`, this service reference will be automatically setup.
             */
            Object.defineProperty(this, 'service', {
                enumerable: false,
                writable: true
            });

            /**
             * @ngdoc property
             * @name  ApiModel#isNew
             *
             * @description
             * A `boolean` flag that exposes whether this instance is persisted. Relies on whether the identity properties exist.
             *   Default is to check for an `.id` property. When subclassing `ApiModel` you should override this method if the
             */
            Object.defineProperty(this, 'isNew', {
                get: function () {
                    return !this.hasOwnProperty('id');
                }
            });
        };

        // inherit from abstract Model before defining class properties
        ApiModel.prototype = Object.create(Model.prototype);

        /**
         * @ngdoc method
         * @name  ApiModel#load
         *
         * @description
         * Loads data into this instance, allowing client code to re-use current instance instead of
         * replacing it with a new. Uses the `get()` method in the attached service to retrieve a new instance and
         * then copies the loaded data into this instace.
         * **Note:** This method will fail if the model is not attached to the service.
         *
         * @oaram {object=} data Use this data to render the url, instead of the current instance state.
         * @returns {Promise} The underlying service promise.
         */
        Object.defineProperty(ApiModel.prototype, 'load', {
            value: function (data) {
                var self = this;
                var promise = this.service.get(data || this);
                promise.then(function (data) {
                    self.replaceData(data);
                });

                return promise;
            }
        });

        /**
         * @ngdoc method
         * @name  ApiModel#save
         *
         * @description
         * Saves this data using the attached service. Will invoke `create()` or `update()` depending on
         *   whether the current instance `isNew` or not.
         * **Note:** This method will fail if the model is not attached to the service.
         *
         * @returns {Promise} The underlying service promise.
         */
        Object.defineProperty(ApiModel.prototype, 'save', {
            value: function () {
                var self = this;

                if (this.isNew) {
                    return this.service.create(this);
                } else {
                    return this.service.update(this);
                }
            }
        });

        /**
         * @ngdoc method
         * @name  ApiModel#load
         *
         * @description
         * Invokes CRUD delete.
         *
         * **Note:** This method will fail if the model is not attached to the service.
         * @returns {Promise} The underlying service promise.
         */
        Object.defineProperty(ApiModel.prototype, 'delete', {
            value: function () {
                return this.service.delete(this);
            }
        });

        return ApiModel;
    }
]);
