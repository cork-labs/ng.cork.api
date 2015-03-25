describe('ng.cl.api', function () {
    'use strict';

    beforeEach(module('ng.cl.api'));

    describe('ClApi', function () {

        describe('constructor', function () {

            it('should create instances with the expected defaults.', inject(function (ClApi)  {

                var api = new ClApi();

                expect(api.baseUrl).toEqual('/');
            }));

        });

        describe('baseUrl', function () {

            it('should default to "/".', inject(function (ClApi)  {

                var api = new ClApi();

                expect(api.baseUrl).toEqual('/');
            }));

            it('should be set to the path provided to constructor', inject(function (ClApi)  {

                var config = {
                    baseUrl: '/foo/'
                };

                var api = new ClApi(config);

                expect(api.baseUrl).toEqual('/foo/');
            }));

            it('should always have a trailing slash appended', inject(function (ClApi)  {

                var config = {
                    baseUrl: '/foo'
                };

                var api = new ClApi(config);

                expect(api.baseUrl).toEqual('/foo/');
            }));

            it('should ensure the trailing slash even when config has an empty baseUrl', inject(function (ClApi)  {

                var config = {
                    baseUrl: null
                };

                var api = new ClApi(config);

                expect(api.baseUrl).toEqual('/');
            }));
        });
    });
});
