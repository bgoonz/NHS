var id = 'parametricCSS'
var n = 0

module.exports = function(css, id){
    var es = document.getElementById(id);
    if(!id) id = id + (n++)

    if(es){
        return false
    }
    else{
        var styleSheet = makeStyle(css, id)
        document.head.insertBefore(styleSheet, document.head.childNodes[0]);
        return true
    }

}


function makeStyle(str, id){
    var style = document.createElement('style');
    style.id = id || '';
    style.textContent = str;
    return style
}
