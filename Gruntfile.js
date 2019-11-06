module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            main: {
                nonull: true,
                src: 'tests/buttonTest.html',
                dest: 'library/buttonTest.html',



            },
        },

        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'library/output.css': ['tests/output.css']
                }
            }
        },

        htmlmin: { // Task
            test: { // Target
                options: { // Target options
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                },
                files: { // Dictionary of files
                    'library/buttonTest.html': ['tests/buttonTest.html'] // 'destination': 'source'
                }
            }
        },

        uglify: {
            library: {
                files: {
                    'library/library.js': ['librarySource/**/*.js']
                }
            }
        },

        concat: {
            options: {
                separator: ';',
            },
            library: {
                src: ['librarySource/**/*.js'],
                dest: 'library/library.js',
            },
        },

        jsbeautifier: {
            //files: ['Gruntfile.js', 'librarySource/**/*.js', 'geometricolor/**/*.js', 'extra/**/*.js', 'newKaleidoscopes/**/*.js', 'tests/**/*.js', 'ui/**/*.js', 'linz/**/*.js'],
            files: ['Gruntfile.js', 'libgui/**/*.js'],
            options: {}
        },

        jsdoc: {
            dist: {
                src: ['librarySource/**/*.js'],
                dest: 'doc'
            }
        },

        jshint: {
            //  files: ['Gruntfile.js', 'librarySource/**/*.js', 'geometricolor/**/*.js', 'extra/**/*.js', 'newKaleidoscopes/**/*.js', 'tests/**/*.js', 'ui/**/*.js', 'linz/**/*.js'],
            files: ['Gruntfile.js', 'libgui/**/*.js'],

            options: {
                "browser": true,
                "devel": true,
                "undef": true,
                // "unused": true,
                "esversion": 6,
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true,
                    "self": true
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('mini', ['uglify']);

    grunt.registerTask('beau', ['jsbeautifier']);

    grunt.registerTask('doc', ['jsdoc']);

    grunt.registerTask('hint', ['jshint']);

    grunt.registerTask('default', ['jshint']);

};
