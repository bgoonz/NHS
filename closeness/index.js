module.exports = function(num, dist){
	return function(val){
		return (Math.abs(num - val) < dist)
	}
};