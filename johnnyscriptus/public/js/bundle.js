;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var tags = document.getElementsByTagName('*')

for(var i = 0; i < tags.length; i++){

  var tag = tags[i];

  for(var ii = 0; ii < tag.classList.length; ii++){

    var className = tag.classList[ii]

      console.log(className)

  }

}

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL2RldmVsb3BtZW50L2Jhcm4vam9obm55c2NyaXB0LnVzL2pvaG5ueXNjcmlwdC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdGFncyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCcqJylcblxuZm9yKHZhciBpID0gMDsgaSA8IHRhZ3MubGVuZ3RoOyBpKyspe1xuXG4gIHZhciB0YWcgPSB0YWdzW2ldO1xuXG4gIGZvcih2YXIgaWkgPSAwOyBpaSA8IHRhZy5jbGFzc0xpc3QubGVuZ3RoOyBpaSsrKXtcblxuICAgIHZhciBjbGFzc05hbWUgPSB0YWcuY2xhc3NMaXN0W2lpXVxuXG4gICAgICBjb25zb2xlLmxvZyhjbGFzc05hbWUpXG5cbiAgfVxuXG59XG4iXX0=
;