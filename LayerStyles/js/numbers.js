var numbers = {
	regex: new RegExp(''),
	min: 0,
	max: 0,
	temporaryMode: "",
	match: false,
	pressed: false,
	speed: 0,
	value: "",
	type: "",
	direction: 0,
	DIGITS: /[-1234567890]/g,
	HEXCODE: /[A-Fa-f0-9]/g,
	initNumberField: function(input, type) {
		numbers.type = type;
		numbers.$input = $(input);
	    numbers.max = numbers.$input.attr('data-max');
	    numbers.min = numbers.$input.attr('data-min');
		numbers.restrict = numbers.DIGITS;
	    numbers.temporaryMode = numbers.$input.attr('id');
	    switch (numbers.max) {
	    case "100": // 0-100
	        numbers.regex.compile("^(0|([1-9]{1}[0-9]{0,1}|100))$");
	        break;
	    case "255": // 0-255
	        numbers.regex.compile("^(0|([1-9]{1}[0-9]{0,1}|[1]{1}[0-9]{0,2}|[2]{1}([0-4]{1}[0-9]{1}|[5]{1}[0-5]{1})))$");
	        break;
	    case "360": // 0-360
	        numbers.regex.compile("^(0|([1-9]{1}[0-9]{0,1}|[1-2]{1}[0-9]{0,2}|[3]{1}([0-5]{1}[0-9]{1}|[6]{1}[0]{1})))$");
	        break;
	    }
	},
	initHexField: function(input, type) {
		numbers.type = type;
		numbers.$input = $(input);
	    numbers.temporaryMode = numbers.$input.attr('id');
	    numbers.regex.compile("^([A-Fa-f0-9]{6})$");
		numbers.restrict = numbers.HEXCODE;
	},
	keyUp: function() {
	    clearTimeout(numbers.timeout);
		if(numbers.regex.test(numbers.value)){
            numbers.match = true;
			if(!numbers.pressed){
				numbers.updateField();
			} else {
				numbers.pressed = false;
			}
		}
	},
	updateField: function() {
	    switch(numbers.type){
	    case 'color':
	        if (numbers.match) colorpicker.update(numbers.temporaryMode);
	        break;
	    case 'style':
			numbers.$input.change();
	        break;
	    }
	},
	restrictCharacters: function(event) {
	    var keycode, character, isControlKey,
	        // 8 = backspace, 9 = tab, 13 = enter, 35 = home, 37 = left, 38 = top, 39 = right, 40 = down
			controlKeys = [ 8, 9, 13, 35, 36, 37, 38, 39, 40 ];
	    numbers.value = numbers.$input.val();
	    if (event.keyCode) {
	        keycode = event.keyCode;
	    } 
	    else if (event.which) {
	        keycode = event.which;
	    }
	    character = String.fromCharCode(keycode);
	    // 1 for key up (keycode 38), -1 for key down (keycode 40), 0 for other keys
	    numbers.direction = 0;
	    switch(keycode){
	        case 38: numbers.direction = 1; break;
	        case 40: numbers.direction = -1; break;
	    }
	    if (numbers.direction !== 0 && numbers.restrict === numbers.DIGITS) {
	        numbers.accelerate();
	        return false;
	    }
	    else {
	        isControlKey = controlKeys.join(",").match(new RegExp(keycode));
	        if (isControlKey) {
	            return true;
	        }
	        else if (character.match(numbers.restrict)) {
				numbers.value += character;
	            return true;
	        }
	        event.preventDefault();
	        return false;
	    }
	},
	accelerate: function() {
	    if(numbers.timeout) clearTimeout(numbers.timeout);
	    if(numbers.value === '') {
	        numbers.value = 0;
	    }
	    var number = parseInt(numbers.value, 10);
	    number += numbers.direction;
	    number = Math.max(numbers.min, Math.min(numbers.max, number));
	    if('-'+numbers.max === numbers.min) { // as in angle from -180 to 180
	        if(number === numbers.min) number = numbers.max;
	        else if(number === numbers.max) number = numbers.min;
	    }
	    numbers.$input.val(number);
	    numbers.value = number;
		numbers.updateField();
		if(!numbers.pressed){
			numbers.speed = 500;
			numbers.pressed = true;
		}
		else {
			numbers.speed = 150;
		}
	    numbers.timeout = setTimeout(function(){ jQuery.proxy(numbers, "accelerate") }, numbers.speed);
	},
	validateInput: function(event) {
		var integer, errorString, nearestInt;
	    numbers.value = numbers.$input.val();
	    integer = parseInt(numbers.value, 10);
	    if(numbers.regex.test(integer)){
	        numbers.$input.val(integer);
	        return true;
	    }
		event.preventDefault();
	    errorString = lang.AnIntegerBetween+" "+ numbers.min +" "+lang.and+" "+ numbers.max +" "+lang.isRequired+". "+lang.ClosestValueInserted+".";
	    alert(errorString);
		nearestInt = Math.abs(numbers.max - integer) < Math.abs(numbers.min - integer) ? numbers.max : numbers.min;
	   	numbers.$input.val(nearestInt).focus().change();
	}
};