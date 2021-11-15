var fs = require('nota-bene')
fs.setStorage(window.TEMPORARY)
var charName = document.getElementById('charName');
var charAlias = document.getElementById('charAlias')
var charBio = document.getElementById('charBio');
var charPicker = document.getElementById('charPicker')
var picList = document.getElementById('avatars')
var charSave = document.getElementById('charSave')

var picFiles = []

charSave.addEventListener('click', function(e){
    var name = charName.value
    var alias = charAlias.value.length ? charAlias.value : charName.value
    var bio = charBio.value
    var avatars = picFiles;
    console.log(name, alias, bio, avatars)
})

charPicker.addEventListener('change', function(event){
    console.log(event)
    var files = event.target.files
    for(var i = 0; i < files.length; i++){
	var reader = new FileReader()
	picFiles.push(files[i])
	reader.onload = function(file){
	    var img = document.createElement('img')
	    img.src = file.target.result
	    picList.appendChild(img)    
	}
	reader.readAsDataURL(files[i])
    }
}, true)

module.exports = function(){}
