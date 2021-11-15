module.exports = function (grunt) {

	"use strict";

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		meta: {
			banner: "/*!\n * <%= pkg.name %>\n * <%= pkg.description %>\n * @version <%= pkg.version %> - <%= grunt.template.today(\'yyyy-mm-dd\') %>\n * @author <%= pkg.author.name %> <<%= pkg.author.url %>>\n */\n"
		},
		jshint: {
			all: ["lib/*.js"]
		},
		watch: {
			scripts: {
				files: ["lib/*.js"],
				tasks: ["jshint"]
			}
		}
	});

	// Load grunt tasks from npm packages
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

	// Default task.  Run 'grunt' to lint JS (for now... may do something cooler later).
	grunt.registerTask("default", ["jshint"]);

	// Lint all JavaScript files
	grunt.registerTask("lint", ["jshint"]);

};
