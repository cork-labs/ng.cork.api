describe('ng.cork.api.service', function () {
    'use strict';

    beforeEach(module('ng.cork.api.service'));

    describe('CorkApiService', function () {

        describe('constructor', function () {

            it('should throw an error if execute function is invalid.', inject(function (CorkApiService) {

                var config = {
                    name: 'foo',
                    execute: 'bar'
                };

                expect(function () {
                    new CorkApiService(config);
                }).toThrow(new Error('Invalid execute fn for service "undefined".'));
            }));

            it('should return an instance populated with the provided config.', inject(function (CorkApiService) {

                var config = {
                    name: 'foo',
                    execute: function execute() {}
                };

                var instance = new CorkApiService(config);

                expect(instance.name).toBe('foo');
            }));

            describe('methods', function () {

                it('should attach the methods.', inject(function (CorkApiService) {

                    var config = {
                        execute: function execute() {},
                        methods: {
                            foo: {
                                pattern: '/foo',
                                verb: 'POST'
                            },
                            bar: {
                                pattern: '/bar',
                                verb: 'POST'
                            },
                        }
                    };

                    var instance = new CorkApiService(config);

                    expect(typeof instance.foo).toBe('function');
                    expect(typeof instance.bar).toBe('function');
                }));
            });
        });

        describe('method', function () {

            describe('normalize', function () {

                it('should throw an error if method is not an object.', inject(function (CorkApiService) {

                    var argsSpy = jasmine.createSpy('fooArgs');

                    var config = {
                        execute: function execute() {},
                        methods: {
                            foo: false
                        }
                    };

                    expect(function () {
                        new CorkApiService(config);
                    }).toThrow(new Error('Invalid options for service method "foo".'));
                }));

                it('should throw an error if provided pattern is invalid.', inject(function (CorkApiService) {

                    var argsSpy = jasmine.createSpy('fooArgs');

                    var config = {
                        execute: function execute() {},
                        methods: {
                            foo: {
                                pattern: false,
                                config: {
                                    params: {
                                        foo: 'bar'
                                    }
                                }
                            }
                        }
                    };

                    expect(function () {
                        new CorkApiService(config);
                    }).toThrow(new Error('Invalid pattern for service method "foo".'));
                }));

                it('should throw an error if provided url is invalid.', inject(function (CorkApiService) {

                    var argsSpy = jasmine.createSpy('fooArgs');

                    var config = {
                        execute: function execute() {},
                        methods: {
                            foo: {
                                url: false,
                                config: {
                                    params: {
                                        foo: 'bar'
                                    }
                                }
                            }
                        }
                    };

                    expect(function () {
                        new CorkApiService(config);
                    }).toThrow(new Error('Invalid url for service method "foo".'));
                }));

                it('should throw an error if verb is not provided.', inject(function (CorkApiService) {

                    var argsSpy = jasmine.createSpy('fooArgs');

                    var config = {
                        execute: function execute() {},
                        methods: {
                            foo: {
                                pattern: '/foo',
                                config: {
                                    params: {
                                        foo: 'bar'
                                    }
                                }
                            }
                        }
                    };

                    expect(function () {
                        new CorkApiService(config);
                    }).toThrow(new Error('Invalid verb for service method "foo".'));
                }));

                it('should throw an error if verb is invalid.', inject(function (CorkApiService) {

                    var argsSpy = jasmine.createSpy('fooArgs');

                    var config = {
                        execute: function execute() {},
                        methods: {
                            foo: {
                                pattern: '/foo',
                                verb: false,
                                config: {
                                    params: {
                                        foo: 'bar'
                                    }
                                }
                            }
                        }
                    };

                    expect(function () {
                        new CorkApiService(config);
                    }).toThrow(new Error('Invalid verb for service method "foo".'));
                }));
            });

            describe('defaults (no middlewares)', function () {

                var executeSpy;
                var config;
                var mockDefer;
                var mockPromise;
                beforeEach(module(function ($provide) {
                    // mock execute
                    executeSpy = jasmine.createSpy('execute');
                    // service config
                    config = {
                        execute: executeSpy,
                        methods: {
                            foo: {
                                pattern: '/foo',
                                verb: 'POST',
                                config: {
                                    params: {
                                        foo: 'bar'
                                    }
                                }
                            }
                        }
                    };
                }));
                // mock execute promise
                beforeEach(inject(function ($q) {
                    mockDefer = $q.defer();
                    mockPromise = mockDefer.promise;
                    executeSpy.and.returnValue(mockPromise);
                }));

                it('should invoke the execute fn with the provided config.', inject(function (CorkApiService, $rootScope) {

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        params: config.methods.foo.config.params,
                        method: config.methods.foo.verb,
                        url: config.methods.foo.pattern
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args.length).toBe(1);
                    expect(typeof args[0]).toBe('object');
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should resolve with the execute payload.', inject(function (CorkApiService, $rootScope) {

                    // resolve execute
                    var res = {
                        foo: 'bar'
                    };
                    var resolveSpy = jasmine.createSpy('resolve');

                    var instance = new CorkApiService(config);
                    instance.foo().then(resolveSpy);

                    // resolve the execute deferred
                    mockDefer.resolve(res);
                    $rootScope.$apply();

                    // resolved with the execute payload
                    expect(resolveSpy).toHaveBeenCalledWith(res);
                }));

                it('should reject with the execute error.', inject(function (CorkApiService, $rootScope) {

                    var error = {
                        foo: 'bar'
                    };
                    var errorSpy = jasmine.createSpy('resolve');

                    var instance = new CorkApiService(config);
                    instance.foo().then(angular.noop, errorSpy);

                    // reject the execute deferred
                    mockDefer.reject(error);
                    $rootScope.$apply();

                    expect(errorSpy).toHaveBeenCalledWith(error);
                }));
            });

            // same behaviour as no-middlewares
            describe('defaults (pass-through middlewares)', function () {

                var executeSpy;
                var config;
                var mockDefer;
                var mockPromise;
                beforeEach(module(function ($provide) {
                    // mock execute
                    executeSpy = jasmine.createSpy('execute');
                    // service config
                    config = {
                        execute: executeSpy,
                        methods: {
                            foo: {
                                pattern: '/foo',
                                verb: 'POST',
                                request: [function () {}],
                                success: [function () {}],
                                error: [function () {}],
                            }
                        }
                    };
                }));
                // mock execute promise
                beforeEach(inject(function ($q) {
                    mockDefer = $q.defer();
                    mockPromise = mockDefer.promise;
                    executeSpy.and.returnValue(mockPromise);
                }));

                it('should invoke the execute fn with the provided config.', inject(function (CorkApiService, $rootScope) {

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: config.methods.foo.pattern
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args.length).toBe(1);
                    expect(typeof args[0]).toBe('object');
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should resolve with the execute payload.', inject(function (CorkApiService, $rootScope) {

                    // resolve execute
                    var res = {
                        foo: 'bar'
                    };
                    var resolveSpy = jasmine.createSpy('resolve');

                    var instance = new CorkApiService(config);
                    instance.foo().then(resolveSpy);

                    // resolve the execute deferred
                    mockDefer.resolve(res);
                    $rootScope.$apply();

                    // resolved with the execute payload
                    expect(resolveSpy).toHaveBeenCalledWith(res);
                }));

                it('should reject with the execute error.', inject(function (CorkApiService, $rootScope) {

                    var error = {
                        foo: 'bar'
                    };
                    var errorSpy = jasmine.createSpy('resolve');

                    var instance = new CorkApiService(config);
                    instance.foo().then(angular.noop, errorSpy);

                    // reject the execute deferred
                    mockDefer.reject(error);
                    $rootScope.$apply();

                    expect(errorSpy).toHaveBeenCalledWith(error);
                }));
            });

            describe('config', function () {

                var executeSpy;
                var config;
                var mockDefer;
                var mockPromise;
                beforeEach(module(function ($provide) {
                    // mock execute
                    executeSpy = jasmine.createSpy('execute');
                    // service config
                    config = {
                        execute: executeSpy,
                        methods: {
                            foo: {
                                pattern: '/foo',
                                verb: 'POST'
                            }
                        }
                    };
                }));
                // mock execute promise
                beforeEach(inject(function ($q) {
                    mockDefer = $q.defer();
                    mockPromise = mockDefer.promise;
                    executeSpy.and.returnValue(mockPromise);
                }));

                it('should fallback to the "all" service config.', inject(function (CorkApiService, $rootScope) {

                    config.all = {
                        config: {
                            params: {
                                foo: 'bar',
                                qux: 'quux'
                            },
                            data: {
                                quuux: 'corge'
                            }
                        }
                    };

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        params: {
                            foo: 'bar',
                            qux: 'quux'
                        },
                        data: {
                            quuux: 'corge'
                        },
                        method: config.methods.foo.verb,
                        url: config.methods.foo.pattern
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args.length).toBe(1);
                    expect(typeof args[0]).toBe('object');
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should merge the method config with the "all" service config.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.config = {
                        params: {
                            foo: 'bar'
                        }
                    };

                    config.all = {
                        config: {
                            params: {
                                foo: 'baz',
                                qux: 'quux'
                            },
                            data: {
                                quuux: 'corge'
                            }
                        }
                    };

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        params: {
                            foo: 'bar',
                            qux: 'quux'
                        },
                        data: {
                            quuux: 'corge'
                        },
                        method: config.methods.foo.verb,
                        url: config.methods.foo.pattern
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args.length).toBe(1);
                    expect(typeof args[0]).toBe('object');
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should NOT include any properties not relevant for $http.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.config = {
                        foo: 'bar',
                        pattern: 'foo'
                    };

                    config.all = {
                        config: {
                            foo: {
                                bar: 'baz'
                            },
                            bar: {
                                quuux: 'corge'
                            }
                        }
                    };

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: config.methods.foo.pattern
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args.length).toBe(1);
                    expect(typeof args[0]).toBe('object');
                    expect(args[0]).toEqual(expectedConfig);
                }));
            });

            describe('config.url', function () {

                var executeSpy;
                var config;
                var mockDefer;
                var mockPromise;
                beforeEach(module(function ($provide) {
                    // mock execute
                    executeSpy = jasmine.createSpy('execute');
                    // service config
                    config = {
                        execute: executeSpy,
                        methods: {
                            foo: {
                                verb: 'POST'
                            }
                        }
                    };
                }));
                // mock execute promise
                beforeEach(inject(function ($q) {
                    mockDefer = $q.defer();
                    mockPromise = mockDefer.promise;
                    executeSpy.and.returnValue(mockPromise);
                }));

                it('should throw an error if a urlParam is missing.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.pattern = '/foo/:bar';

                    var instance = new CorkApiService(config);
                    instance.foo();

                    expect(function () {
                        $rootScope.$apply();
                    }).toThrow(new Error('Missing parameter "bar" when compiling URL for pattern "/foo/:bar".'));
                }));

                it('should throw an error if the missing urlParam is optional.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.pattern = '/foo/:bar?/baz';

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: '/foo/baz'
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should interpolate pattern with request urlParams.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.pattern = '/foo/:bar';
                    config.methods.foo.args = function (req) {
                        req.urlParams = {
                            bar: 'baz'
                        };
                    };

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: '/foo/baz'
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should interpolate optional parameters.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.pattern = '/foo/:bar?';
                    config.methods.foo.args = function (req) {
                        req.urlParams = {
                            bar: 'baz'
                        };
                    };

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: '/foo/baz'
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should interpolate greedy parameters.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.pattern = '/foo/:bar*';
                    config.methods.foo.args = function (req) {
                        req.urlParams = {
                            bar: 'baz/qux'
                        };
                    };

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: '/foo/baz/qux'
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should NOT interpolate pattern if method has a url property.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.pattern = '/foo/:bar';
                    config.methods.foo.url = '/baz';

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: '/baz'
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args[0]).toEqual(expectedConfig);
                }));

                it('should NOT interpolate pattern if config has a url property.', inject(function (CorkApiService, $rootScope) {

                    config.methods.foo.pattern = '/foo/:bar';
                    config.methods.foo.args = function (req) {
                        req.url = '/baz';
                    };

                    var instance = new CorkApiService(config);
                    instance.foo();
                    $rootScope.$apply();

                    expect(executeSpy).toHaveBeenCalled();

                    var expectedConfig = {
                        method: config.methods.foo.verb,
                        url: '/baz'
                    };

                    var args = executeSpy.calls.argsFor(0);
                    expect(args[0]).toEqual(expectedConfig);
                }));
            });

            describe('args', function () {

                var argsSpy;
                var config;
                var mockDefer;
                var mockPromise;
                beforeEach(module(function ($provide) {
                    argsSpy = jasmine.createSpy('argsSpy');
                    // service config
                    config = {
                        execute: function () {},
                        methods: {
                            foo: {
                                pattern: '/foo',
                                verb: 'POST',
                                args: argsSpy
                            }
                        }
                    };
                }));

                it('should invoke the args fn upon invoking the method.', inject(function (CorkApiService, CorkApiRequest) {

                    var instance = new CorkApiService(config);
                    instance.foo(42, 99);

                    expect(argsSpy).toHaveBeenCalled();

                    var args = argsSpy.calls.argsFor(0);
                    expect(args.length).toBe(3);
                    expect(typeof args[0]).toBe('object');
                    expect(args[0] instanceof CorkApiRequest).toBe(true);
                    expect(args[1]).toBe(42);
                    expect(args[2]).toBe(99);
                }));
            });

            describe('middlewares', function () {

                var executeSpy;
                var requestSpy1;
                var requestSpy2;
                var successSpy1;
                var successSpy2;
                var errorSpy1;
                var errorSpy2;
                var config;
                var mockDefer;
                var mockPromise;
                beforeEach(module(function ($provide) {
                    // mock request middlewares
                    requestSpy1 = jasmine.createSpy('requestSpy1');
                    requestSpy2 = jasmine.createSpy('requestSpy2');
                    // mock success middlewares
                    successSpy1 = jasmine.createSpy('successSpy1');
                    successSpy2 = jasmine.createSpy('successSpy2');
                    // mock error middlewares
                    errorSpy1 = jasmine.createSpy('errorSpy1');
                    errorSpy2 = jasmine.createSpy('errorSpy2');
                    // mock execute
                    executeSpy = jasmine.createSpy('execute');
                    // service config
                    config = {
                        execute: executeSpy,
                        methods: {
                            foo: {
                                pattern: '/foo',
                                verb: 'POST',
                                request: [
                                    requestSpy1,
                                    requestSpy2
                                ],
                                success: [
                                    successSpy1,
                                    successSpy2
                                ],
                                error: [
                                    errorSpy1,
                                    errorSpy2
                                ]
                            }
                        }
                    };
                }));
                beforeEach(inject(function ($q) {
                    // mock execute promise
                    mockDefer = $q.defer();
                    mockPromise = mockDefer.promise;
                    executeSpy.and.returnValue(mockPromise);
                }));

                describe('request', function () {

                    it('should invoke the request middlewares with the request object.', inject(function (CorkApiService, CorkApiRequest, $rootScope) {

                        var instance = new CorkApiService(config);
                        instance.foo();
                        $rootScope.$apply();

                        // both middlewares were invoked
                        expect(requestSpy1).toHaveBeenCalled();
                        expect(requestSpy2).toHaveBeenCalled();

                        // both middlewares are provided with only the request object
                        var args1 = requestSpy1.calls.argsFor(0);
                        expect(args1.length).toBe(1);
                        expect(typeof args1[0]).toBe('object');
                        expect(args1[0] instanceof CorkApiRequest).toBe(true);

                        var args2 = requestSpy2.calls.argsFor(0);
                        expect(args2.length).toBe(1);
                        expect(typeof args2[0]).toBe('object');
                        expect(args2[0] instanceof CorkApiRequest).toBe(true);
                    }));

                    describe('when a request middleware resolves', function () {

                        it('should NOT invoke the remaining middlewares and resolve with the request middleware payload.', inject(function (CorkApiService, $rootScope) {

                            // resolve the first request middleware
                            var res = {
                                foo: 'bar'
                            };
                            requestSpy1.and.returnValue(res);

                            var resolveSpy = jasmine.createSpy('resolve');

                            var instance = new CorkApiService(config);
                            instance.foo().then(resolveSpy);
                            $rootScope.$apply();

                            // only the 1st request middleware was invoked
                            expect(requestSpy1).toHaveBeenCalled();
                            expect(requestSpy2).not.toHaveBeenCalled();

                            // error and success middlewares are not invoked
                            expect(successSpy1).not.toHaveBeenCalled();
                            expect(errorSpy1).not.toHaveBeenCalled();

                            // resolved with the request middleware payload
                            expect(resolveSpy).toHaveBeenCalledWith(res);
                        }));
                    });

                    describe('when a request middleware rejects', function () {

                        it('should NOT invoke any other middlewares and reject with the request middleware error', inject(function (CorkApiService, $rootScope, $q) {

                            var requestDefer = $q.defer();
                            var requestPromise = requestDefer.promise;

                            // reject the first middleware with error
                            var error = {
                                foo: 'bar'
                            };
                            requestSpy1.and.returnValue(requestPromise);
                            requestDefer.reject(error);

                            var rejectSpy = jasmine.createSpy('reject');

                            var instance = new CorkApiService(config);
                            instance.foo().then(angular.noop, rejectSpy);
                            $rootScope.$apply();

                            // only the 1st request middleware was invoked
                            expect(requestSpy1).toHaveBeenCalled();
                            expect(requestSpy2).not.toHaveBeenCalled();

                            // error and success middlewares are not invoked
                            expect(successSpy1).not.toHaveBeenCalled();
                            expect(errorSpy1).not.toHaveBeenCalled();

                            // rejected with the request middleware error
                            expect(rejectSpy).toHaveBeenCalledWith(error);
                        }));
                    });
                });

                describe('success', function () {

                    it('should invoke the success middlewares with the request object and response payload.', inject(function (CorkApiService, CorkApiRequest, $rootScope) {

                        // resolve execute
                        var res = {
                            foo: 'bar'
                        };

                        var instance = new CorkApiService(config);
                        instance.foo();

                        // resolve the execute deferred
                        mockDefer.resolve(res);
                        $rootScope.$apply();

                        // both middlewares were invoked
                        expect(successSpy1).toHaveBeenCalled();
                        expect(successSpy2).toHaveBeenCalled();

                        // both middlewares are provided with the request object and the execute payload
                        var args1 = successSpy1.calls.argsFor(0);
                        expect(args1.length).toBe(2);
                        expect(typeof args1[0]).toBe('object');
                        expect(args1[0] instanceof CorkApiRequest).toBe(true);
                        expect(args1[1]).toBe(res);

                        var args2 = successSpy2.calls.argsFor(0);
                        expect(args2.length).toBe(2);
                        expect(typeof args2[0]).toBe('object');
                        expect(args2[0] instanceof CorkApiRequest).toBe(true);
                        expect(args2[1]).toBe(res);

                        // error middlewares are not invoked
                        expect(errorSpy1).not.toHaveBeenCalled();
                    }));

                    describe('when a success middleware returns a new response payload', function () {

                        it('should invoke the next middleware with the request object and the replaced payload.', inject(function (CorkApiService, CorkApiRequest, $rootScope) {

                            // resolve execute
                            var res1 = {
                                foo: 'bar'
                            };

                            // payload replacement
                            var res2 = {
                                baz: 'qux'
                            };

                            successSpy1.and.returnValue(res2);

                            var instance = new CorkApiService(config);
                            instance.foo();

                            // reject the execute deferreds
                            mockDefer.resolve(res1);
                            $rootScope.$apply();

                            // both middlewares were invoked
                            expect(successSpy1).toHaveBeenCalled();
                            expect(successSpy2).toHaveBeenCalled();

                            // first middleware is provided with the request object and the execute payload
                            var args1 = successSpy1.calls.argsFor(0);
                            expect(args1.length).toBe(2);
                            expect(typeof args1[0]).toBe('object');
                            expect(args1[0] instanceof CorkApiRequest).toBe(true);
                            expect(args1[1]).toBe(res1);

                            // second middleware is provided with the request object and the replaced payload
                            var args2 = successSpy2.calls.argsFor(0);
                            expect(args2.length).toBe(2);
                            expect(typeof args2[0]).toBe('object');
                            expect(args2[0] instanceof CorkApiRequest).toBe(true);
                            expect(args2[1]).toBe(res2);
                        }));
                    });

                    describe('when a success middleware rejects', function () {

                        it('should NOT invoke any other middlewares and reject with the request middleware error', inject(function (CorkApiService, $rootScope, $q) {

                            var successDefer = $q.defer();
                            var successPromise = successDefer.promise;

                            // resolve execute
                            var res = {
                                foo: 'bar'
                            };

                            // reject the first middleware with error
                            var error = {
                                baz: 'qux'
                            };

                            successSpy1.and.returnValue(successPromise);
                            successDefer.reject(error);

                            var rejectSpy = jasmine.createSpy('reject');

                            var instance = new CorkApiService(config);
                            instance.foo().then(angular.noop, rejectSpy);

                            // resolve the execute deferred
                            mockDefer.resolve(res);
                            $rootScope.$apply();

                            // only the 1st success middleware was invoked
                            expect(successSpy1).toHaveBeenCalled();
                            expect(successSpy2).not.toHaveBeenCalled();

                            // rejected with the request middleware error
                            expect(rejectSpy).toHaveBeenCalledWith(error);
                        }));
                    });
                });

                describe('error', function () {

                    it('should invoke the error middlewares.', inject(function (CorkApiService, CorkApiRequest, $rootScope) {

                        // reject execute
                        var error = {
                            foo: 'bar'
                        };

                        var instance = new CorkApiService(config);
                        instance.foo();

                        // reject the execute deferred
                        mockDefer.reject(error);
                        $rootScope.$apply();

                        // both middlewares were invoked
                        expect(errorSpy1).toHaveBeenCalled();
                        expect(errorSpy2).toHaveBeenCalled();

                        // both middlewares are provided with the request object and the execute error
                        var args1 = errorSpy1.calls.argsFor(0);
                        expect(args1.length).toBe(2);
                        expect(typeof args1[0]).toBe('object');
                        expect(args1[0] instanceof CorkApiRequest).toBe(true);
                        expect(args1[1]).toBe(error);

                        var args2 = errorSpy2.calls.argsFor(0);
                        expect(args2.length).toBe(2);
                        expect(typeof args2[0]).toBe('object');
                        expect(args2[0] instanceof CorkApiRequest).toBe(true);
                        expect(args1[1]).toBe(error);

                        // success middlewares are not invoked
                        expect(successSpy1).not.toHaveBeenCalled();
                    }));

                    describe('when an error middleware returns a new error payload', function () {

                        it('should invoke the next middleware with the request object and the replaced error.', inject(function (CorkApiService, CorkApiRequest, $rootScope) {

                            // reject execute
                            var error1 = {
                                foo: 'bar'
                            };

                            // error replacement
                            var error2 = {
                                baz: 'qux'
                            };

                            errorSpy1.and.returnValue(error2);

                            var instance = new CorkApiService(config);
                            instance.foo();

                            // reject the execute deferreds
                            mockDefer.reject(error1);
                            $rootScope.$apply();

                            // both middlewares were invoked
                            expect(errorSpy1).toHaveBeenCalled();
                            expect(errorSpy2).toHaveBeenCalled();

                            // first middleware is provided with the request object and the execute error
                            var args1 = errorSpy1.calls.argsFor(0);
                            expect(args1.length).toBe(2);
                            expect(typeof args1[0]).toBe('object');
                            expect(args1[0] instanceof CorkApiRequest).toBe(true);
                            expect(args1[1]).toBe(error1);

                            // second middleware is provided with the request object and the replaced error
                            var args2 = errorSpy2.calls.argsFor(0);
                            expect(args2.length).toBe(2);
                            expect(typeof args2[0]).toBe('object');
                            expect(args2[0] instanceof CorkApiRequest).toBe(true);
                            expect(args2[1]).toBe(error2);
                        }));
                    });

                    describe('when an error middleware resolves', function () {

                        it('should NOT invoke any other middleware and resolve with that middleware payload.', inject(function (CorkApiService, $rootScope, $q) {

                            var errorDefer = $q.defer();
                            var errorPromise = errorDefer.promise;

                            // reject execute
                            var error = {
                                foo: 'bar'
                            };

                            // switch to success
                            var res = {
                                baz: 'qux'
                            };

                            errorSpy1.and.returnValue(errorPromise);
                            errorDefer.resolve(res);

                            var resolveSpy = jasmine.createSpy('resolve');

                            var instance = new CorkApiService(config);
                            instance.foo().then(resolveSpy);

                            // reject the execute deferreds
                            mockDefer.reject(error);
                            $rootScope.$apply();

                            // both middlewares were invoked
                            expect(errorSpy1).toHaveBeenCalled();
                            expect(errorSpy2).not.toHaveBeenCalled();

                            // resolved with the error middleware payload
                            expect(resolveSpy).toHaveBeenCalledWith(res);
                        }));
                    });

                    describe('when an error middleware rejects', function () {

                        it('should invoke the next middleware with the request object and the replaced error.', inject(function (CorkApiService, CorkApiRequest, $rootScope, $q) {

                            var errorDefer = $q.defer();
                            var errorPromise = errorDefer.promise;

                            // resolve execute
                            var error1 = {
                                foo: 'bar'
                            };

                            // reject the first middleware with error
                            var error2 = {
                                baz: 'qux'
                            };

                            errorSpy1.and.returnValue(errorPromise);
                            errorDefer.reject(error2);

                            var instance = new CorkApiService(config);
                            instance.foo();

                            // resolve the execute deferred
                            mockDefer.reject(error1);
                            $rootScope.$apply();

                            // 1st error middleware was invoked with the original error
                            expect(errorSpy1).toHaveBeenCalled();
                            var args1 = errorSpy1.calls.argsFor(0);
                            expect(args1.length).toBe(2);
                            expect(typeof args1[0]).toBe('object');
                            expect(args1[0] instanceof CorkApiRequest).toBe(true);
                            expect(args1[1]).toBe(error1);

                            // second middleware is invoked with the replaced error
                            expect(errorSpy2).toHaveBeenCalled();
                            var args2 = errorSpy2.calls.argsFor(0);
                            expect(args2.length).toBe(2);
                            expect(typeof args2[0]).toBe('object');
                            expect(args2[0] instanceof CorkApiRequest).toBe(true);
                            expect(args2[1]).toBe(error2);
                        }));
                    });
                });
            });
        });
    });
});
