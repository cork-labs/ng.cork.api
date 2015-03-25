describe('ng.cl.api', function () {
    'use strict';

    beforeEach(module('ng.cl.api'));

    describe('ClApi', function () {

        describe('execute()', function () {

            var $mockHttp;
            beforeEach(module(function ($provide) {
                $mockHttp = jasmine.createSpy('$http');
                $provide.value('$http', $mockHttp);
            }));

            describe('when no baseUrl is configured', function () {

                it('should invoke $http() with the provided config and return the underlying promise.', inject(function (ClApi)  {

                    var httpConfig = {
                        foo: 'bar'
                    };
                    var mockPromise = {};
                    $mockHttp.and.returnValue(mockPromise);

                    var api = new ClApi();
                    var promise = api.execute(httpConfig);

                    var expectedConfig = {
                        foo: 'bar',
                        url: '/'
                    };

                    expect(promise).toBe(mockPromise);
                    expect($mockHttp).toHaveBeenCalledWith(expectedConfig);
                }));
            });

            describe('when a baseUrl is configured', function () {

                it('should set url to baseUrl if no url provided.', inject(function (ClApi)  {

                    var apiConfig = {
                        baseUrl: '/baz'
                    };
                    var httpConfig = {
                        foo: 'bar'
                    };

                    var api = new ClApi(apiConfig);
                    api.execute(httpConfig);

                    var expectedConfig = {
                        foo: 'bar',
                        url: '/baz/'
                    };

                    expect($mockHttp).toHaveBeenCalledWith(expectedConfig);
                }));

                it('should prepend baseUrl to the provided url.', inject(function (ClApi)  {

                    var apiConfig = {
                        baseUrl: '/baz'
                    };
                    var httpConfig = {
                        foo: 'bar',
                        url: '/qux'
                    };

                    var api = new ClApi(apiConfig);
                    api.execute(httpConfig);

                    var expectedConfig = {
                        foo: 'bar',
                        url: '/baz/qux'
                    };

                    expect($mockHttp).toHaveBeenCalledWith(expectedConfig);
                }));

                it('should resolve url if it was provided has a function.', inject(function (ClApi)  {

                    var apiConfig = {
                        baseUrl: '/baz'
                    };
                    var httpConfig = {
                        foo: 'bar',
                        url: function () {
                            return '/qux';
                        }
                    };

                    var api = new ClApi(apiConfig);
                    api.execute(httpConfig);

                    var expectedConfig = {
                        foo: 'bar',
                        url: '/baz/qux'
                    };

                    expect($mockHttp).toHaveBeenCalledWith(expectedConfig);
                }));

                it('should pass httpConfig to the provided url function.', inject(function (ClApi)  {

                    var apiConfig = {
                        baseUrl: '/baz'
                    };
                    var urlSpy = jasmine.createSpy('urlSpy');
                    var httpConfig = {
                        foo: 'bar',
                        url: urlSpy
                    };

                    var api = new ClApi(apiConfig);
                    api.execute(httpConfig);

                    expect(urlSpy).toHaveBeenCalledWith(httpConfig);
                }));

                it('should NOT prefix with baseUrl if the provided url is absolute (starts with scheme).', inject(function (ClApi)  {

                    var apiConfig = {
                        baseUrl: '/baz'
                    };
                    var httpConfig = {
                        foo: 'bar',
                        url: 'https://qux.quux/corge'
                    };

                    var api = new ClApi(apiConfig);
                    api.execute(httpConfig);

                    var expectedConfig = {
                        foo: 'bar',
                        url: 'https://qux.quux/corge'
                    };

                    expect($mockHttp).toHaveBeenCalledWith(expectedConfig);
                }));

                it('should NOT prefix with baseUrl if the provided url is absolute (starts with //).', inject(function (ClApi)  {

                    var apiConfig = {
                        baseUrl: '/baz'
                    };
                    var httpConfig = {
                        foo: 'bar',
                        url: '//qux.quux/corge'
                    };

                    var api = new ClApi(apiConfig);
                    api.execute(httpConfig);

                    var expectedConfig = {
                        foo: 'bar',
                        url: '//qux.quux/corge'
                    };

                    expect($mockHttp).toHaveBeenCalledWith(expectedConfig);
                }));
            });
        });
    });
});
