var tags = document.getElementsByTagName('*')

for(var i = 0; i < tags.length; i++){

  var tag = tags[i];

  for(var ii = 0; ii < tag.classList.length; ii++){

    var className = tag.classList[ii]

      console.log(className)

  }

}
