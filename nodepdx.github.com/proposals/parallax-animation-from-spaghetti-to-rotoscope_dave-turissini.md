# Parallax Animations: From Spaghetti to Rotoscope

- Speaker: David Turissini
- Available: Apr 20-21
- Length: 30 mins

## Description

UI Engineering has always blended the line between development and design, and nowhere is this more evident with parallax. The basic implementation of parallax is simple: listen to scroll events and move an element. All too often though, implementations quickly spiral out of control and become a big giant mess of spaghetti. Maintenance becomes a nightmare and we can forgot about being able to safely adjust and move our carefully crafted animations.

We need a solution that allows us to engineer animation code that is DRY, testable and bit size. Further, we need a solution that allows us to compose simple animations into something much larger and compellng. How can we do this?

Introducing Rotoscope, a very lightweight and opinionated library designed specifically to solve the problem of out of control parallax code. With Rotoscope, you can build beautiful and complex animations in a way that doesn't violate our engineering sensibilities: DRY, flexible and testable.  It -requires- timeline based animations so that you can compose very complex parallax animations from the simpliest of drawings. The performant update-draw render cycle at any given frame guarantees that performance will be maintained even as animations become more and more complex.

## Bio

Dave loves to animation things! He has been working with the web since the <font> tag was bleeding edge technology, and ever since then has strived to push the limits of what can be done in the browser. When not animating DOM nodes, Dave can probably be found in a coffee shop or out on the hiking trail.

## Links

- Twitter: @daveturissini
- Github: github.com/davidturissini
- Rotoscope demo: http://turissinitechnologies.github.io/rotoscope/
