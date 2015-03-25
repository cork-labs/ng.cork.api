describe('ng.cl.api', function () {
    'use strict';

    beforeEach(module('ng.cl.api'));

    describe('ClApi', function () {

        describe('model()', function () {

            describe('when an invalid model name is provided', function () {

                it('should throw an error.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(function () {
                        api.model(null);
                    }).toThrow(new Error('Invalid model name.'));
                }));
            });

            describe('when a second argument is provided', function () {

                it('should return the api instance.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(api.model('foo', 'Foo')).toBe(api);
                }));

                it('should throw an exception if the model was registered before.', inject(function (ClApi)  {

                    var api = new ClApi();

                    api.model('foo', 'Foo');

                    expect(function () {
                        api.model('foo', 'Foo');
                    }).toThrow(new Error('Model "foo" is already registered.'));
                }));

                it('should throw an exception if argument is not an object.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(function () {
                        api.model('foo', []);
                    }).toThrow(new Error('Invalid options for model "foo".'));
                }));

                it('should throw an exception if argument is null.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(function () {
                        api.model('foo', null);
                    }).toThrow(new Error('Invalid options for model "foo".'));
                }));

                it('should store the provided model options.', inject(function (ClApi)  {

                    var options = {
                        $constructor: 'Foo',
                        bar: 'baz'
                    };

                    var api = new ClApi();
                    api.model('foo', options);

                    var model = api.model('foo');

                    expect(model.bar).toBe('baz');
                    expect(model.$constructor).toBe('Foo');
                }));

                describe('and argument is a string', function () {

                    it('should set "name" and "$constructor" properties.', inject(function (ClApi)  {

                        var api = new ClApi();
                        api.model('foo', 'Foo');

                        var model = api.model('foo');

                        expect(model.name).toBe('foo');
                        expect(model.$constructor).toBe('Foo');
                        expect(typeof model.$new).toBe('function');
                        expect(model.service).toBe(null);
                        expect(typeof model.methods).toBe('object');
                        expect(model.methods.length).toBe(0);
                    }));
                });

                describe('and argument is a function', function () {

                    it('should set "name" and "$new" properties.', inject(function (ClApi)  {

                        var $new = function () {};

                        var api = new ClApi();
                        api.model('foo', $new);

                        var model = api.model('foo');

                        expect(model.name).toBe('foo');
                        expect(model.$constructor).toBe(undefined);
                        expect(typeof model.$new).toBe('function');
                        expect(model.$new).toBe($new);
                        expect(model.service).toBe(null);
                        expect(typeof model.methods).toBe('object');
                        expect(model.methods.length).toBe(0);
                    }));

                });

                describe('and argument is an object', function () {

                    it('should throw an error if "$constructor" is not provided.', inject(function (ClApi)  {

                        var options = {};

                        var api = new ClApi();

                        expect(function () {
                            api.model('foo', options);
                        }).toThrow(new Error('Invalid "constructor" in options for model "foo".'));
                    }));

                    it('should throw an error if "$constructor" is not string or function.', inject(function (ClApi)  {

                        var options = {
                            $constructor: []
                        };

                        var api = new ClApi();

                        expect(function () {
                            api.model('foo', options);
                        }).toThrow(new Error('Invalid "constructor" in options for model "foo".'));
                    }));

                    it('should set "name" and "$constructor" properties.', inject(function (ClApi)  {

                        var options = {
                            $constructor: function () {}
                        };

                        var api = new ClApi();
                        api.model('foo', options);

                        var model = api.model('foo');

                        expect(model.name).toBe('foo');
                        expect(model.$constructor).toBe(options.$constructor);
                        expect(typeof model.$new).toBe('function');
                        expect(model.service).toBe(null);
                        expect(typeof model.methods).toBe('object');
                        expect(model.methods.length).toBe(0);
                    }));

                    it('should ignore and override any "$new" property.', inject(function (ClApi)  {

                        var options = {
                            $constructor: function () {},
                            $new: function () {}
                        };

                        var api = new ClApi();
                        api.model('foo', options);

                        var model = api.model('foo');

                        expect(typeof model.$new).toBe('function');
                        expect(model.$new).not.toBe(options.$new);
                    }));

                    describe('and options contains a "methods" property', function () {

                        it('should throw an error if "methods" is not an array.', inject(function (ClApi)  {

                            var options = {
                                $constructor: 'Foo',
                                methods: 'bar'
                            };

                            var api = new ClApi();

                            expect(function () {
                                api.model('foo', options);
                            }).toThrow(new Error('Invalid "methods" in options for model "foo".'));
                        }));

                        it('should throw an error if "methods" contains elements that are neither strings or objects or functions.', inject(function (ClApi)  {

                            var options = {
                                $constructor: 'Foo',
                                methods: [false]
                            };

                            var api = new ClApi();

                            expect(function () {
                                api.model('foo', options);
                            }).toThrow(new Error('Invalid options for method of model "foo".'));
                        }));

                        describe('and "methods" contains a string element', function () {

                            it('should store the method "name", "service" and "method" properties.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: ['bar'],
                                    service: 'baz'
                                };

                                var api = new ClApi();
                                api.model('foo', options);

                                var model = api.model('foo');

                                expect(model.methods.length).toBe(1);
                                expect(model.methods[0].name).toBe('bar');
                                expect(model.methods[0].service).toBe('baz');
                                expect(model.methods[0].method).toBe('bar');
                                expect(model.methods[0].xyz).toBe(null);
                            }));
                        });

                        describe('and "methods" contains an object element', function () {

                            it('should throw an error if method does not contain a "name" property.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        bar: 'qux'
                                    }],
                                    service: 'baz'
                                };

                                var api = new ClApi();

                                expect(function () {
                                    api.model('foo', options);
                                }).toThrow(new Error('Invalid "name" in options for method "undefined" of model "foo".'));
                            }));

                            it('should throw an error if method does not contain a "name" property.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{}],
                                    service: 'baz'
                                };

                                var api = new ClApi();

                                expect(function () {
                                    api.model('foo', options);
                                }).toThrow(new Error('Invalid "name" in options for method "undefined" of model "foo".'));
                            }));

                            it('should throw an error if method contains a "name" property that is not a string.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        name: false
                                    }],
                                    service: 'baz'
                                };

                                var api = new ClApi();

                                expect(function () {
                                    api.model('foo', options);
                                }).toThrow(new Error('Invalid "name" in options for method "undefined" of model "foo".'));
                            }));

                            it('should throw an error if method contains a "name" property that is an empty string.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        name: ''
                                    }],
                                    service: 'baz'
                                };

                                var api = new ClApi();

                                expect(function () {
                                    api.model('foo', options);
                                }).toThrow(new Error('Invalid "name" in options for method "undefined" of model "foo".'));
                            }));

                            it('should throw an error if method contains a "method" property that is neither a string or a function.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        name: 'bar',
                                        method: false
                                    }],
                                    service: 'baz'
                                };

                                var api = new ClApi();

                                expect(function () {
                                    api.model('foo', options);
                                }).toThrow(new Error('Invalid "method" in options for method "bar" of model "foo".'));
                            }));

                            it('should throw an error if both the method and the model do not contain a "service" property.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        name: 'bar'
                                    }]
                                };

                                var api = new ClApi();

                                expect(function () {
                                    api.model('foo', options);
                                }).toThrow(new Error('Invalid "service" in options for method "bar" of model "foo".'));
                            }));

                            it('should store the method`s "name" and "method" properties and take the "service" property from the model.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        name: 'bar'
                                    }],
                                    service: 'baz'
                                };

                                var api = new ClApi();
                                api.model('foo', options);

                                var model = api.model('foo');

                                expect(model.methods.length).toBe(1);
                                expect(model.methods[0].name).toBe('bar');
                                expect(model.methods[0].service).toBe('baz');
                                expect(model.methods[0].method).toBe('bar');
                                expect(model.methods[0].xyz).toBe(null);
                            }));

                            it('should store the method "name" and "service" properties and ignore the "service" property from the model.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        name: 'bar',
                                        service: 'qux'
                                    }],
                                    service: 'baz'
                                };

                                var api = new ClApi();
                                api.model('foo', options);

                                var model = api.model('foo');

                                expect(model.methods.length).toBe(1);
                                expect(model.methods[0].name).toBe('bar');
                                expect(model.methods[0].service).toBe('qux');
                                expect(model.methods[0].method).toBe('bar');
                                expect(model.methods[0].xyz).toBe(null);
                            }));

                            it('should store the method "name", "service", "method" and "xyz" properties.', inject(function (ClApi)  {

                                var options = {
                                    $constructor: 'Foo',
                                    methods: [{
                                        name: 'bar',
                                        service: 'baz',
                                        method: 'qux',
                                        xyz: 'quux'
                                    }]
                                };

                                var api = new ClApi();
                                api.model('foo', options);

                                var model = api.model('foo');

                                expect(model.methods.length).toBe(1);
                                expect(model.methods[0].name).toBe('bar');
                                expect(model.methods[0].service).toBe('baz');
                                expect(model.methods[0].method).toBe('qux');
                                expect(model.methods[0].xyz).toBe('quux');
                            }));
                        });
                    });
                });
            });

            describe('when no options argument is provided', function () {

                describe('and an unknown model is requested', function () {

                    it('should throw an error.', inject(function (ClApi)  {

                        var api = new ClApi();

                        expect(function () {
                            api.model('foo');
                        }).toThrow(new Error('Unknown model "foo".'));
                    }));
                });

                describe('and a known model with a "factory" function is requested and $new is invoked', function () {

                    var api;
                    var MockFoo;
                    var factory;
                    var mockInstance = {};
                    beforeEach(inject(function (ClApi) {
                        factory = jasmine.createSpy('factory');
                        factory.and.returnValue(mockInstance);
                        api = new ClApi();
                        api.model('foo', factory);
                    }));

                    it('should invoke the "factory" function and return the instance.', function ()  {

                        var model = api.model('foo');

                        expect(model.$new).toBe(factory);

                        var instance = model.$new();

                        expect(instance).toBe(mockInstance);
                    });
                });

                describe('and a known model with a string "constructor" is requested and $new is invoked', function () {

                    var api;
                    var MockFoo;
                    var options = {
                        $constructor: 'Foo'
                    };
                    beforeEach(module(function ($provide) {
                        MockFoo = function (data) {
                            this.data = data;
                        };
                        $provide.value('Foo', MockFoo);
                    }));
                    beforeEach(inject(function (ClApi) {
                        api = new ClApi();
                        api.model('foo', options);
                    }));

                    it('should invoke the injector and set the "constructor" to the actual constructor.', function ()  {

                        var model = api.model('foo');

                        expect(model.$constructor).toBe('Foo');

                        var instance = model.$new();

                        expect(model.$constructor).toBe(MockFoo);
                    });

                    it('should return instances of the configured constructor.', function ()  {

                        var model = api.model('foo');

                        var instance1 = model.$new();

                        expect(instance1 instanceof MockFoo).toBe(true);

                        // forces the code coverage of else path
                        // and makes sure this you get a new instance for every call
                        var instance2 = model.$new();
                        expect(instance1).not.toBe(instance2);
                    });

                    it('should pass instantination data to the constructor.', function ()  {

                        var data = {};

                        var model = api.model('foo');

                        var instance = model.$new(data);

                        expect(instance.data).toBe(data);
                    });
                });

                describe('and a known model with function methods is requested and $new is invoked', function () {

                    var api;
                    var MockFoo;
                    var options = {
                        $constructor: 'Foo',
                        methods: [{
                            name: 'bar',
                            method: function () {
                                return this.baz;
                            }
                        }]
                    };
                    beforeEach(module(function ($provide) {
                        MockFoo = function (data) {
                            this.data = data;
                        };
                        $provide.value('Foo', MockFoo);
                    }));
                    beforeEach(inject(function (ClApi) {
                        api = new ClApi();
                        api.model('foo', options);
                    }));

                    it('should attach the provided function to the instance.', function ()  {

                        var instance = api.model('foo').$new();

                        expect(typeof instance.bar).toBe('function');
                    });

                    it('should bind the function to the instance.', function ()  {

                        var instance = api.model('foo').$new();
                        instance.baz = 'qux';

                        expect(instance.bar()).toBe(instance.baz);
                    });
                });

                describe('and a known model with a service method is requested and $new is invoked', function () {

                    var api;
                    var MockFoo;
                    var options = {
                        $constructor: 'Foo',
                        methods: [{
                            name: 'bar',
                            service: 'baz',
                            method: 'qux'
                        }]
                    };
                    var mockService;
                    beforeEach(module(function ($provide) {
                        MockFoo = function (data) {
                            this.data = data;
                        };
                        $provide.value('Foo', MockFoo);
                    }));
                    beforeEach(inject(function (ClApi) {
                        // mock the service
                        mockService = {
                            qux: jasmine.createSpy('qux')
                        };
                        mockService.qux.and.returnValue(123);
                        // mock the api service method
                        api = new ClApi();
                        api.service = jasmine.createSpy('service');
                        api.service.and.returnValue(mockService);
                        api.model('foo', options);
                    }));

                    it('should resolve the service from "string" to actual instance.', function ()  {

                        var instance = api.model('foo').$new();

                        expect(api.service).toHaveBeenCalledWith('baz');

                    });

                    it('should update the method definition with the resolved service and not resolve again.', function ()  {

                        var instance1 = api.model('foo').$new();

                        expect(api.model('foo').methods[0].service).toBe(mockService);

                        var instance2 = api.model('foo').$new();

                        expect(api.service.calls.count()).toBe(1);
                    });

                    it('should attach a method to the instance.', function ()  {

                        var instance = api.model('foo').$new();

                        expect(typeof instance.bar).toBe('function');
                    });

                    describe('invoking the attached method', function () {

                        it('should invoke the service method with the instance.', function ()  {

                            var instance = api.model('foo').$new();

                            instance.bar();

                            expect(mockService.qux).toHaveBeenCalledWith(instance);
                        });

                        it('should invoke the service method with the remaining params.', function ()  {

                            var instance = api.model('foo').$new();

                            instance.bar(42, 99);

                            expect(mockService.qux).toHaveBeenCalledWith(instance, 42, 99);
                        });

                        it('should return the service method`s return value.', function ()  {

                            var instance = api.model('foo').$new();

                            var res = instance.bar();

                            expect(res).toBe(123);
                        });
                    });
                });

                describe('and a known model with a service method (that returns a promise but has no xyz to apply) is requested and $new is invoked', function () {

                    var api;
                    var MockFoo;
                    var options = {
                        $constructor: 'Foo',
                        methods: [{
                            name: 'bar',
                            service: 'baz',
                            method: 'qux'
                        }]
                    };
                    var mockPromise;
                    var mockService;
                    beforeEach(module(function ($provide) {
                        MockFoo = function (data) {
                            this.data = data;
                        };
                        $provide.value('Foo', MockFoo);
                    }));
                    beforeEach(inject(function (ClApi) {
                        // mock the service
                        mockService = {
                            qux: jasmine.createSpy('qux')
                        };
                        mockPromise = jasmine.createSpyObj('promise', ['then']);
                        mockService.qux.and.returnValue(mockPromise);
                        // mock the api service method
                        api = new ClApi();
                        api.service = jasmine.createSpy('service');
                        api.service.and.returnValue(mockService);
                        api.model('foo', options);
                    }));

                    describe('invoking the attached method', function () {

                        it('should return the service method`s promise.', function ()  {

                            var instance = api.model('foo').$new();

                            var res = instance.bar();

                            expect(res).toBe(mockPromise);
                        });

                        it('should NOT bind the promise.', function ()  {

                            var instance = api.model('foo').$new();

                            instance.bar();

                            expect(mockPromise.then).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('and a known model with a service method (that returns a promise and applies an xyz to the model) is requested and $new is invoked', function () {

                    var api;
                    var MockFoo;
                    var options = {
                        $constructor: 'Foo',
                        methods: [{
                            name: 'bar',
                            service: 'baz',
                            method: 'qux',
                            xyz: 'quux'
                        }]
                    };
                    var mockDefer;
                    var mockPromise;
                    var mockService;
                    beforeEach(module(function ($provide) {
                        MockFoo = function (data) {
                            this.data = data;
                            this.quux = jasmine.createSpy('quux');
                        };
                        $provide.value('Foo', MockFoo);
                    }));
                    beforeEach(inject(function (ClApi, $q) {
                        // mock the service
                        mockDefer = $q.defer();
                        mockPromise = mockDefer.promise;
                        mockService = {
                            qux: jasmine.createSpy('qux')
                        };
                        mockService.qux.and.returnValue(mockPromise);
                        // mock the api service method
                        api = new ClApi();
                        api.service = jasmine.createSpy('service');
                        api.service.and.returnValue(mockService);
                        api.model('foo', options);
                    }));

                    describe('invoking the attached method and resolving the service promise', function () {

                        it('should bind the promise and apply the xyz to the model.', inject(function ($rootScope)  {

                            var instance = api.model('foo').$new();

                            instance.bar();

                            var res = {
                                foo: 'bar'
                            };

                            mockDefer.resolve(res);
                            $rootScope.$apply();

                            expect(instance.quux).toHaveBeenCalledWith(res);
                        }));

                        it('should resolve with the service return value.', inject(function ($rootScope)  {

                            var instance = api.model('foo').$new();

                            var resolveSpy = jasmine.createSpy('resolveSpy');

                            var promise = instance.bar();
                            promise.then(resolveSpy);

                            var res = {
                                foo: 'bar'
                            };

                            mockDefer.resolve(res);
                            $rootScope.$apply();

                            expect(resolveSpy).toHaveBeenCalledWith(res);
                        }));
                    });
                });
            });
        });
    });
});
