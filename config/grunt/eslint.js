const grunt = require('grunt');

module.exports = {
    config: {
        options: {
            configFile: 'config/eslint/config.json',
            fix: grunt.option('fix'),
            reportUnusedDisableDirectives: true
        },
        src: [ '*.js', 'config/**/*.js' ]
    },
    src: {
        options: {
            configFile: 'config/eslint/src.json',
            fix: grunt.option('fix'),
            reportUnusedDisableDirectives: true
        },
        src: [ 'src/**/*.js' ]
    },
    test: {
        options: {
            configFile: 'config/eslint/test.json',
            fix: grunt.option('fix'),
            reportUnusedDisableDirectives: true
        },
        src: [ 'test/**/*.js' ]
    }
};
