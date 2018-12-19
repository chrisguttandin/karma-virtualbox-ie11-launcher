/* eslint-disable unicorn/filename-case */
const chai = require('chai');
const sinonChai = require('sinon-chai');

module.exports = {
    test: {
        options: {
            bail: true,
            clearRequireCache: true,
            require: [
                () => chai.use(sinonChai),
                () => global.expect = chai.expect
            ]
        },
        src: [
            'test/unit/**/*.js'
        ]
    }
};
