'use strict'

let menu = new NVJSMenu('.header' /*'.header' as default*/,{
	menuShowButtons: '.hamburger', //'.hamburger' as default, may be Array of buttons
	menu: '.header__menu', //'.header__menu' as default
	//options
	menuOpenClass: 'open', //open as default
	autoInitialize: true, //true as default
	lockBody: true, //true as default
	//constolEvents
	on: {
		// ready: true,
		//initialized: () => {console.log('initialized')},
		toggle: {
			elements: ['header', 'menuShowButtons', 'menu', /* ['div'] */], // elements which get active class. Array is selector container, whitch also get activeClass
			activeClass: 'open', // menuOpenClass value default
			addClass: true //true as default
		},
		scroll: {
			// sensivity: 'medium', 'low, 'hight; default 20. mean count of pixels to check scroll in 300ms
			sensivity: 20,
			activeClass: 'scrolled', //scrolled as default
			addClass: true //true as default
		},
		scrollToTop: {
			activeClass: 'scrolledToTop', //scrolled as default
		},
		scrollToBottom: {
			activeClass: 'scrolledToBottom', //scrolled as default
		}
	}
}, true);