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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbml0aWFsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG5sZXQgbWVudSA9IG5ldyBOVkpTTWVudSgnLmhlYWRlcicgLyonLmhlYWRlcicgYXMgZGVmYXVsdCovLHtcblx0bWVudVNob3dCdXR0b25zOiAnLmhhbWJ1cmdlcicsIC8vJy5oYW1idXJnZXInIGFzIGRlZmF1bHQsIG1heSBiZSBBcnJheSBvZiBidXR0b25zXG5cdG1lbnU6ICcuaGVhZGVyX19tZW51JywgLy8nLmhlYWRlcl9fbWVudScgYXMgZGVmYXVsdFxuXHQvL29wdGlvbnNcblx0bWVudU9wZW5DbGFzczogJ29wZW4nLCAvL29wZW4gYXMgZGVmYXVsdFxuXHRhdXRvSW5pdGlhbGl6ZTogdHJ1ZSwgLy90cnVlIGFzIGRlZmF1bHRcblx0bG9ja0JvZHk6IHRydWUsIC8vdHJ1ZSBhcyBkZWZhdWx0XG5cdC8vY29uc3RvbEV2ZW50c1xuXHRvbjoge1xuXHRcdC8vIHJlYWR5OiB0cnVlLFxuXHRcdC8vaW5pdGlhbGl6ZWQ6ICgpID0+IHtjb25zb2xlLmxvZygnaW5pdGlhbGl6ZWQnKX0sXG5cdFx0dG9nZ2xlOiB7XG5cdFx0XHRlbGVtZW50czogWydoZWFkZXInLCAnbWVudVNob3dCdXR0b25zJywgJ21lbnUnLCAvKiBbJ2RpdiddICovXSwgLy8gZWxlbWVudHMgd2hpY2ggZ2V0IGFjdGl2ZSBjbGFzcy4gQXJyYXkgaXMgc2VsZWN0b3IgY29udGFpbmVyLCB3aGl0Y2ggYWxzbyBnZXQgYWN0aXZlQ2xhc3Ncblx0XHRcdGFjdGl2ZUNsYXNzOiAnb3BlbicsIC8vIG1lbnVPcGVuQ2xhc3MgdmFsdWUgZGVmYXVsdFxuXHRcdFx0YWRkQ2xhc3M6IHRydWUgLy90cnVlIGFzIGRlZmF1bHRcblx0XHR9LFxuXHRcdHNjcm9sbDoge1xuXHRcdFx0Ly8gc2Vuc2l2aXR5OiAnbWVkaXVtJywgJ2xvdywgJ2hpZ2h0OyBkZWZhdWx0IDIwLiBtZWFuIGNvdW50IG9mIHBpeGVscyB0byBjaGVjayBzY3JvbGwgaW4gMzAwbXNcblx0XHRcdHNlbnNpdml0eTogMjAsXG5cdFx0XHRhY3RpdmVDbGFzczogJ3Njcm9sbGVkJywgLy9zY3JvbGxlZCBhcyBkZWZhdWx0XG5cdFx0XHRhZGRDbGFzczogdHJ1ZSAvL3RydWUgYXMgZGVmYXVsdFxuXHRcdH0sXG5cdFx0c2Nyb2xsVG9Ub3A6IHtcblx0XHRcdGFjdGl2ZUNsYXNzOiAnc2Nyb2xsZWRUb1RvcCcsIC8vc2Nyb2xsZWQgYXMgZGVmYXVsdFxuXHRcdH0sXG5cdFx0c2Nyb2xsVG9Cb3R0b206IHtcblx0XHRcdGFjdGl2ZUNsYXNzOiAnc2Nyb2xsZWRUb0JvdHRvbScsIC8vc2Nyb2xsZWQgYXMgZGVmYXVsdFxuXHRcdH1cblx0fVxufSwgdHJ1ZSk7Il0sImZpbGUiOiJpbml0aWFsLmpzIn0=
