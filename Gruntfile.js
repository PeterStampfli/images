module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jsdoc : {
        dist : {
            src: ['librarySource/*.js'], 
            dest: 'doc'
        }
    },


    jshint: {
      files: ['Gruntfile.js', 'librarySource/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('doc', ['jsdoc']);
  
  grunt.registerTask('hint', ['jshint']);

  grunt.registerTask('default', ['jshint']);

};
