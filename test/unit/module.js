const virtualBoxIE11Launcher = require('../../src/module.js');

describe('karma-virtualbox-ie11-launcher', () => {

    it('should export the launcher', () => {
        expect(virtualBoxIE11Launcher['launcher:VirtualBoxIE11']).to.not.be.undefined;
    });

});
