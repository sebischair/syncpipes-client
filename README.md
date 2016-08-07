#SyncPipes Client

## Requirements

* [node.js & npm](https://nodejs.org/en/)
* [bower](https://bower.io/)
`npm install -g bower`
* [gulp](http://gulpjs.com/)
`npm install --global gulp-cli`

## Installation & Running

Run the following commands on your terminal inside the root directory of the project.

* `npm install`
* `bower install`
* `gulp serve`

The last command should open a tab inside you default browser, serving the application. If not check the output of the command to find out the current address of the application.

The application expects the server to be running at `http://localhost:3010`. If you changed the address of the API then use button on the rightmost position of the navigation bar on the top to change the API address.

## Buildung for Production

If not already executed, run the following commands:

* `npm install`
* `bower install`

Invoke the default gulp task by running `gulp`.

After the command has finished the production version of the application has been build. You can copy the contents of `dist/` to your web server.
