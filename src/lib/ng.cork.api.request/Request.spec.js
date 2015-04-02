describe('ng.cork.api.request', function () {
    'use strict';

    beforeEach(module('ng.cork.api.request'));

    describe('CorkApiRequest', function () {

        describe('constructor()', function () {

            it('should return an instance populated with the provided data.', inject(function (CorkApiRequest) {

                var data = {
                    id: 42,
                    foo: 'bar'
                };

                var instance1 = new CorkApiRequest(data);
                var instance2 = new CorkApiRequest();
                instance2.id = 42;
                instance2.foo = 'bar';

                expect(instance1).toEqual(instance2);
            }));

            it('should ignore the argument if it is not an object.', inject(function (CorkApiRequest) {

                var instance1 = new CorkApiRequest('data');
                var instance2 = new CorkApiRequest();

                expect(instance1).toEqual(instance2);
            }));

            it('should deep copy the provided data to populate the instance.', inject(function (CorkApiRequest) {

                var data = {
                    id: 42,
                    foo: {
                        bar: 'baz'
                    },
                    qux: [
                        'quux'
                    ]
                };

                var instance = new CorkApiRequest(data);

                expect(instance.id).toBe(42);
                expect(angular.isObject(instance.foo)).toBeTruthy();
                expect(instance.foo.bar).toBe('baz');
                expect(angular.isArray(instance.qux)).toBeTruthy();
                expect(instance.qux).toEqual(['quux']);
            }));

            it('modifying the provided data after instantiation should NOT affect the instance.', inject(function (CorkApiRequest) {

                var data = {
                    id: 42,
                    foo: 'bar',
                    baz: {
                        qux: 'quux' // makes sure it is a deep copy
                    }
                };

                var instance = new CorkApiRequest(data);

                data.id++;
                data.foo = 'baz';
                data.baz.qux = 'corge';

                expect(instance.id).toBe(42);
                expect(instance.foo).toBe('bar');
                expect(instance.baz.qux).toBe('quux');
            }));

            describe('config', function () {

                it('should return an object with the $http config properties only', inject(function (CorkApiRequest) {
                    var data = {
                        method: 'POST',
                        url: '/foo/bar',
                        params: {
                            foo: 'bar'
                        },
                        data: {
                            foo: 'bar'
                        },
                        headers: {
                            foo: 'bar'
                        },
                        xsrfHeaderName: 'foo',
                        xsrfCookieName: 'bar',
                        transformRequest: function () {},
                        transformResponse: function () {},
                        cache: true,
                        timeout: 123,
                        withCredentials: false,
                        responseType: 'baz',
                        // these should be ingored by the config getter
                        id: 42,
                        foo: 'bar',
                    };

                    var instance = new CorkApiRequest(data);

                    var config = instance.config;

                    expect(typeof config).toBe('object');
                    expect(config.method).toEqual(data.method);
                    expect(config.url).toEqual(data.url);
                    expect(config.params).toEqual(data.params);
                    expect(config.data).toEqual(data.data);
                    expect(config.headers).toEqual(data.headers);
                    expect(config.xsrfHeaderName).toEqual(data.xsrfHeaderName);
                    expect(config.xsrfCookieName).toEqual(data.xsrfCookieName);
                    expect(config.transformRequest).toEqual(data.transformRequest);
                    expect(config.transformResponse).toEqual(data.transformResponse);
                    expect(config.cache).toEqual(data.cache);
                    expect(config.timeout).toEqual(data.timeout);
                    expect(config.withCredentials).toEqual(data.withCredentials);
                    expect(config.responseType).toEqual(data.responseType);

                    expect(config.id).toBe(undefined);
                    expect(config.foo).toBe(undefined);
                }));

                it('modifying the return object should not modifiy the instance', inject(function (CorkApiRequest) {

                    var data = {
                        params: {
                            foo: 'bar'
                        },
                        transformRequest: function () {}
                    };

                    var instance = new CorkApiRequest(data);

                    var config = instance.config;

                    config.params.foo = 'baz';

                    expect(instance.config.params.foo).toBe('bar');
                    // just a note: functions by reference
                    expect(instance.config.transformRequest).toBe(data.transformRequest);
                }));
            });

        });
    });
});
