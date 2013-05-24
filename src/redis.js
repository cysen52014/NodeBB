(function(RedisDB) {
	var PRODUCTION = false,
		ERROR_LOGS = true,

		redis = require('redis'),
		config = require('../config.js'),
		utils = require('./../public/src/utils.js');
	

	RedisDB.exports = redis.createClient(config.redis.port, config.redis.host, config.redis.options);

	RedisDB.exports.handle = function(error) {
		if (error !== null) {
			if (PRODUCTION === false) {
				console.log("################# ERROR LOG ####################");
				console.log(error);
				console.log(arguments.callee.name);
				console.log("################# ERROR LOG ####################");
				throw new Error('RedisDB Error: ' + error);
			} else if (ERROR_LOGS === true) {
				console.log('RedisDB Error: ' + error);
			}
		}
	}


	/*
	* A possibly more efficient way of doing multiple sismember calls
	*/
	RedisDB.exports.sismembers = function(key, needles, callback) {
		var tempkey = key + ':temp:' + utils.generateUUID();
		RedisDB.exports.sadd(tempkey, needles, function() {
			RedisDB.exports.sinter(key, tempkey, function(err, data) {
				RedisDB.exports.del(tempkey);
				callback(err, data);
			});
		});
	};

	/*
	* A lot of redis calls come back like this:
	* [key, value, key, value, key, value]
	* this is a simple utility fn to turn this into an object.
	*/
	RedisDB.exports.objectify = function(arr) {
		var obj = {};
		for (var i = 0; i < arr.length; i += 2) {
		    obj[arr[i]] = arr[i+1];
		}
		return obj;
	};

	/*
	* Similar to .objectify, this utility function splits the data array into two arrays
	*/
	RedisDB.exports.splitify = function(arr) {
		var arr1 = [], arr2 = [];
		for (var i = 0; i < arr.length; i += 2) {
		    arr1.push(arr[i]);
		    arr2.push(arr[i+1]);
		}
		return [arr1,arr2];
	};

}(module));