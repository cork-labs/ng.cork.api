describe('ng.cork.api.client', function () {
    'use strict';

    beforeEach(module('ng.cork.api.client'));

    describe('CorkApiClient', function () {

        describe('constructor', function () {

            it('should create instances with the expected defaults.', inject(function (CorkApiClient)  {

                var api = new CorkApiClient();

                expect(api.baseUrl).toEqual('/');
            }));

        });

        describe('baseUrl', function () {

            it('should default to "/".', inject(function (CorkApiClient)  {

                var api = new CorkApiClient();

                expect(api.baseUrl).toEqual('/');
            }));

            it('should be set to the path provided to constructor', inject(function (CorkApiClient)  {

                var config = {
                    baseUrl: '/foo/'
                };

                var api = new CorkApiClient(config);

                expect(api.baseUrl).toEqual('/foo/');
            }));

            it('should always have a trailing slash appended', inject(function (CorkApiClient)  {

                var config = {
                    baseUrl: '/foo'
                };

                var api = new CorkApiClient(config);

                expect(api.baseUrl).toEqual('/foo/');
            }));

            it('should ensure the trailing slash even when config has an empty baseUrl', inject(function (CorkApiClient)  {

                var config = {
                    baseUrl: null
                };

                var api = new CorkApiClient(config);

                expect(api.baseUrl).toEqual('/');
            }));
        });
    });
});
