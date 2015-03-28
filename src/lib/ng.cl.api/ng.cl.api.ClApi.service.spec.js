describe('ng.cl.api', function () {
    'use strict';

    beforeEach(module('ng.cl.api'));

    describe('ClApi', function () {

        describe('service()', function () {

            describe('when an invalid service name is provided', function () {

                it('should throw an error.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(function () {
                        api.service(null);
                    }).toThrow(new Error('Invalid service name.'));
                }));
            });

            describe('when a second argument is provided', function () {

                it('should return the api instance.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(api.service('foo', function () {})).toBe(api);
                }));

                it('should throw an exception if the service was registered before.', inject(function (ClApi)  {

                    var api = new ClApi();

                    api.service('foo', function () {});

                    expect(function () {
                        api.service('foo', function () {});
                    }).toThrow(new Error('Service "foo" is already registered.'));
                }));

                it('should throw an exception if argument is not an object or a function.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(function () {
                        api.service('foo', []);
                    }).toThrow(new Error('Invalid factory or configuration for service "foo".'));
                }));

                it('should throw an exception if options is null.', inject(function (ClApi)  {

                    var api = new ClApi();

                    expect(function () {
                        api.service('foo', null);
                    }).toThrow(new Error('Invalid factory or configuration for service "foo".'));
                }));

                describe('and argument is a string', function ()  {

                    var MockFoo;
                    beforeEach(module(function ($provide) {
                        MockFoo = function () {};
                        $provide.value('foo', MockFoo);
                    }));

                    it('should generate a factory based on $injector.', inject(function (ClApi, ClApiAbstractService)  {

                        var api = new ClApi();

                        var factory = 'foobar';

                        api.service('foo', factory);

                        var service = api.service('foo');

                        expect(service).toBe(MockFoo);
                    }));
                });

                describe('and argument is a function', function ()  {

                    it('should store the function as factory to the service.', inject(function (ClApi)  {

                        var api = new ClApi();

                        var factory = jasmine.createSpy('factory');
                        factory.and.returnValue('bar');

                        api.service('foo', factory);

                        var service = api.service('foo');

                        expect(factory).toHaveBeenCalled();

                        expect(service).toBe('bar');
                    }));
                });
            });

            describe('when a single argument is provided', function () {

                describe('and the service is unknown', function () {

                    it('should throw an exception.', inject(function (ClApi)  {

                        var api = new ClApi();

                        expect(function () {
                            api.service('foo');
                        }).toThrow(new Error('Unknown service "foo".'));
                    }));
                });

                describe('and the service is known', function () {

                    it('should invoke the factory only once.', inject(function (ClApi)  {

                        var api = new ClApi();

                        var foo = {
                            execute: function execute() {}
                        };
                        var fooFactory = jasmine.createSpy('fooFactory');
                        fooFactory.and.returnValue(foo);

                        api.service('foo', fooFactory);

                        var service = api.service('foo');
                        expect(fooFactory.calls.count()).toBe(1);

                        // should return the cached instance
                        expect(api.service('foo')).toBe(foo);
                        // and not invoke the factory again
                        expect(fooFactory.calls.count()).toBe(1);
                    }));
                });
            });
        });
    });
});
