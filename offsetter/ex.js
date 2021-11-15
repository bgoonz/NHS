var offset = require('./')([500,500]) // sets the new [0,0] to [500,500] the page
                                      // ie. offset([window.innerWidth / 2, window.innerHeight])

// test centering at the new [0,0] a supposed object that is height and width zero
console.log(offset([0,0], 0, 0))

// test position at [5,5], an item that is height and width 10
console.log(offset([5,5], 10, 10))
