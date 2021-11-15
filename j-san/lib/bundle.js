var json = require('./sample.config.json');
var util = require('util');
util.isArray = Array.isArray;
util.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
util.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};
var clone = require('clone');
var mouseAround = require('mouse-around');
var traverse = require('traverse');
var div = document.getElementById('json');
var tenants = document.getElementById('tenants');
var container = document.getElementById('container');
var hoverbot = document.getElementById('hoverbot');


var parent;
var path = [];

JSON = clone(json);

function save(evt){
	JSON = clone(json)
	init(JSON, tenants)
}

var current_keyup_listener;
function init(obj, el){
	if('string' == typeof obj || 'number' == typeof obj) {
		addNode(obj);
	}
	else {
		traverse(obj).forEach(function(x){		
			if(this.isRoot) return;
			if(el.classList.contains('array')){
				if(this.level < 2){
					var node = document.createElement('div');
					node.classList.add('cursor')
					node.textContent = (this.isLeaf ? this.node : type(obj[this.key]));
					node._data = this.isLeaf ? null : obj[this.key];
					node._meta = this;
					node._path = [];
					node._node = x;
					node.addEventListener('click', tenantOnClick, false)
					el.appendChild(node);
				}
				return
			}
			if(this.level < 2){	
				var node = document.createElement('div');
				node.classList.add('cursor')			
				node.textContent = this.key ;
				node._data = obj[this.key];
				node._meta = this;
				node._path = [];
				node._node = x;
				node.addEventListener('click', tenantOnClick, true)
				el.appendChild(node);
				return				
			}
		});
	}
	
	function addNode(str){
		var node = document.createElement('div');
		node.classList.add('cursor');		
		node.appendChild(document.createTextNode(str));
		node._data = null;
		node._meta = {isLeaf: true};
		node._path = [];
		node._node = null;
		node.addEventListener('click', tenantOnClick, true);
		console.log(node)
		el.appendChild(node);
		return
	}
	
	var menu = document.createElement('div');
	menu.classList.add('menu');
	el.appendChild(menu)
};

init(json, tenants);

function tenantOnClick(e){
	var node = e.target;
	node.appendChild(edit)
	if(!node._data) return;
	
	sibling(node.parentNode);
	var className = Array.isArray(node._data) ? 'array' : typeof node._data ;
	var div = adiv(className);
	container.appendChild(div);
	node._path.push(div);
	init(node._data, div);
};

function sibling(parent){
	var sibs = Array.prototype.slice.call(parent.children);
	if(sibs.length){
		sibs.forEach(function(e){
			followPath(e)
		})		
	}
};

function followPath(el){
	if(el._path && el._path.length){
		var node = el._path.pop();
		sibling(node);
		container.removeChild(node);
	}
};

function adiv(c){
	var node = document.createElement('div');
	node.classList.add(c);
	return node
};

function displayParams(node){
	var arr = Array.prototype.slice.call(node.children);
	arr.forEach(function(e){
		node.removeChild(e)
	});	
};


/*
function init(){
	traverse(json).forEach(function(x){
		if(this.isRoot) return;
		if(this.notLeaf) {
			this.before(before);
			this.post(after);
			return
		};
		if(this.isLeaf){
			var div = document.createElement('p');
			div.classList.add('child');
			div.textContent = this.key + ' : ' + x;
			parent.appendChild(div)
			return
		}

	})	
}

init();

function before(x){
	this._length = this.keys.length
	level = this.level;

	var node = document.createElement('div');
	node.setAttribute('tabindex', ++tab)
	var className = Array.isArray(x) ? 'array' : typeof x ;
	var h1 = document.createElement('div');
	h1.classList.add('key')
	h1.text = h1.text || h1.textContent;
	h1.textContent = this.key + ' : ' + type(className);
	node.appendChild(h1)
	node.classList.add(className);
	parent.appendChild(node);
	parent = node;
	this.el = node;
}

function after(x){
	if(--this._length == 0) {
		parent = parent.parentNode
	}
}	
*/

function type(x){
	var x = Array.isArray(x) ? 'array' : typeof x ;	
	if(x == 'array') return '[ Array ]';
	if(x == 'object') return '{ Object }';
	if(x == 'string') return '"string"';
	if(x == 'number') return 'number';
	if(x == 'function') return 'fn( ... )'
}
