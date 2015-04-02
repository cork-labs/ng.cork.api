(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.api.request', [
        'ng.cork.util'
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
     */
    module.factory('CorkApiRequest', [
        'corkUtil',
        function CorkApiRequestFactory(corkUtil) {

            /**
             * @ngdoc function
             * @name CorkApiRequest
             * @methodOf ng.cork.api.request.CorkApiRequest
             *
             * @description
             * Constructor
             *
             * @param {object} config Any arbitrary data, potentially containing the $http() config properties.
             */
            var Request = function Request(config) {
                if (isObject(config)) {
                    corkUtil.extend(this, config);
                }
            };

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
