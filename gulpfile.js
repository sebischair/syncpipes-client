/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are split into several files in the gulp directory
 *  because putting it all here was too long
 */

'use strict';

var gulp = require('gulp');
var wrench = require('wrench');
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'SyncPipes Client',
  description: 'SyncPipes client as a windows service.',
  script: 'app.js'
});

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('install:service', ['build'], function () {
  // Listen for the "install" event, which indicates the
  // process is available as a service.
  svc.on('install',function(){
    svc.start();
  });

  svc.on('alreadyinstalled',function(){
    console.log('This service is already installed.');
  });

  svc.on('start',function(){
    console.log(svc.name+' started!\nVisit http://127.0.0.1:3000 to see it in action.');
  });

  svc.install();
});

gulp.task('uninstall:service', ['build'], function () {
  // Listen for the "uninstall" event so we know when it's done.
  svc.on('uninstall',function(){
    console.log('Uninstall complete.');
    console.log('The service exists: ',svc.exists);
  });

  // Uninstall the service.
  svc.uninstall();
});
