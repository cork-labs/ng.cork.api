describe('ng.cork.api.client', function () {
    'use strict';

    beforeEach(module('ng.cork.api.client'));

    describe('CorkApiClient', function () {

        describe('middleware()', function () {

            it('should throw an exception if first argument is not a string.', inject(function (CorkApiClient)  {

                var api = new CorkApiClient();

                expect(function () {
                    api.middleware(false);
                }).toThrow(new Error('Invalid middleware name.'));
            }));

            describe('when two arguments are provided', function () {

                it('should throw an exception if second argument is neither Array or Function.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    expect(function () {
                        api.middleware('foo', false);
                    }).toThrow(new Error('Invalid middleware "foo".'));
                }));

                it('should return the api instance.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    expect(api.middleware('foo', function () {})).toBe(api);
                }));

                it('should throw an exception if middleware is already registered.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();
                    api.middleware('foo', function () {});

                    expect(function () {
                        api.middleware('foo', function () {});
                    }).toThrow(new Error('Middleware "foo" is already registered.'));
                }));

                describe('and second argument is an array', function () {

                    it('should throw an exception if last element of last element of the array is not a function.', inject(function (CorkApiClient)  {

                        var api = new CorkApiClient();

                        expect(function () {
                            api.middleware('foo', ['bar', 'baz']);
                        }).toThrow(new Error('Invalid middleware "foo".'));
                    }));
                });
            });

            describe('when one argument is provided', function () {

                it('should return the api instance.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    expect(api.middleware('foo', function () {})).toBe(api);
                }));

                it('should throw an exception if middleware is unknown.', inject(function (CorkApiClient)  {

                    var api = new CorkApiClient();

                    expect(function () {
                        api.middleware('foo');
                    }).toThrow(new Error('Unknown middleware "foo".'));
                }));

                it('should return the middleware.', inject(function (CorkApiClient)  {

                    var fn = function () {};

                    var api = new CorkApiClient();
                    api.middleware('foo', fn);

                    var middleware = api.middleware('foo');

                    expect(middleware).toBe(fn);
                }));
            });
        });
    });
});
