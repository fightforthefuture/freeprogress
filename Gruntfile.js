module.exports = function (grunt) {
  "use strict";

  require('jit-grunt')(grunt, {
    'cachebreaker': 'grunt-cache-breaker'
  });

  var saveLicense = require('uglify-save-license');

  grunt.initConfig({
    site: {
      app: 'site',
      dist: 'public'
    },
    clean: {
      init: {
        files: [
          {
            dot: true,
            src: '<%= site.dist %>/*'
          }
        ]
      }
    },
    copy: {
      assets: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= site.app %>',
            src: [
              'images/**/*',
            ],
            dest: '<%= site.dist %>'
          }
        ]
      }
    },
    less: {
      build: {
        options: {
          compress: true,
          sourceMap: true
        },
        files: {
          '<%= site.dist %>/css/core.css': '<%= site.app %>/_less/core.less',
        }
      },
      server: {
        options: {
          compress: false,
          sourceMap: true
        },
        files: {
          '<%= site.dist %>/css/core.css': '<%= site.app %>/_less/core.less',
        }
      }
    },
    jekyll: {
      options: {
        bundleExec: true,
        config: '_config.yml',
        dest: '<%= site.dist %>',
        src: '<%= site.app %>'
      },
      build: {
        options: {
          config: '_config.yml,_config.build.yml'
        }
      },
      server: {
        options: {
          src: '<%= site.app %>'
        }
      },
      check: {
        options: {
          doctor: true
        }
      }
    },
    postcss: {
      build: {
        options: {
          map: true,
          lcessors: [
            require('autoprefixer')({browsers: 'last 2 versions'}),
            require('cssnano')()
          ]
        },
        files: [
          {
            expand: true,
            cwd: '<%= site.dist %>/css',
            src: '**/*.css',
            dest: '<%= site.dist %>/css'
          }
        ]
      }
    },

    concat: {
      options: {
        sourceMap: true,
      },
      scripts: {
        options: {
          process: function(src, filepath) {
            var url = process.env.URL || grunt.file.readYAML('_config.yml').url;
            return src.replace('{{SITE_URL}}', url);
          },
        },
        files: [
          {
            src: [
              '<%= site.app %>/_js/LICENSE',
              '<%= site.app %>/_js/admin/library/composer-1.1.12.min.js',
              '<%= site.app %>/_js/admin/library/util.js',
              '<%= site.app %>/_js/admin/library/api.js',
              '<%= site.app %>/_js/admin/controller/**/*.js',
              '<%= site.app %>/_js/admin/model/*.js',
              '<%= site.app %>/_js/admin/view/**/*.js',
              '<%= site.app %>/_js/admin.js'
            ],
            dest: '<%= site.dist %>/js/admin.js'
          },
          {
            src: [
              '<%= site.app %>/_js/LICENSE',
              '<%= site.app %>/_js/client.js'
            ],
            dest: '<%= site.dist %>/js/client.js'
          }
        ]
      }
    },

    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true,
        check: 'gzip',
        preserveComments: saveLicense
      },
      build: {
        files: {
          '<%= site.dist %>/js/client.js': '<%= site.dist %>/js/client.js',
          '<%= site.dist %>/js/admin.js': '<%= site.dist %>/js/admin.js',
        }
      }
    },
    nodemon: {
      server: {
        script: 'app/index.js',
        options: {
          ignore: ['node_modules/**', 'Gruntfile.js'],
          watch: ['app/'],
          delay: 1000,
          legacyWatch: true
        }
      }
    },

    watch: {
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['dev'],
        options: {
          reload: true
        }
      },
      less: {
        files: ['<%= site.app %>/_less/**/*.less'],
        tasks: ['less:server']
      },
      javascript: {
        files: [
          '<%= site.app %>/_js/**/*.js',
          '<%= site.app %>/_js/admin/*.js',
        ],
        tasks: ['concat:scripts', 'uglify']
      },
      assets: {
        files: [
          '<%= site.app %>/images/**/*',
        ],
        tasks: ['copy']
      },
      jekyll: {
        files: [
          '<%= site.app %>/**/*.{html,md}',
          '_config.*',
          '<%= site.app %>/_data/**/*.*'
        ],
        tasks: [
          'jekyll:server'
        ]
      }
    },
    cachebreaker: {
      deploy: {
        options: {
          match: [
            'core.js',
            'core.css'
          ]
        },
        files: {
          src: [
            '<%= site.dist %>/**/*.html',
          ]
        }
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      files: [
        'copy:assets',
        'jekyll:server',
        'less:server',
        'concat:scripts'
      ],
      servers: [
        'nodemon:server',
        'watch'
      ]
    }
  });

  grunt.registerTask('dev', [
    'clean:init',
    'concurrent:files',
    'concurrent:servers'
  ]);

  grunt.registerTask('build', [
    'clean:init',
    'jekyll:build',
    'copy:assets',
    'less:build',
    'postcss:build',
    'concat:scripts',
    'uglify:build',
    'cachebreaker:deploy'
  ]);

  grunt.registerTask('default', [
    'dev'
  ]);
};
