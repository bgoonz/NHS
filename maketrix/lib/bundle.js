var es = require('event-stream')
  , thru = require('through')
  , gridMap = require('./grid-map')
  , createContext = require('./spherical-context')
  ;

createContext(700, 700)
