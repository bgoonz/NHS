var quotemeta = require('quotemeta');
var through = require('through');
var trumpet = require('trumpet');
var url = require('url');
var qs = require('querystring');
var ent = require('ent');
var split = require('split');
var combine = require('stream-combiner');

module.exports = Tabby;

function Tabby (containerFn) {
    if (!(this instanceof Tabby)) return new Tabby(containerFn);
    this._routes = [];
    this._groups = [];
    this._regexp = { test: function () { return false } };
    this._containerFn = containerFn || function () {};
}

Tabby.prototype._recreateRegexp = function () {
    var self = this;
    self._groups = [];
    var parts = self._routes.map(function (r) {
        var groups = [];
        var pattern = ('(' + quotemeta(r.pattern) + ')')
            .replace(/\\:([\w-]+)/g, function (_, x) {
                groups.push(x);
                return '([\\w-]+)';
            })
        ;
        self._groups.push({
            route: r,
            groups: groups
        });
        
        return pattern;
    });
    self._regexp = RegExp(
        '^(?:' + parts.join('|') + ')'
        + '(\.(?:json|html))?(?:[/?#]|$)'
    );
};

Tabby.prototype.add = function (pattern, route) {
    if (pattern && typeof pattern === 'object') {
        route = pattern;
    }
    else {
        route.pattern = pattern;
    }
    route.data = (function (dataFn) {
        if (!dataFn) return null;
        return function (params) {
            var st = dataFn.call(route, params, function (err, res) {
                if (err) return st.emit('error', err);
                st.queue(res);
                st.queue(null);
            });
            if (!st) st = through();
            return st;
        };
    })(route.data);
    
    var parts = pattern.split('/').slice(1);
    
    (function (routes) {
        for (var i = 0; i < routes.length; i++) {
            var rparts = routes[i].pattern.split('/').slice(1);
            
            for (var j = 0; j < parts.length; j++) {
                var a = /:[\w-]+/.test(parts[j]);
                var b = /:[\w-]+/.test(rparts[j]);
                
                if (!a && b) {
                    return routes.splice(i, 0, route);
                }
                if (!a && !b
                && (!rparts[j] || parts[j].length < rparts[j].length)) {
                    return routes.splice(i, 0, route);
                }
                if (a && rparts[j] === undefined) {
                    return routes.splice(i, 0, route);
                }
            }
        }
        if (i === routes.length) routes.push(route);
    })(this._routes);
    
    this._recreateRegexp();
};

Tabby.prototype.test = function (req) {
    if (req && typeof req === 'object') {
        if (req.method !== 'GET') return false;
        return this._regexp.test(req.url);
    }
    return this._regexp.test(req);
};

Tabby.prototype._match = function (href) {
    var m = this._regexp.exec(href);
    var vars = {};
    var route;
    
    for (var i = 0, j = 1; i < this._groups.length; i++) {
        var g = this._groups[i];
        if (m[j] !== undefined) {
            route = g.route;
            for (var k = 0; k < g.groups.length; k++) {
                vars[g.groups[k]] = m[j + k + 1];
            }
            break;
        }
        j += 1 + g.groups.length;
    }
    if (!route) return undefined;
    var ext = m[m.length - 1];
    
    var params = qs.parse((url.parse(href).search || '').replace(/^\?/, ''));
    Object.keys(vars).forEach(function (key) {
        params[key] = vars[key];
    });
    return { route: route, vars: vars, ext: ext, params: params };
};

Tabby.prototype.handle = function (req, res) {
    var self = this;
    var m = this._match(req.url);
    if (!m) {
        res.statusCode = 404;
        res.end('not found\n');
        return;
    }
    var route = m.route, vars = m.vars, ext = m.ext;
    var params = m.params;
    
    
    if (ext === '.json') {
        res.setHeader('content-type', 'application/json');
        if (!route.data) {
            res.statusCode = 404;
            res.end('no data for this route\n');
            return;
        }
        route.data(params).pipe(through(function (row) {
            if (typeof row === 'string' || Buffer.isBuffer(row)) {
                this.queue(row);
            }
            else {
                // TODO: inline nested streams
                this.queue(JSON.stringify(row) + '\n');
            }
        })).pipe(res);
    }
    else if (ext === '.html') {
        res.setHeader('content-type', 'text/html');
        params.live = false;
        if (route.data) {
            route.data(params).pipe(route.render(params)).pipe(res);
        }
        else route.render(params).pipe(res);
    }
    else {
        res.setHeader('content-type', 'text/html');
        var tr = trumpet();
        var hs = tr.createStream('head');
        hs.pipe(through(null, function () {
            this.queue('<meta type="tabby-regex" value="'
                + ent.encode(self._regexp.source)
                + '">\n'
            );
            this.queue('<meta type="tabby-live" value="'
                + JSON.stringify(self._routes.filter(function (x) {
                    return x.live
                }))
                + '">\n'
            );
            this.queue(null);
        })).pipe(hs);
        
        params.live = false;
        var st = this._containerFn(route, params);
        if (!st) st = through();
        
        var rx = route.render(params);
        rx.pipe(st).pipe(tr).pipe(res);
        if (route.data) route.data(params).pipe(rx);
    }
};

Tabby.prototype.createStream = function () {
    var self = this;
    var current = null;
    return combine(split(), through(write));
    
    function write (line) {
        var tr = this;
        try { var row = JSON.parse(line) }
        catch (err) { return }
        if (!Array.isArray(row)) return;
        var seq = row[0];
        
        if (row[1] === 'get') {
            var m = self._match(row[2]);
            if (!m) return tr.queue(seq + ' 404\n');
            
            var out = through(function (buf) {
                var str = Buffer.isBuffer(buf) ? buf.toString('utf8') : buf;
                tr.queue(JSON.stringify([ seq, str ]) + '\n');
            }, end);
            
            function end () {
                tr.queue(JSON.stringify([ seq ]) + '\n');
            }
            
            var rx = m.route.render(m.params);
            rx.pipe(out);
            if (m.route.data) m.route.data(m.params).pipe(rx);
        }
    }
};
