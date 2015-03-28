describe('ng.cl.api', function () {
    'use strict';

    beforeEach(module('ng.cl.api'));

    describe('ClApi', function () {

        describe('extend', function () {

            describe('when the same object is provided as source and destination', function () {

                it('should NOT modify destination.', inject(function (ClApi)  {

                    var data = {
                        foo: 'bar',
                        baz: 'qux'
                    };
                    var copy = angular.copy(data);

                    ClApi.extend(data, data);

                    expect(data).toEqual(copy);
                }));
            });

            describe('when two different objects are provided', function () {

                it('should merge/override data with the provided properties.', inject(function (ClApi)  {

                    var data = {
                        foo: 'bar',
                        baz: 'qux'
                    };
                    var extend = {
                        foo: 'quux',
                        quuux: 'corge'
                    };

                    ClApi.extend(data, extend);

                    expect(data.foo).toBe('quux');
                    expect(data.baz).toBe('qux');
                    expect(data.quuux).toBe('corge');
                }));

                it('modifying the source data after extending should NOT affect the destination object.', inject(function (ClApi) {

                    var data = {};
                    var extend = {
                        id: 42,
                        foo: 'bar',
                        baz: {
                            qux: 'quux' // makes sure it is a deep copy
                        }
                    };

                    ClApi.extend(data, extend);

                    extend.id++;
                    extend.foo = 'baz';
                    extend.baz = 'quux';

                    expect(data.id).toBe(42);
                    expect(data.foo).toBe('bar');
                    expect(data.baz.qux).toBe('quux');
                }));

                it('should re-initialize existing non-object properties of the instance if overriding those with Object values.', inject(function (ClApi) {

                    var data = {
                        foo: ''
                    };
                    var extend = {
                        id: 42,
                        foo: {
                            bar: 'baz'
                        }
                    };

                    ClApi.extend(data, extend);

                    expect(data.id).toBe(42);
                    expect(angular.isObject(data.foo)).toBeTruthy();
                    expect(angular.isArray(data.foo)).toBeFalsy();
                    expect(data.foo.bar).toBe('baz');
                }));

                it('should copy Date properties.', inject(function (ClApi) {

                    var data = {
                        foo: ''
                    };
                    var extend = {
                        date: new Date()
                    };

                    ClApi.extend(data, extend);

                    expect(data.date).toEqual(extend.date);
                    expect(data.date).not.toBe(extend.date);
                }));

                it('should copy Regexp properties.', inject(function (ClApi) {

                    var data = {
                        foo: ''
                    };
                    var extend = {
                        regexp: /foobar/g
                    };

                    ClApi.extend(data, extend);

                    expect(data.regexp).toEqual(extend.regexp);
                    expect(data.regexp).not.toBe(extend.regexp);
                }));

                it('should re-initialize existing non-object properties of the instance if overriding those with Array values.', inject(function (ClApi) {

                    var data = {
                        foo: ''
                    };
                    var extend = {
                        id: 42,
                        foo: [
                            'bar'
                        ]
                    };

                    ClApi.extend(data, extend);

                    expect(data.id).toBe(42);
                    expect(angular.isArray(data.foo)).toBeTruthy();
                    expect(data.foo).toEqual(['bar']);
                }));

                it('should re-initialize existing Array properties of the instance if overriding then with Object values.', inject(function (ClApi) {

                    var data = {
                        foo: []
                    };
                    var extend = {
                        id: 42,
                        foo: {
                            bar: 'baz'
                        }
                    };

                    ClApi.extend(data, extend);

                    expect(data.id).toBe(42);
                    expect(angular.isObject(data.foo)).toBeTruthy();
                    expect(angular.isArray(data.foo)).toBeFalsy();
                    expect(data.foo.bar).toBe('baz');
                }));

                it('should re-initialize existing Object properties of the instance if overriding then with Array values.', inject(function (ClApi) {

                    var data = {
                        foo: {}
                    };
                    var extend = {
                        id: 42,
                        foo: [
                            'bar'
                        ]
                    };

                    ClApi.extend(data, extend);

                    expect(data.id).toBe(42);
                    expect(angular.isArray(data.foo)).toBeTruthy();
                    expect(data.foo).toEqual(['bar']);
                }));
            });
        });
    });
});
