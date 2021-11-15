"use strict";

var request = require("request"),
	querystring = require("querystring"),
	settings = require("./settings");

function make_request(endpoint, data, callback) {

	if (typeof data === "function") {
		return make_request(endpoint, null, data);
	}

	var req = {
		uri: settings.BASE_URL + endpoint,
		method: (data ? "POST" : "GET"),
		headers: settings.HEADERS
	};

	if (data) {
		req.body = querystring.stringify(data);
	}

	request(req, handle_response(callback));
}

function handle_response(callback) {
	return function (error, response, body) {
		var code, message;
		if (response && response.statusCode > 400) {
			code = response.statusCode;
			message = "HTTP Error Code " + code + " was returned.";
		}
		if (body) {
			try {
				body = JSON.parse(body);
			} catch (e) {
				message = "Response from Vine API is malformed.";
			}
		} else {
			message = "No response from Vine API was received.";
		}

		if (code || message) {
			return callback({
				code: code,
				message: message
			}, null);
		} else {
			return callback(null, body.data);
		}
	};
}

module.exports = {

	login: function (username, password, callback) {

		username = username || process.env.VINE_USERNAME;
		password = password || process.env.VINE_PASSWORD;

		make_request("users/authenticate", {
			username: username,
			password: password
		}, function (error, response) {
			// Set session key for subsequent requests
            if (response === "") {
                callback(new Error("Username/password are incorrect."), null);
                return;
            }
			settings.HEADERS["vine-session-id"] = response.key;
			callback(error, response);
		});
	},

	settings: function (callback) {
		make_request("users/me", callback);
	},

	timeline: function (callback) {
		make_request("timelines/graph", callback);
	},

	popular: function (callback) {
		make_request("timelines/popular", callback);
	},

	promoted: function (callback) {
		make_request("timelines/promoted", callback);
	},

	tags: function (tag, callback) {
		make_request("timelines/tags/" + tag, callback);
	},

	search: function (query, callback) {
		make_request("users/search/" + query, callback);
	}
};
