#!/usr/bin/env node 
var vargs = require('minimist')(process.argv.slice(2))
var dir = process.cwd()
var swurve = require('./')
swurve(dir, vargs) 
