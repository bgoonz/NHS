# node-vine

[![Dependencies Status](https://david-dm.org/mstuart/node-vine.png)](https://david-dm.org/mstuart/node-vine)
[![DevDependencies Status](https://david-dm.org/mstuart/node-vine/dev-status.png)](https://david-dm.org/mstuart/node-vine#info=devDependencies)

  Vine API for node.js
[![Analytics](https://ga-beacon.appspot.com/UA-46813537-1/node-vine?pixel)](https://github.com/mstuart/node-vine)
## About

  The Vine API is undocumented and not publicly available.  However, it has a lot of great content.  I noticed that there are a few python wrappers, so I wanted to create a node.js one.  I also plan to do a few mobile web experiments with the Vine API, so this will come in handy for my next project.  Have fun!

## Install

```
npm install node-vine
```
  
## API

  All of Vine's API calls are authenticated, so you'll need to login first.  You can add VINE_USERNAME and VINE_PASSWORD to your environment variables to hide them from being passed in the clear.

### .login(username, password[, callback(err, response)])

  Only supports e-mail address authentication. Twitter OAuth authentication to come later.
  
```js
vine.login("testuser@test.com", "p@ssw0rd", function(err, response) {
  // Logged in!  Now you can use any other authenticated API... Like fetching your timeline or the most popular videos.
});
```
### .timeline([ callback(err, response)])

  Returns a user's timeline
  
```js
vine.timeline(function(err, response) {
  // response contains a list of Vines in your timeline
});
```

### .popular([ callback(err, response)])

  Returns a list of the most popular Vines

```js
vine.popular(function(err, response) {
  // response contains a list the most popular Vines
});
```

### .promoted([ callback(err, response)])

  Returns a list of promoted Vines
  
```js
vine.promoted(function(err, response) {
  // response contains a list of promoted Vines
});
```

### .tags(query[, callback(err, response)])

  Performs a search for Vines with an associated tag
  
```js
vine.tags("lolcats", function(err, response) {
  // response contains a list of lolcats Vines
});
```

### .search(query[, callback(err, response)])

  Performs a search for Vine users
  
```js
vine.search("dave", function(err, response) {
  // response contains a list of Vine users matching "dave"
});
```

### .settings([ callback(err, response)])

  Returns a user's settings
  
```js
vine.settings(function(err, response) {
  // response contains a user's Vine account settings
});
```

## Notes

  Inspired by [vino](https://github.com/starlock/vino), a python app that displays a wall of popular Vines.

## License

  MIT
