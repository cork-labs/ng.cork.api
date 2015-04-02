describe('ng.cork.api.client', function () {
    'use strict';

    beforeEach(module('ng.cork.api.client'));

    describe('CorkApiClient', function () {

        describe('service()', function () {

            describe('when an invalid service name is provided', function () {

                it('should throw an error.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    expect(function () {
                        api.service(null);
                    }).toThrow(new Error('Invalid service name.'));
                }));
            });

            describe('when a second argument is provided', function () {

                it('should return the api instance.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    expect(api.service('foo', function () {})).toBe(api);
                }));

                it('should throw an exception if the service was registered before.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    api.service('foo', function () {});

                    expect(function () {
                        api.service('foo', function () {});
                    }).toThrow(new Error('Service "foo" is already registered.'));
                }));

                it('should throw an exception if argument is not an object or a function.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    expect(function () {
                        api.service('foo', []);
                    }).toThrow(new Error('Invalid factory or configuration for service "foo".'));
                }));

                it('should throw an exception if options is null.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

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

                    it('should generate a factory based on $injector.', inject(function (CorkApiClient)  {

                        var api = new CorkApiClient();

                        var factory = 'foobar';

                        api.service('foo', factory);

                        var service = api.service('foo');

                        expect(service).toBe(MockFoo);
                    }));
                });

                describe('and argument is a function', function ()  {

                    it('should store the function as factory to the service.', inject(function (CorkApiClient)  {

                        var api = new CorkApiClient();

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

                    it('should throw an exception.', inject(function (CorkApiClient)  {

                        var api = new CorkApiClient();

                        expect(function () {
                            api.service('foo');
                        }).toThrow(new Error('Unknown service "foo".'));
                    }));
                });

                describe('and the service is known', function () {

                    it('should invoke the factory only once.', inject(function (CorkApiClient)  {

                        var api = new CorkApiClient();

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
