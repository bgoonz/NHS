module.exports = function(el, prop){
    return document.defaultView.getComputedStyle(el).getPropertyValue(prop)
}
