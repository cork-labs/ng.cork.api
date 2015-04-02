(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.api.request', [
        'ng.cork.util',
        'ng.cork.deep.obj'
    ]);

    var copy = angular.copy;

    var isObject = angular.isObject;

    var configProperties = ['method', 'url', 'params', 'data', 'headers', 'xsrfHeaderName', 'xsrfCookieName', 'transformRequest', 'transformResponse', 'cache', 'timeout', 'withCredentials', 'responseType'];

    /**
     * @ngdoc object
     * @name ng.cork.api.request.CorkApiRequest
     *
     * @description
     * Encapsulates the $http config object.
     *
     * Because it extends [CorkDeepObj](https://github.com/cork-labs/ng.cork.deep), instances will also have methods
     * to set/get/delete request properties via dot notation path.
     *
     * <pre>
     * var request = new CorkApiRequest({timeout: 5000});
     * request.set('params.id', 5);
     * request.get('urlParams.path');
     * </pre>
     *
     */
    module.factory('CorkApiRequest', [
        'CorkDeepObj',
        function CorkApiRequestFactory(CorkDeepObj) {

            /**
             * @ngdoc function
             * @name CorkApiRequest
             * @methodOf ng.cork.api.request.CorkApiRequest
             *
             * @description
             * Constructor
             *
             * @param {object} config Any arbitrary data, potentially containing the $http() config properties.
             *
             * <pre>
             * var request = new CorkApiRequest({timeout: 5000});
             * </pre>
             */
            var Request = function Request(config) {
                CorkDeepObj.call(this, config);
            };

            Request.prototype = Object.create(CorkDeepObj.prototype);
            Request.prototype.constructor = Request;

            Object.defineProperty(Request.prototype, 'config', {
                get: function () {
                    var ret = {};
                    for (var key in this) {
                        if (configProperties.indexOf(key) !== -1) {
                            ret[key] = copy(this[key]);
                        }
                    }
                    return ret;
                }
            });
            return Request;
        }
    ]);

})(angular);
