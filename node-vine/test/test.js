"use strict";

var assert = require("assert"),
	vine = require("../lib/vine.js");

describe("login", function () {

	var username = process.env.VINE_USERNAME,
		password = process.env.VINE_PASSWORD;

	it("should login via POST /users/authenticate", function (next) {
		vine.login(username, password, function (err, response) {
			assert.ok(!err);
            assert.ok(response.key);
			next();
		});
	});

	it("should read username and password from environment variables", function (next) {
		vine.login(null, null, function (err, response) {
			assert.ok(!err);
			assert.ok(response.key);
			next();
		});
	});

	it("should read password from environment variables", function (next) {
		vine.login(username, null, function (err, response) {
			assert.ok(!err);
			assert.ok(response);
			next();
		});
	});

	it("should read username from environment variables", function (next) {
		vine.login(null, password, function (err, response) {
			assert.ok(!err);
			assert.ok(response);
			next();
		});
	});

	it("should fail if wrong username is entered", function (next) {
		vine.login("aSasdfjaiosdfja!asdfasDafsasdf", password, function (err, response) {
			assert.ok(err.message === "Username/password are incorrect.");
			assert.ok(!response);
			next();
		});
	});

	it("should fail if wrong password is entered", function (next) {
		vine.login(username, "asdf!!f1jf1Qsdfasd@`casf", function (err, response) {
            assert.ok(err.message === "Username/password are incorrect.");
			assert.ok(!response);
			next();
		});
	});
});
