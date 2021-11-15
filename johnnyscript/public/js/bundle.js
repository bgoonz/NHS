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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS91c2VyL2RldmVsb3BtZW50L2Jhcm4vam9obm55c2NyaXB0L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciB0YWdzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgdGFncy5sZW5ndGg7IGkrKyl7XG5cbiAgdmFyIHRhZyA9IHRhZ3NbaV07XG5cbiAgZm9yKHZhciBpaSA9IDA7IGlpIDwgdGFnLmNsYXNzTGlzdC5sZW5ndGg7IGlpKyspe1xuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRhZy5jbGFzc0xpc3RbaWldXG5cbiAgICAgIGNvbnNvbGUubG9nKGNsYXNzTmFtZSlcblxuICB9XG5cbn1cbiJdfQ==
;