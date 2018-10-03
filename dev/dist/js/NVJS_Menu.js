'use strict';

function NVJSMenu(config, configAtributes, logErrors) {
	const self = this;
	const factory = arguments;

	//elements
	let header;
	let headerSelector;
	let headerDefault = '.header';

	let menuShowButtons;
	let menuShowButtonsDefault = '.hamburger';

	let menu;
	let menuDefault = '.header__menu';

	//options
	let options = {
		autoInitialize: true, 
		lockBody: true,
		menuOpenClass: 'open'
	}

	//constolEvents
	let events = {
		scroll: {},
		toggle: {}
	}

	//status
	let _initialized = false;
	let _isShow = false;
	let _isScrolled = false;
	let _bodyFlowStatus;
	

	function parseData(configData) {
		[header, headerSelector] = setData([this, headerDefault], '', 1, true)
		if(header){
			header.dispatchEvent(new Event ('ready'))
			self.header = header;

			if (header.getAttribute('ready') !== ''  && !header.getAttribute('ready')){
				header.setAttribute('ready', '');
			} else {
				showError(`NVJS_Menu initialization error. NVJS_Menu was initialized early. Initialization Aborted`, 'error');
				return false;
			}

			menu = setData([configData.menu, menuDefault], headerSelector, 1);
			self.menu = menu;

			//! check buttons may be more than 1, and we need return selector function failed
			menuShowButtons = setData([configData.menuShowButtons, menuShowButtonsDefault], headerSelector)
			self.menuShowButtons = menuShowButtons;

			Object.keys(options).forEach(option => {
				if(configData[option] != undefined && checkType(options[option]) == checkType(configData[option])){
					options[option] = (configData[option]);
				}
				self[option] = options[option];
			})

			parseEvents(configData.on);
		
			if(self.autoInitialize) initialize();

		} else {
			showError(`NVJS_Menu initialization error. Header element unavaliable. Initialization Aborted`, 'error');
			return false
		}
	}

	function parseEvents(configEvents){
		
		events.toggle = {
			enable:true,
			elements: ['header', 'menuShowButtons', 'menu'],
			addClass: true,
			activeClass: self.menuOpenClass,
			callingFunction: false
		}
		events.toggle.elements = checkToggledElements.call(events.toggle);
		

		events.scroll = {
			enable:false,
			sensivityLevel: {
				low : 40,
				medium : 20,
				hight : 0,
				default : 20
			},
			addClass: true,
			activeClass: 'scrolled',
			callingFunction: false
		}
		events.scroll.sensivity = events.scroll.sensivityLevel.default;

		if(configEvents){

			let commonProp = ['enable', 'addClass', 'activeClass', 'callingFunction'];

			Object.keys(configEvents).forEach(event => {
				if(!events[event]){
					events[event] = {}
				}
				
				switch (checkType(configEvents[event])){
					case('function'): {
						events[event].callingFunction = configEvents[event];
						break;
					}
					case('boolean'): {
						events[event].enable = configEvents[event];
						break;
					}
					case('object'): {
						events[event].enable = true;

						for(let prop of commonProp){
							if(configEvents[event][prop] != undefined){
								events[event][prop] = configEvents[event][prop]
							}
							if(prop == 'activeClass' && configEvents[event].activeClass != undefined && events[event].addClass == undefined && configEvents[event].addClass == undefined){
								events[event].addClass = true;
							}
						}

						setSpecialConfigEvents.call(event);
						break;
					}
				}
			})
			
			// set userFunctions on Events
			for (let key in events){
				if(events[key].callingFunction){
					if (!self.userFunc) self.userFunc = {};
					Object.defineProperty(self.userFunc, key, {
						configurable: true,
						enumerable: true,
						value: events[key].callingFunction,
						writable: false
					})
				}
			}

		}
		
		function setSpecialConfigEvents(){
			let event = this;
			switch(event){
				case('toggle'):{
					if(configEvents.toggle.elements){			
						events.toggle.elements = checkToggledElements.call(configEvents.toggle, events.toggle.elements)
					}
					break;
				}
				case('scroll'):{
					if(configEvents.scroll.sensivity){checkScrolledSensivity.call(configEvents.scroll)}
					break;
				}
			}
		}

		function checkScrolledSensivity(){
			let sensivity = this.sensivity;
			switch(checkType(sensivity)){
				case('number'): {
					if(sensivity < 0){
						showError(`NVJS_Menu setEvents warn. Scroll sensivity can't be less than 0. Use default 20.`);
					} else if (sensivity > 100){
						events.scroll.sensivity  = sensivity;
						showError(`NVJS_Menu setEvents warn. Scroll sensivity wery low. Try to use default 20.`);
					} else {
						events.scroll.sensivity  = sensivity;
					}
					break;
				}
				case('string'): {
					if(events.scroll.sensivityLevel[sensivity]){
						events.scroll.sensivity = events.scroll.sensivityLevel[sensivity];
					} else {
						showError(`NVJS_Menu setEvents warn. Scroll sensivity ${sensivity} can't be find. Use default 20.`);
					}
					break;
				}
			}

		}

		function checkToggledElements(defaults){
			let elements = this.elements;
			
			if (elements == [undefined]) return [];

			let elementsType = checkType(this.elements);
			let elementsArr = [];

			if (elementsType == 'string'){
				checkString(elements)
			} else if (elementsType == 'array'){
				elements.forEach(elem => {
					let elemType =  checkType(elem);
					if (elemType == 'string'){
						checkString(elem)
					} else if (elemType == 'array'){
						elem.forEach(selector =>{
							elementsArr.push(setData([selector], headerSelector))
						})
					}
				})
			}

			if (elementsArr.length < 1 && defaults && elements !== []){
				elementsArr = defaults;
				console.log(elements)
			} else if (elementsArr.length > 0){
				elementsArr = cleanRepeatingElements(arrayToArrayElements(elementsArr));
			}
			
			return elementsArr;
			
			function checkString(element){
				if (self[element]){
					elementsArr.push(self[element])
				} else {
					showError(`NVJS_Menu setEvents warn. Some toggled elements not found.`);
				}
			}
			
		}
	}

	function initialize(){
		_initialized = true;
		header.dispatchEvent(new Event ('initialized'));

		setEvents();
	}


	function setEvents(){

		if(events.toggle.enable){

			menuShowButtons.forEach(button => {
				button.addEventListener('click', (event) => {
					event.preventDefault();
					toggleMenu();
				})
			})

			menu.addEventListener('click', e => e.stopPropagation())
		}

		if(events.scroll.enable){
			let scroll = events.scroll;

			header.addEventListener('scroll', (event)=>{
				if(scroll.addClass && scroll.activeClass){
					setScrollClass();
				} else if(!scroll.activeClass){					
					showError(`NVJS_Menu on ${event.type} error. Name of ${event.type} active class is undefined`);
				}

				if(_isScrolled && !options.lockBody){
					toggleMenu.call('hide');
				}
			})
	
			header.addEventListener('scrollToTop', (event)=>{
				setForwardScroll(event.type, 'scrollToBottom');
			})
	
			header.addEventListener('scrollToBottom', (event)=>{
				setForwardScroll(event.type, 'scrollToTop');
			})


			function setForwardScroll(...data){
				let action = data.length > 1 ? 'add' : 'remove';
				let forward = data.shift();
				let event = events[forward];

				if(event.enable && event.addClass && event.activeClass){
					activeClassHandler.call(header, action, event.activeClass);
				} else if (!event.activeClass){
					showError(`NVJS_Menu onScroll error. Name of ${forward} active class is undefined`);
				}
				if(data.length > 0) setForwardScroll(data[0])
			}

			function setScrollClass(){
				if(_isScrolled){
					activeClassHandler.call(header, 'add', scroll.activeClass);
				} else {
					activeClassHandler.call(header, 'remove', scroll.activeClass);	
					setForwardScroll('scrollToTop');
				}
			}
			
			(function checkScroll(){
				let ypos = 0;
				let lastyPos;
				let eventScroll = new Event ('scroll')
				let sensivity = events.scroll.sensivity;

				let startCheckingScroll = 0; // add to initialize
				
				let scrollForward = {
					scrollToTop: false,
					scrollToBottom: false
				};
				
				
				if(!_isScrolled &&  window.scrollY > startCheckingScroll){
					setScrollEvent(true);
				}
				
				function setScrollEvent(status){
					if((!_isScrolled && status) || (_isScrolled && !status)){
						_isScrolled = status;
						header.dispatchEvent(eventScroll);
					}
				}

				function checkScrollForward(){
					let [k, disabled] = (this == 'scrollToTop') ? [1, 'scrollToBottom'] : [-1, 'scrollToTop'];

					scrollForward[this] = true;
					let startPos = ypos;		

					setTimeout(()=>{
						if( k * ypos < k * (startPos - sensivity)){
							scrollForward[disabled] = false;
							header.dispatchEvent(new Event(this))
						} else {
							scrollForward[this] = false;
						}
					}, 300)
				}

				window.addEventListener('scroll', () => {
					lastyPos = ypos;
					ypos = window.scrollY;
					if(ypos <= startCheckingScroll){
						setScrollEvent(false);
					} else if(ypos > startCheckingScroll){
						setScrollEvent(true);
						if(ypos > lastyPos){	
							let forward = 'scrollToBottom';
							if (!scrollForward[forward]){
								checkScrollForward.call(forward);
							}
						} else if(ypos < lastyPos){
							let forward = 'scrollToTop';
							if (!scrollForward[forward]){
								checkScrollForward.call(forward);
							}
						}
					}
				})
			})()
		}

		// run user func if they are
		if(self.userFunc){
			Object.keys(self.userFunc).forEach(key => {
				header.addEventListener(key, self.userFunc[key].call())
			})
		}
	}


	function toggleMenu(){
		let toggleStatus = {
			show:{
				setClass: 'add',
				bodyLock: true
			},
			hide:{
				setClass: 'remove',
				bodyLock: false
			}
		}

		let eventName = this != undefined ? this : _isShow ? "hide" : "show";
		if((eventName == "hide") && _isShow || (eventName == "show") && !_isShow){

			let toggle = events.toggle;
			if(toggle.addClass && toggle.activeClass){
				activeClassHandler.call(toggle.elements, toggleStatus[eventName].setClass, toggle.activeClass);
				
			} else if(!toggle.activeClass){					
				showError(`NVJS_Menu onScroll error. Name of Show active class is undefined`);
			}

			bodyLock.call(self.body, toggleStatus[eventName].bodyLock);
			header.dispatchEvent(new Event (eventName));
			_isShow = !_isShow;

		}
	}


	function bodyLock(status){
		if(options.lockBody) {
			if (status){
				_bodyFlowStatus = document.body.style.overflow;  
				document.body.style.overflow = 'hidden';
			} else if (!status){
				document.body.style.overflow = _bodyFlowStatus;
				_bodyFlowStatus = undefined;
			}
		}
	}

	function activeClassHandler(action, className){
		switch(checkType(this)){
			case('Node'): {
				if ((action == 'add' && !this.classList.contains(className)) || (action == 'remove' && this.classList.contains(className))){
					this.classList[action](className);
				} 
				break;
			}
			case('array'):{
				this.forEach(
					element => activeClassHandler.call(element, action, className)
				)
				break;
			}
		}
	}
	
	// used to create .on() function
	function eventsHandler(eventName, func){
		header.addEventListener(eventName, ()=>{
			func();
		})
	}

	function showError(textError, type) {
		if (logErrors && textError){
			if (!type || type == 'warn') {
				console.warn(textError);
			} else if (type == 'error'){
				console.error(textError);
			}
		}
	}

	//return selector may be just just when avaliableMaxLength = 1; 
	function setData(elements, container, avaliableMaxLength, returnSelector, counter){
		let result;
		let selector;
		if(!counter){
			counter = 1;
		} else {
			counter++;
		}

		if (elements.length > 0){
			let checkElem = elements.shift();
			let checkArr = checkTypeReturnArray(checkElem, container);

			if(checkArr[0]){
				selector = checkElem;
				if(avaliableMaxLength && checkType(avaliableMaxLength == 'number')){
					if(avaliableMaxLength == 1){
						result = checkArr[1][0]
					} else {
						result = checkArr[1].slice(0, avaliableMaxLength)
					}
				} else {
					result = checkArr[1]
				}
			} else {
				if(counter == 1){
					showError(`NVJS_Menu initialization warn. '${checkElem}' selector unavaliable. Trying used default`);
				}
				if(!returnSelector){
					result = setData(elements, container, avaliableMaxLength, returnSelector, counter);
				} else {
					[result, selector] = result = setData(elements, container, avaliableMaxLength, returnSelector, counter);
				}
			}
		} else {
			showError(`NVJS_Menu initialization error. some selector unavaliable. Some function may work not correct`);
			result = false;
		}

		if (returnSelector){
			return [result, selector]
		} else {
			return result;
		}
	}

	function arrayToArrayElements(array){
		let newArr = []
		array.forEach((element) => {
			switch(checkType(element)){
				case ('Node'):{
					newArr.push(element);
					break;
				}
				case ('array'):{
					newArr = newArr.concat(arrayToArrayElements(element));
					break;
				}
			}
		})
		return newArr;
	}

	function cleanRepeatingElements(array){
		return array.reduce((arr, element) => {
			if(!(arr.includes(element))){
				arr.push(element)
			}
			return arr
		},[])
	}

	function checkTypeReturnArray(data, container){
		let arrContainer = container ? container : 'body';
		let arrContainerElem = document.querySelector(arrContainer);
		
		let arr = [];
		
		switch(checkType(data)){
			case 'string': {
				arr = checkTypeReturnArray(arrContainerElem.querySelectorAll(data), arrContainer);
				if(arr[0]){
					return [true, arr[1]]
				} else {
					return [false];
				}
				break;
			}
			case 'NodeList': {
				Array.prototype.slice.call(data, 0).forEach(elem => {
					if(elem.closest(arrContainer)){
						arr.push(elem)
					}
				})
				if(arr.length > 0){
					return [true, arr];
				} else {
					return [false];
				}
				break;
			}
			case 'array': {
				data.forEach(elem => {
				
					let newArr = checkTypeReturnArray(elem, arrContainer)	
						
					if(newArr[0]){
						arr = arr.concat(newArr[1]);
					}
				})
				if(arr.length > 0){
					return [true, arr];
				} else {
					return [false];
				}
				break;
			}
			default: {
				return [false];
				break;
			}

		}
	}

	function checkType(data){
		if (typeof data === 'string' || data instanceof String){
			return 'string'
		} else if (typeof data == 'boolean'){
			return 'boolean'
		} else if (typeof data === 'number' && isFinite(data)){
			return 'number'
		} else if (typeof data == 'undefined'){
			return 'undefined'
		} else if (typeof data == 'function'){
			return 'function'
		} else if (typeof data == 'object'){
			if(Array.isArray(data)){	
				return 'array'
			} else if(NodeList.prototype.isPrototypeOf(data)){	
				return 'NodeList'
			} else if(data instanceof Node){	
				return 'Node'
			} else if (data.constructor === Object){
				return 'object'
			} else if (data.constructor === RegExp){
				return 'regexp'
			}
		} else if (data === null){
			return 'null'
		} else if (data instanceof Error && typeof data.message !== 'undefined'){
			return 'error'
		} else if (data instanceof Date){
			return 'date'
		} else if (typeof data === 'symbol'){
			return 'symbol'
		} 
	}

	this.toggle = () => {
		toggleMenu();
	};

	
	this.hide = function(){
		toggleMenu.call('hide');
	};


	this.show = function(){
		toggleMenu.call('show');
	};

	this.on = eventsHandler;

	this.initialize = function(){
		if(!_initialized){
			initialize();
		} else {
			showError(`NVJS_Menu initialization error. NVJS_Menu already initialized`, 'error');
		}
	};

	(function parseConfig() {
		let parseMask = [
						['string', `NVJS_Menu initialization warn. Header selector doesn't exist. Try used default.`], 
						['object', `NVJS_Menu initialization warn. Configuration doesn't exist. Try used default.`], 
						['boolean']]


		let errorArr = [];
		let parsingData = [];
		let factoryParse = Array.prototype.slice.call(factory, 0, parseMask.length);
		
		for (let i = 0; i < parseMask.length; i++){
			if(parseMask[i][0] == checkType(factoryParse[0])){

				parsingData.push(factoryParse.shift());
			} else {
				
				parsingData.push(undefined)
				errorArr.push(parseMask[i][1])
			}
		}

		if (parsingData.pop() == true){
			logErrors = true;
			errorArr.forEach(errorMessage => showError(errorMessage))
		}

		parseData.call(parsingData[0], parsingData[1])

	})();
  
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJOVkpTX01lbnUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBOVkpTTWVudShjb25maWcsIGNvbmZpZ0F0cmlidXRlcywgbG9nRXJyb3JzKSB7XG5cdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRjb25zdCBmYWN0b3J5ID0gYXJndW1lbnRzO1xuXG5cdC8vZWxlbWVudHNcblx0bGV0IGhlYWRlcjtcblx0bGV0IGhlYWRlclNlbGVjdG9yO1xuXHRsZXQgaGVhZGVyRGVmYXVsdCA9ICcuaGVhZGVyJztcblxuXHRsZXQgbWVudVNob3dCdXR0b25zO1xuXHRsZXQgbWVudVNob3dCdXR0b25zRGVmYXVsdCA9ICcuaGFtYnVyZ2VyJztcblxuXHRsZXQgbWVudTtcblx0bGV0IG1lbnVEZWZhdWx0ID0gJy5oZWFkZXJfX21lbnUnO1xuXG5cdC8vb3B0aW9uc1xuXHRsZXQgb3B0aW9ucyA9IHtcblx0XHRhdXRvSW5pdGlhbGl6ZTogdHJ1ZSwgXG5cdFx0bG9ja0JvZHk6IHRydWUsXG5cdFx0bWVudU9wZW5DbGFzczogJ29wZW4nXG5cdH1cblxuXHQvL2NvbnN0b2xFdmVudHNcblx0bGV0IGV2ZW50cyA9IHtcblx0XHRzY3JvbGw6IHt9LFxuXHRcdHRvZ2dsZToge31cblx0fVxuXG5cdC8vc3RhdHVzXG5cdGxldCBfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0bGV0IF9pc1Nob3cgPSBmYWxzZTtcblx0bGV0IF9pc1Njcm9sbGVkID0gZmFsc2U7XG5cdGxldCBfYm9keUZsb3dTdGF0dXM7XG5cdFxuXG5cdGZ1bmN0aW9uIHBhcnNlRGF0YShjb25maWdEYXRhKSB7XG5cdFx0W2hlYWRlciwgaGVhZGVyU2VsZWN0b3JdID0gc2V0RGF0YShbdGhpcywgaGVhZGVyRGVmYXVsdF0sICcnLCAxLCB0cnVlKVxuXHRcdGlmKGhlYWRlcil7XG5cdFx0XHRoZWFkZXIuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQgKCdyZWFkeScpKVxuXHRcdFx0c2VsZi5oZWFkZXIgPSBoZWFkZXI7XG5cblx0XHRcdGlmIChoZWFkZXIuZ2V0QXR0cmlidXRlKCdyZWFkeScpICE9PSAnJyAgJiYgIWhlYWRlci5nZXRBdHRyaWJ1dGUoJ3JlYWR5Jykpe1xuXHRcdFx0XHRoZWFkZXIuc2V0QXR0cmlidXRlKCdyZWFkeScsICcnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IGluaXRpYWxpemF0aW9uIGVycm9yLiBOVkpTX01lbnUgd2FzIGluaXRpYWxpemVkIGVhcmx5LiBJbml0aWFsaXphdGlvbiBBYm9ydGVkYCwgJ2Vycm9yJyk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0bWVudSA9IHNldERhdGEoW2NvbmZpZ0RhdGEubWVudSwgbWVudURlZmF1bHRdLCBoZWFkZXJTZWxlY3RvciwgMSk7XG5cdFx0XHRzZWxmLm1lbnUgPSBtZW51O1xuXG5cdFx0XHQvLyEgY2hlY2sgYnV0dG9ucyBtYXkgYmUgbW9yZSB0aGFuIDEsIGFuZCB3ZSBuZWVkIHJldHVybiBzZWxlY3RvciBmdW5jdGlvbiBmYWlsZWRcblx0XHRcdG1lbnVTaG93QnV0dG9ucyA9IHNldERhdGEoW2NvbmZpZ0RhdGEubWVudVNob3dCdXR0b25zLCBtZW51U2hvd0J1dHRvbnNEZWZhdWx0XSwgaGVhZGVyU2VsZWN0b3IpXG5cdFx0XHRzZWxmLm1lbnVTaG93QnV0dG9ucyA9IG1lbnVTaG93QnV0dG9ucztcblxuXHRcdFx0T2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChvcHRpb24gPT4ge1xuXHRcdFx0XHRpZihjb25maWdEYXRhW29wdGlvbl0gIT0gdW5kZWZpbmVkICYmIGNoZWNrVHlwZShvcHRpb25zW29wdGlvbl0pID09IGNoZWNrVHlwZShjb25maWdEYXRhW29wdGlvbl0pKXtcblx0XHRcdFx0XHRvcHRpb25zW29wdGlvbl0gPSAoY29uZmlnRGF0YVtvcHRpb25dKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzZWxmW29wdGlvbl0gPSBvcHRpb25zW29wdGlvbl07XG5cdFx0XHR9KVxuXG5cdFx0XHRwYXJzZUV2ZW50cyhjb25maWdEYXRhLm9uKTtcblx0XHRcblx0XHRcdGlmKHNlbGYuYXV0b0luaXRpYWxpemUpIGluaXRpYWxpemUoKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzaG93RXJyb3IoYE5WSlNfTWVudSBpbml0aWFsaXphdGlvbiBlcnJvci4gSGVhZGVyIGVsZW1lbnQgdW5hdmFsaWFibGUuIEluaXRpYWxpemF0aW9uIEFib3J0ZWRgLCAnZXJyb3InKTtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHBhcnNlRXZlbnRzKGNvbmZpZ0V2ZW50cyl7XG5cdFx0XG5cdFx0ZXZlbnRzLnRvZ2dsZSA9IHtcblx0XHRcdGVuYWJsZTp0cnVlLFxuXHRcdFx0ZWxlbWVudHM6IFsnaGVhZGVyJywgJ21lbnVTaG93QnV0dG9ucycsICdtZW51J10sXG5cdFx0XHRhZGRDbGFzczogdHJ1ZSxcblx0XHRcdGFjdGl2ZUNsYXNzOiBzZWxmLm1lbnVPcGVuQ2xhc3MsXG5cdFx0XHRjYWxsaW5nRnVuY3Rpb246IGZhbHNlXG5cdFx0fVxuXHRcdGV2ZW50cy50b2dnbGUuZWxlbWVudHMgPSBjaGVja1RvZ2dsZWRFbGVtZW50cy5jYWxsKGV2ZW50cy50b2dnbGUpO1xuXHRcdFxuXG5cdFx0ZXZlbnRzLnNjcm9sbCA9IHtcblx0XHRcdGVuYWJsZTpmYWxzZSxcblx0XHRcdHNlbnNpdml0eUxldmVsOiB7XG5cdFx0XHRcdGxvdyA6IDQwLFxuXHRcdFx0XHRtZWRpdW0gOiAyMCxcblx0XHRcdFx0aGlnaHQgOiAwLFxuXHRcdFx0XHRkZWZhdWx0IDogMjBcblx0XHRcdH0sXG5cdFx0XHRhZGRDbGFzczogdHJ1ZSxcblx0XHRcdGFjdGl2ZUNsYXNzOiAnc2Nyb2xsZWQnLFxuXHRcdFx0Y2FsbGluZ0Z1bmN0aW9uOiBmYWxzZVxuXHRcdH1cblx0XHRldmVudHMuc2Nyb2xsLnNlbnNpdml0eSA9IGV2ZW50cy5zY3JvbGwuc2Vuc2l2aXR5TGV2ZWwuZGVmYXVsdDtcblxuXHRcdGlmKGNvbmZpZ0V2ZW50cyl7XG5cblx0XHRcdGxldCBjb21tb25Qcm9wID0gWydlbmFibGUnLCAnYWRkQ2xhc3MnLCAnYWN0aXZlQ2xhc3MnLCAnY2FsbGluZ0Z1bmN0aW9uJ107XG5cblx0XHRcdE9iamVjdC5rZXlzKGNvbmZpZ0V2ZW50cykuZm9yRWFjaChldmVudCA9PiB7XG5cdFx0XHRcdGlmKCFldmVudHNbZXZlbnRdKXtcblx0XHRcdFx0XHRldmVudHNbZXZlbnRdID0ge31cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0c3dpdGNoIChjaGVja1R5cGUoY29uZmlnRXZlbnRzW2V2ZW50XSkpe1xuXHRcdFx0XHRcdGNhc2UoJ2Z1bmN0aW9uJyk6IHtcblx0XHRcdFx0XHRcdGV2ZW50c1tldmVudF0uY2FsbGluZ0Z1bmN0aW9uID0gY29uZmlnRXZlbnRzW2V2ZW50XTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlKCdib29sZWFuJyk6IHtcblx0XHRcdFx0XHRcdGV2ZW50c1tldmVudF0uZW5hYmxlID0gY29uZmlnRXZlbnRzW2V2ZW50XTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlKCdvYmplY3QnKToge1xuXHRcdFx0XHRcdFx0ZXZlbnRzW2V2ZW50XS5lbmFibGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRmb3IobGV0IHByb3Agb2YgY29tbW9uUHJvcCl7XG5cdFx0XHRcdFx0XHRcdGlmKGNvbmZpZ0V2ZW50c1tldmVudF1bcHJvcF0gIT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdFx0XHRldmVudHNbZXZlbnRdW3Byb3BdID0gY29uZmlnRXZlbnRzW2V2ZW50XVtwcm9wXVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmKHByb3AgPT0gJ2FjdGl2ZUNsYXNzJyAmJiBjb25maWdFdmVudHNbZXZlbnRdLmFjdGl2ZUNsYXNzICE9IHVuZGVmaW5lZCAmJiBldmVudHNbZXZlbnRdLmFkZENsYXNzID09IHVuZGVmaW5lZCAmJiBjb25maWdFdmVudHNbZXZlbnRdLmFkZENsYXNzID09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnRzW2V2ZW50XS5hZGRDbGFzcyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c2V0U3BlY2lhbENvbmZpZ0V2ZW50cy5jYWxsKGV2ZW50KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdFxuXHRcdFx0Ly8gc2V0IHVzZXJGdW5jdGlvbnMgb24gRXZlbnRzXG5cdFx0XHRmb3IgKGxldCBrZXkgaW4gZXZlbnRzKXtcblx0XHRcdFx0aWYoZXZlbnRzW2tleV0uY2FsbGluZ0Z1bmN0aW9uKXtcblx0XHRcdFx0XHRpZiAoIXNlbGYudXNlckZ1bmMpIHNlbGYudXNlckZ1bmMgPSB7fTtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZi51c2VyRnVuYywga2V5LCB7XG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0dmFsdWU6IGV2ZW50c1trZXldLmNhbGxpbmdGdW5jdGlvbixcblx0XHRcdFx0XHRcdHdyaXRhYmxlOiBmYWxzZVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblx0XHRcblx0XHRmdW5jdGlvbiBzZXRTcGVjaWFsQ29uZmlnRXZlbnRzKCl7XG5cdFx0XHRsZXQgZXZlbnQgPSB0aGlzO1xuXHRcdFx0c3dpdGNoKGV2ZW50KXtcblx0XHRcdFx0Y2FzZSgndG9nZ2xlJyk6e1xuXHRcdFx0XHRcdGlmKGNvbmZpZ0V2ZW50cy50b2dnbGUuZWxlbWVudHMpe1x0XHRcdFxuXHRcdFx0XHRcdFx0ZXZlbnRzLnRvZ2dsZS5lbGVtZW50cyA9IGNoZWNrVG9nZ2xlZEVsZW1lbnRzLmNhbGwoY29uZmlnRXZlbnRzLnRvZ2dsZSwgZXZlbnRzLnRvZ2dsZS5lbGVtZW50cylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSgnc2Nyb2xsJyk6e1xuXHRcdFx0XHRcdGlmKGNvbmZpZ0V2ZW50cy5zY3JvbGwuc2Vuc2l2aXR5KXtjaGVja1Njcm9sbGVkU2Vuc2l2aXR5LmNhbGwoY29uZmlnRXZlbnRzLnNjcm9sbCl9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBjaGVja1Njcm9sbGVkU2Vuc2l2aXR5KCl7XG5cdFx0XHRsZXQgc2Vuc2l2aXR5ID0gdGhpcy5zZW5zaXZpdHk7XG5cdFx0XHRzd2l0Y2goY2hlY2tUeXBlKHNlbnNpdml0eSkpe1xuXHRcdFx0XHRjYXNlKCdudW1iZXInKToge1xuXHRcdFx0XHRcdGlmKHNlbnNpdml0eSA8IDApe1xuXHRcdFx0XHRcdFx0c2hvd0Vycm9yKGBOVkpTX01lbnUgc2V0RXZlbnRzIHdhcm4uIFNjcm9sbCBzZW5zaXZpdHkgY2FuJ3QgYmUgbGVzcyB0aGFuIDAuIFVzZSBkZWZhdWx0IDIwLmApO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc2Vuc2l2aXR5ID4gMTAwKXtcblx0XHRcdFx0XHRcdGV2ZW50cy5zY3JvbGwuc2Vuc2l2aXR5ICA9IHNlbnNpdml0eTtcblx0XHRcdFx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IHNldEV2ZW50cyB3YXJuLiBTY3JvbGwgc2Vuc2l2aXR5IHdlcnkgbG93LiBUcnkgdG8gdXNlIGRlZmF1bHQgMjAuYCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGV2ZW50cy5zY3JvbGwuc2Vuc2l2aXR5ICA9IHNlbnNpdml0eTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSgnc3RyaW5nJyk6IHtcblx0XHRcdFx0XHRpZihldmVudHMuc2Nyb2xsLnNlbnNpdml0eUxldmVsW3NlbnNpdml0eV0pe1xuXHRcdFx0XHRcdFx0ZXZlbnRzLnNjcm9sbC5zZW5zaXZpdHkgPSBldmVudHMuc2Nyb2xsLnNlbnNpdml0eUxldmVsW3NlbnNpdml0eV07XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IHNldEV2ZW50cyB3YXJuLiBTY3JvbGwgc2Vuc2l2aXR5ICR7c2Vuc2l2aXR5fSBjYW4ndCBiZSBmaW5kLiBVc2UgZGVmYXVsdCAyMC5gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGNoZWNrVG9nZ2xlZEVsZW1lbnRzKGRlZmF1bHRzKXtcblx0XHRcdGxldCBlbGVtZW50cyA9IHRoaXMuZWxlbWVudHM7XG5cdFx0XHRcblx0XHRcdGlmIChlbGVtZW50cyA9PSBbdW5kZWZpbmVkXSkgcmV0dXJuIFtdO1xuXG5cdFx0XHRsZXQgZWxlbWVudHNUeXBlID0gY2hlY2tUeXBlKHRoaXMuZWxlbWVudHMpO1xuXHRcdFx0bGV0IGVsZW1lbnRzQXJyID0gW107XG5cblx0XHRcdGlmIChlbGVtZW50c1R5cGUgPT0gJ3N0cmluZycpe1xuXHRcdFx0XHRjaGVja1N0cmluZyhlbGVtZW50cylcblx0XHRcdH0gZWxzZSBpZiAoZWxlbWVudHNUeXBlID09ICdhcnJheScpe1xuXHRcdFx0XHRlbGVtZW50cy5mb3JFYWNoKGVsZW0gPT4ge1xuXHRcdFx0XHRcdGxldCBlbGVtVHlwZSA9ICBjaGVja1R5cGUoZWxlbSk7XG5cdFx0XHRcdFx0aWYgKGVsZW1UeXBlID09ICdzdHJpbmcnKXtcblx0XHRcdFx0XHRcdGNoZWNrU3RyaW5nKGVsZW0pXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChlbGVtVHlwZSA9PSAnYXJyYXknKXtcblx0XHRcdFx0XHRcdGVsZW0uZm9yRWFjaChzZWxlY3RvciA9Pntcblx0XHRcdFx0XHRcdFx0ZWxlbWVudHNBcnIucHVzaChzZXREYXRhKFtzZWxlY3Rvcl0sIGhlYWRlclNlbGVjdG9yKSlcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZWxlbWVudHNBcnIubGVuZ3RoIDwgMSAmJiBkZWZhdWx0cyAmJiBlbGVtZW50cyAhPT0gW10pe1xuXHRcdFx0XHRlbGVtZW50c0FyciA9IGRlZmF1bHRzO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlbGVtZW50cylcblx0XHRcdH0gZWxzZSBpZiAoZWxlbWVudHNBcnIubGVuZ3RoID4gMCl7XG5cdFx0XHRcdGVsZW1lbnRzQXJyID0gY2xlYW5SZXBlYXRpbmdFbGVtZW50cyhhcnJheVRvQXJyYXlFbGVtZW50cyhlbGVtZW50c0FycikpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gZWxlbWVudHNBcnI7XG5cdFx0XHRcblx0XHRcdGZ1bmN0aW9uIGNoZWNrU3RyaW5nKGVsZW1lbnQpe1xuXHRcdFx0XHRpZiAoc2VsZltlbGVtZW50XSl7XG5cdFx0XHRcdFx0ZWxlbWVudHNBcnIucHVzaChzZWxmW2VsZW1lbnRdKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IHNldEV2ZW50cyB3YXJuLiBTb21lIHRvZ2dsZWQgZWxlbWVudHMgbm90IGZvdW5kLmApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0aWFsaXplKCl7XG5cdFx0X2luaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRoZWFkZXIuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQgKCdpbml0aWFsaXplZCcpKTtcblxuXHRcdHNldEV2ZW50cygpO1xuXHR9XG5cblxuXHRmdW5jdGlvbiBzZXRFdmVudHMoKXtcblxuXHRcdGlmKGV2ZW50cy50b2dnbGUuZW5hYmxlKXtcblxuXHRcdFx0bWVudVNob3dCdXR0b25zLmZvckVhY2goYnV0dG9uID0+IHtcblx0XHRcdFx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR0b2dnbGVNZW51KCk7XG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXG5cdFx0XHRtZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpKVxuXHRcdH1cblxuXHRcdGlmKGV2ZW50cy5zY3JvbGwuZW5hYmxlKXtcblx0XHRcdGxldCBzY3JvbGwgPSBldmVudHMuc2Nyb2xsO1xuXG5cdFx0XHRoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgKGV2ZW50KT0+e1xuXHRcdFx0XHRpZihzY3JvbGwuYWRkQ2xhc3MgJiYgc2Nyb2xsLmFjdGl2ZUNsYXNzKXtcblx0XHRcdFx0XHRzZXRTY3JvbGxDbGFzcygpO1xuXHRcdFx0XHR9IGVsc2UgaWYoIXNjcm9sbC5hY3RpdmVDbGFzcyl7XHRcdFx0XHRcdFxuXHRcdFx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IG9uICR7ZXZlbnQudHlwZX0gZXJyb3IuIE5hbWUgb2YgJHtldmVudC50eXBlfSBhY3RpdmUgY2xhc3MgaXMgdW5kZWZpbmVkYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihfaXNTY3JvbGxlZCAmJiAhb3B0aW9ucy5sb2NrQm9keSl7XG5cdFx0XHRcdFx0dG9nZ2xlTWVudS5jYWxsKCdoaWRlJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFxuXHRcdFx0aGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbFRvVG9wJywgKGV2ZW50KT0+e1xuXHRcdFx0XHRzZXRGb3J3YXJkU2Nyb2xsKGV2ZW50LnR5cGUsICdzY3JvbGxUb0JvdHRvbScpO1xuXHRcdFx0fSlcblx0XG5cdFx0XHRoZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsVG9Cb3R0b20nLCAoZXZlbnQpPT57XG5cdFx0XHRcdHNldEZvcndhcmRTY3JvbGwoZXZlbnQudHlwZSwgJ3Njcm9sbFRvVG9wJyk7XG5cdFx0XHR9KVxuXG5cblx0XHRcdGZ1bmN0aW9uIHNldEZvcndhcmRTY3JvbGwoLi4uZGF0YSl7XG5cdFx0XHRcdGxldCBhY3Rpb24gPSBkYXRhLmxlbmd0aCA+IDEgPyAnYWRkJyA6ICdyZW1vdmUnO1xuXHRcdFx0XHRsZXQgZm9yd2FyZCA9IGRhdGEuc2hpZnQoKTtcblx0XHRcdFx0bGV0IGV2ZW50ID0gZXZlbnRzW2ZvcndhcmRdO1xuXG5cdFx0XHRcdGlmKGV2ZW50LmVuYWJsZSAmJiBldmVudC5hZGRDbGFzcyAmJiBldmVudC5hY3RpdmVDbGFzcyl7XG5cdFx0XHRcdFx0YWN0aXZlQ2xhc3NIYW5kbGVyLmNhbGwoaGVhZGVyLCBhY3Rpb24sIGV2ZW50LmFjdGl2ZUNsYXNzKTtcblx0XHRcdFx0fSBlbHNlIGlmICghZXZlbnQuYWN0aXZlQ2xhc3Mpe1xuXHRcdFx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IG9uU2Nyb2xsIGVycm9yLiBOYW1lIG9mICR7Zm9yd2FyZH0gYWN0aXZlIGNsYXNzIGlzIHVuZGVmaW5lZGApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKGRhdGEubGVuZ3RoID4gMCkgc2V0Rm9yd2FyZFNjcm9sbChkYXRhWzBdKVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBzZXRTY3JvbGxDbGFzcygpe1xuXHRcdFx0XHRpZihfaXNTY3JvbGxlZCl7XG5cdFx0XHRcdFx0YWN0aXZlQ2xhc3NIYW5kbGVyLmNhbGwoaGVhZGVyLCAnYWRkJywgc2Nyb2xsLmFjdGl2ZUNsYXNzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhY3RpdmVDbGFzc0hhbmRsZXIuY2FsbChoZWFkZXIsICdyZW1vdmUnLCBzY3JvbGwuYWN0aXZlQ2xhc3MpO1x0XG5cdFx0XHRcdFx0c2V0Rm9yd2FyZFNjcm9sbCgnc2Nyb2xsVG9Ub3AnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQoZnVuY3Rpb24gY2hlY2tTY3JvbGwoKXtcblx0XHRcdFx0bGV0IHlwb3MgPSAwO1xuXHRcdFx0XHRsZXQgbGFzdHlQb3M7XG5cdFx0XHRcdGxldCBldmVudFNjcm9sbCA9IG5ldyBFdmVudCAoJ3Njcm9sbCcpXG5cdFx0XHRcdGxldCBzZW5zaXZpdHkgPSBldmVudHMuc2Nyb2xsLnNlbnNpdml0eTtcblxuXHRcdFx0XHRsZXQgc3RhcnRDaGVja2luZ1Njcm9sbCA9IDA7IC8vIGFkZCB0byBpbml0aWFsaXplXG5cdFx0XHRcdFxuXHRcdFx0XHRsZXQgc2Nyb2xsRm9yd2FyZCA9IHtcblx0XHRcdFx0XHRzY3JvbGxUb1RvcDogZmFsc2UsXG5cdFx0XHRcdFx0c2Nyb2xsVG9Cb3R0b206IGZhbHNlXG5cdFx0XHRcdH07XG5cdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdFx0aWYoIV9pc1Njcm9sbGVkICYmICB3aW5kb3cuc2Nyb2xsWSA+IHN0YXJ0Q2hlY2tpbmdTY3JvbGwpe1xuXHRcdFx0XHRcdHNldFNjcm9sbEV2ZW50KHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRmdW5jdGlvbiBzZXRTY3JvbGxFdmVudChzdGF0dXMpe1xuXHRcdFx0XHRcdGlmKCghX2lzU2Nyb2xsZWQgJiYgc3RhdHVzKSB8fCAoX2lzU2Nyb2xsZWQgJiYgIXN0YXR1cykpe1xuXHRcdFx0XHRcdFx0X2lzU2Nyb2xsZWQgPSBzdGF0dXM7XG5cdFx0XHRcdFx0XHRoZWFkZXIuZGlzcGF0Y2hFdmVudChldmVudFNjcm9sbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnVuY3Rpb24gY2hlY2tTY3JvbGxGb3J3YXJkKCl7XG5cdFx0XHRcdFx0bGV0IFtrLCBkaXNhYmxlZF0gPSAodGhpcyA9PSAnc2Nyb2xsVG9Ub3AnKSA/IFsxLCAnc2Nyb2xsVG9Cb3R0b20nXSA6IFstMSwgJ3Njcm9sbFRvVG9wJ107XG5cblx0XHRcdFx0XHRzY3JvbGxGb3J3YXJkW3RoaXNdID0gdHJ1ZTtcblx0XHRcdFx0XHRsZXQgc3RhcnRQb3MgPSB5cG9zO1x0XHRcblxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCk9Pntcblx0XHRcdFx0XHRcdGlmKCBrICogeXBvcyA8IGsgKiAoc3RhcnRQb3MgLSBzZW5zaXZpdHkpKXtcblx0XHRcdFx0XHRcdFx0c2Nyb2xsRm9yd2FyZFtkaXNhYmxlZF0gPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0aGVhZGVyLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KHRoaXMpKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c2Nyb2xsRm9yd2FyZFt0aGlzXSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIDMwMClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCAoKSA9PiB7XG5cdFx0XHRcdFx0bGFzdHlQb3MgPSB5cG9zO1xuXHRcdFx0XHRcdHlwb3MgPSB3aW5kb3cuc2Nyb2xsWTtcblx0XHRcdFx0XHRpZih5cG9zIDw9IHN0YXJ0Q2hlY2tpbmdTY3JvbGwpe1xuXHRcdFx0XHRcdFx0c2V0U2Nyb2xsRXZlbnQoZmFsc2UpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZih5cG9zID4gc3RhcnRDaGVja2luZ1Njcm9sbCl7XG5cdFx0XHRcdFx0XHRzZXRTY3JvbGxFdmVudCh0cnVlKTtcblx0XHRcdFx0XHRcdGlmKHlwb3MgPiBsYXN0eVBvcyl7XHRcblx0XHRcdFx0XHRcdFx0bGV0IGZvcndhcmQgPSAnc2Nyb2xsVG9Cb3R0b20nO1xuXHRcdFx0XHRcdFx0XHRpZiAoIXNjcm9sbEZvcndhcmRbZm9yd2FyZF0pe1xuXHRcdFx0XHRcdFx0XHRcdGNoZWNrU2Nyb2xsRm9yd2FyZC5jYWxsKGZvcndhcmQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYoeXBvcyA8IGxhc3R5UG9zKXtcblx0XHRcdFx0XHRcdFx0bGV0IGZvcndhcmQgPSAnc2Nyb2xsVG9Ub3AnO1xuXHRcdFx0XHRcdFx0XHRpZiAoIXNjcm9sbEZvcndhcmRbZm9yd2FyZF0pe1xuXHRcdFx0XHRcdFx0XHRcdGNoZWNrU2Nyb2xsRm9yd2FyZC5jYWxsKGZvcndhcmQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0fSkoKVxuXHRcdH1cblxuXHRcdC8vIHJ1biB1c2VyIGZ1bmMgaWYgdGhleSBhcmVcblx0XHRpZihzZWxmLnVzZXJGdW5jKXtcblx0XHRcdE9iamVjdC5rZXlzKHNlbGYudXNlckZ1bmMpLmZvckVhY2goa2V5ID0+IHtcblx0XHRcdFx0aGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoa2V5LCBzZWxmLnVzZXJGdW5jW2tleV0uY2FsbCgpKVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIHRvZ2dsZU1lbnUoKXtcblx0XHRsZXQgdG9nZ2xlU3RhdHVzID0ge1xuXHRcdFx0c2hvdzp7XG5cdFx0XHRcdHNldENsYXNzOiAnYWRkJyxcblx0XHRcdFx0Ym9keUxvY2s6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRoaWRlOntcblx0XHRcdFx0c2V0Q2xhc3M6ICdyZW1vdmUnLFxuXHRcdFx0XHRib2R5TG9jazogZmFsc2Vcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgZXZlbnROYW1lID0gdGhpcyAhPSB1bmRlZmluZWQgPyB0aGlzIDogX2lzU2hvdyA/IFwiaGlkZVwiIDogXCJzaG93XCI7XG5cdFx0aWYoKGV2ZW50TmFtZSA9PSBcImhpZGVcIikgJiYgX2lzU2hvdyB8fCAoZXZlbnROYW1lID09IFwic2hvd1wiKSAmJiAhX2lzU2hvdyl7XG5cblx0XHRcdGxldCB0b2dnbGUgPSBldmVudHMudG9nZ2xlO1xuXHRcdFx0aWYodG9nZ2xlLmFkZENsYXNzICYmIHRvZ2dsZS5hY3RpdmVDbGFzcyl7XG5cdFx0XHRcdGFjdGl2ZUNsYXNzSGFuZGxlci5jYWxsKHRvZ2dsZS5lbGVtZW50cywgdG9nZ2xlU3RhdHVzW2V2ZW50TmFtZV0uc2V0Q2xhc3MsIHRvZ2dsZS5hY3RpdmVDbGFzcyk7XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmKCF0b2dnbGUuYWN0aXZlQ2xhc3Mpe1x0XHRcdFx0XHRcblx0XHRcdFx0c2hvd0Vycm9yKGBOVkpTX01lbnUgb25TY3JvbGwgZXJyb3IuIE5hbWUgb2YgU2hvdyBhY3RpdmUgY2xhc3MgaXMgdW5kZWZpbmVkYCk7XG5cdFx0XHR9XG5cblx0XHRcdGJvZHlMb2NrLmNhbGwoc2VsZi5ib2R5LCB0b2dnbGVTdGF0dXNbZXZlbnROYW1lXS5ib2R5TG9jayk7XG5cdFx0XHRoZWFkZXIuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQgKGV2ZW50TmFtZSkpO1xuXHRcdFx0X2lzU2hvdyA9ICFfaXNTaG93O1xuXG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBib2R5TG9jayhzdGF0dXMpe1xuXHRcdGlmKG9wdGlvbnMubG9ja0JvZHkpIHtcblx0XHRcdGlmIChzdGF0dXMpe1xuXHRcdFx0XHRfYm9keUZsb3dTdGF0dXMgPSBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93OyAgXG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblx0XHRcdH0gZWxzZSBpZiAoIXN0YXR1cyl7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBfYm9keUZsb3dTdGF0dXM7XG5cdFx0XHRcdF9ib2R5Rmxvd1N0YXR1cyA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBhY3RpdmVDbGFzc0hhbmRsZXIoYWN0aW9uLCBjbGFzc05hbWUpe1xuXHRcdHN3aXRjaChjaGVja1R5cGUodGhpcykpe1xuXHRcdFx0Y2FzZSgnTm9kZScpOiB7XG5cdFx0XHRcdGlmICgoYWN0aW9uID09ICdhZGQnICYmICF0aGlzLmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB8fCAoYWN0aW9uID09ICdyZW1vdmUnICYmIHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpKXtcblx0XHRcdFx0XHR0aGlzLmNsYXNzTGlzdFthY3Rpb25dKGNsYXNzTmFtZSk7XG5cdFx0XHRcdH0gXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSgnYXJyYXknKTp7XG5cdFx0XHRcdHRoaXMuZm9yRWFjaChcblx0XHRcdFx0XHRlbGVtZW50ID0+IGFjdGl2ZUNsYXNzSGFuZGxlci5jYWxsKGVsZW1lbnQsIGFjdGlvbiwgY2xhc3NOYW1lKVxuXHRcdFx0XHQpXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRcblx0Ly8gdXNlZCB0byBjcmVhdGUgLm9uKCkgZnVuY3Rpb25cblx0ZnVuY3Rpb24gZXZlbnRzSGFuZGxlcihldmVudE5hbWUsIGZ1bmMpe1xuXHRcdGhlYWRlci5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgKCk9Pntcblx0XHRcdGZ1bmMoKTtcblx0XHR9KVxuXHR9XG5cblx0ZnVuY3Rpb24gc2hvd0Vycm9yKHRleHRFcnJvciwgdHlwZSkge1xuXHRcdGlmIChsb2dFcnJvcnMgJiYgdGV4dEVycm9yKXtcblx0XHRcdGlmICghdHlwZSB8fCB0eXBlID09ICd3YXJuJykge1xuXHRcdFx0XHRjb25zb2xlLndhcm4odGV4dEVycm9yKTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZSA9PSAnZXJyb3InKXtcblx0XHRcdFx0Y29uc29sZS5lcnJvcih0ZXh0RXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vcmV0dXJuIHNlbGVjdG9yIG1heSBiZSBqdXN0IGp1c3Qgd2hlbiBhdmFsaWFibGVNYXhMZW5ndGggPSAxOyBcblx0ZnVuY3Rpb24gc2V0RGF0YShlbGVtZW50cywgY29udGFpbmVyLCBhdmFsaWFibGVNYXhMZW5ndGgsIHJldHVyblNlbGVjdG9yLCBjb3VudGVyKXtcblx0XHRsZXQgcmVzdWx0O1xuXHRcdGxldCBzZWxlY3Rvcjtcblx0XHRpZighY291bnRlcil7XG5cdFx0XHRjb3VudGVyID0gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y291bnRlcisrO1xuXHRcdH1cblxuXHRcdGlmIChlbGVtZW50cy5sZW5ndGggPiAwKXtcblx0XHRcdGxldCBjaGVja0VsZW0gPSBlbGVtZW50cy5zaGlmdCgpO1xuXHRcdFx0bGV0IGNoZWNrQXJyID0gY2hlY2tUeXBlUmV0dXJuQXJyYXkoY2hlY2tFbGVtLCBjb250YWluZXIpO1xuXG5cdFx0XHRpZihjaGVja0FyclswXSl7XG5cdFx0XHRcdHNlbGVjdG9yID0gY2hlY2tFbGVtO1xuXHRcdFx0XHRpZihhdmFsaWFibGVNYXhMZW5ndGggJiYgY2hlY2tUeXBlKGF2YWxpYWJsZU1heExlbmd0aCA9PSAnbnVtYmVyJykpe1xuXHRcdFx0XHRcdGlmKGF2YWxpYWJsZU1heExlbmd0aCA9PSAxKXtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNoZWNrQXJyWzFdWzBdXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNoZWNrQXJyWzFdLnNsaWNlKDAsIGF2YWxpYWJsZU1heExlbmd0aClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gY2hlY2tBcnJbMV1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYoY291bnRlciA9PSAxKXtcblx0XHRcdFx0XHRzaG93RXJyb3IoYE5WSlNfTWVudSBpbml0aWFsaXphdGlvbiB3YXJuLiAnJHtjaGVja0VsZW19JyBzZWxlY3RvciB1bmF2YWxpYWJsZS4gVHJ5aW5nIHVzZWQgZGVmYXVsdGApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFyZXR1cm5TZWxlY3Rvcil7XG5cdFx0XHRcdFx0cmVzdWx0ID0gc2V0RGF0YShlbGVtZW50cywgY29udGFpbmVyLCBhdmFsaWFibGVNYXhMZW5ndGgsIHJldHVyblNlbGVjdG9yLCBjb3VudGVyKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRbcmVzdWx0LCBzZWxlY3Rvcl0gPSByZXN1bHQgPSBzZXREYXRhKGVsZW1lbnRzLCBjb250YWluZXIsIGF2YWxpYWJsZU1heExlbmd0aCwgcmV0dXJuU2VsZWN0b3IsIGNvdW50ZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IGluaXRpYWxpemF0aW9uIGVycm9yLiBzb21lIHNlbGVjdG9yIHVuYXZhbGlhYmxlLiBTb21lIGZ1bmN0aW9uIG1heSB3b3JrIG5vdCBjb3JyZWN0YCk7XG5cdFx0XHRyZXN1bHQgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAocmV0dXJuU2VsZWN0b3Ipe1xuXHRcdFx0cmV0dXJuIFtyZXN1bHQsIHNlbGVjdG9yXVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGFycmF5VG9BcnJheUVsZW1lbnRzKGFycmF5KXtcblx0XHRsZXQgbmV3QXJyID0gW11cblx0XHRhcnJheS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG5cdFx0XHRzd2l0Y2goY2hlY2tUeXBlKGVsZW1lbnQpKXtcblx0XHRcdFx0Y2FzZSAoJ05vZGUnKTp7XG5cdFx0XHRcdFx0bmV3QXJyLnB1c2goZWxlbWVudCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSAoJ2FycmF5Jyk6e1xuXHRcdFx0XHRcdG5ld0FyciA9IG5ld0Fyci5jb25jYXQoYXJyYXlUb0FycmF5RWxlbWVudHMoZWxlbWVudCkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0XHRyZXR1cm4gbmV3QXJyO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2xlYW5SZXBlYXRpbmdFbGVtZW50cyhhcnJheSl7XG5cdFx0cmV0dXJuIGFycmF5LnJlZHVjZSgoYXJyLCBlbGVtZW50KSA9PiB7XG5cdFx0XHRpZighKGFyci5pbmNsdWRlcyhlbGVtZW50KSkpe1xuXHRcdFx0XHRhcnIucHVzaChlbGVtZW50KVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGFyclxuXHRcdH0sW10pXG5cdH1cblxuXHRmdW5jdGlvbiBjaGVja1R5cGVSZXR1cm5BcnJheShkYXRhLCBjb250YWluZXIpe1xuXHRcdGxldCBhcnJDb250YWluZXIgPSBjb250YWluZXIgPyBjb250YWluZXIgOiAnYm9keSc7XG5cdFx0bGV0IGFyckNvbnRhaW5lckVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGFyckNvbnRhaW5lcik7XG5cdFx0XG5cdFx0bGV0IGFyciA9IFtdO1xuXHRcdFxuXHRcdHN3aXRjaChjaGVja1R5cGUoZGF0YSkpe1xuXHRcdFx0Y2FzZSAnc3RyaW5nJzoge1xuXHRcdFx0XHRhcnIgPSBjaGVja1R5cGVSZXR1cm5BcnJheShhcnJDb250YWluZXJFbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoZGF0YSksIGFyckNvbnRhaW5lcik7XG5cdFx0XHRcdGlmKGFyclswXSl7XG5cdFx0XHRcdFx0cmV0dXJuIFt0cnVlLCBhcnJbMV1dXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIFtmYWxzZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRjYXNlICdOb2RlTGlzdCc6IHtcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZGF0YSwgMCkuZm9yRWFjaChlbGVtID0+IHtcblx0XHRcdFx0XHRpZihlbGVtLmNsb3Nlc3QoYXJyQ29udGFpbmVyKSl7XG5cdFx0XHRcdFx0XHRhcnIucHVzaChlbGVtKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0aWYoYXJyLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRcdHJldHVybiBbdHJ1ZSwgYXJyXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gW2ZhbHNlXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGNhc2UgJ2FycmF5Jzoge1xuXHRcdFx0XHRkYXRhLmZvckVhY2goZWxlbSA9PiB7XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGxldCBuZXdBcnIgPSBjaGVja1R5cGVSZXR1cm5BcnJheShlbGVtLCBhcnJDb250YWluZXIpXHRcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmKG5ld0FyclswXSl7XG5cdFx0XHRcdFx0XHRhcnIgPSBhcnIuY29uY2F0KG5ld0FyclsxXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHRpZihhcnIubGVuZ3RoID4gMCl7XG5cdFx0XHRcdFx0cmV0dXJuIFt0cnVlLCBhcnJdO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBbZmFsc2VdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHRyZXR1cm4gW2ZhbHNlXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBjaGVja1R5cGUoZGF0YSl7XG5cdFx0aWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJyB8fCBkYXRhIGluc3RhbmNlb2YgU3RyaW5nKXtcblx0XHRcdHJldHVybiAnc3RyaW5nJ1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT0gJ2Jvb2xlYW4nKXtcblx0XHRcdHJldHVybiAnYm9vbGVhbidcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShkYXRhKSl7XG5cdFx0XHRyZXR1cm4gJ251bWJlcidcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09ICd1bmRlZmluZWQnKXtcblx0XHRcdHJldHVybiAndW5kZWZpbmVkJ1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT0gJ2Z1bmN0aW9uJyl7XG5cdFx0XHRyZXR1cm4gJ2Z1bmN0aW9uJ1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT0gJ29iamVjdCcpe1xuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShkYXRhKSl7XHRcblx0XHRcdFx0cmV0dXJuICdhcnJheSdcblx0XHRcdH0gZWxzZSBpZihOb2RlTGlzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihkYXRhKSl7XHRcblx0XHRcdFx0cmV0dXJuICdOb2RlTGlzdCdcblx0XHRcdH0gZWxzZSBpZihkYXRhIGluc3RhbmNlb2YgTm9kZSl7XHRcblx0XHRcdFx0cmV0dXJuICdOb2RlJ1xuXHRcdFx0fSBlbHNlIGlmIChkYXRhLmNvbnN0cnVjdG9yID09PSBPYmplY3Qpe1xuXHRcdFx0XHRyZXR1cm4gJ29iamVjdCdcblx0XHRcdH0gZWxzZSBpZiAoZGF0YS5jb25zdHJ1Y3RvciA9PT0gUmVnRXhwKXtcblx0XHRcdFx0cmV0dXJuICdyZWdleHAnXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChkYXRhID09PSBudWxsKXtcblx0XHRcdHJldHVybiAnbnVsbCdcblx0XHR9IGVsc2UgaWYgKGRhdGEgaW5zdGFuY2VvZiBFcnJvciAmJiB0eXBlb2YgZGF0YS5tZXNzYWdlICE9PSAndW5kZWZpbmVkJyl7XG5cdFx0XHRyZXR1cm4gJ2Vycm9yJ1xuXHRcdH0gZWxzZSBpZiAoZGF0YSBpbnN0YW5jZW9mIERhdGUpe1xuXHRcdFx0cmV0dXJuICdkYXRlJ1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzeW1ib2wnKXtcblx0XHRcdHJldHVybiAnc3ltYm9sJ1xuXHRcdH0gXG5cdH1cblxuXHR0aGlzLnRvZ2dsZSA9ICgpID0+IHtcblx0XHR0b2dnbGVNZW51KCk7XG5cdH07XG5cblx0XG5cdHRoaXMuaGlkZSA9IGZ1bmN0aW9uKCl7XG5cdFx0dG9nZ2xlTWVudS5jYWxsKCdoaWRlJyk7XG5cdH07XG5cblxuXHR0aGlzLnNob3cgPSBmdW5jdGlvbigpe1xuXHRcdHRvZ2dsZU1lbnUuY2FsbCgnc2hvdycpO1xuXHR9O1xuXG5cdHRoaXMub24gPSBldmVudHNIYW5kbGVyO1xuXG5cdHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoIV9pbml0aWFsaXplZCl7XG5cdFx0XHRpbml0aWFsaXplKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNob3dFcnJvcihgTlZKU19NZW51IGluaXRpYWxpemF0aW9uIGVycm9yLiBOVkpTX01lbnUgYWxyZWFkeSBpbml0aWFsaXplZGAsICdlcnJvcicpO1xuXHRcdH1cblx0fTtcblxuXHQoZnVuY3Rpb24gcGFyc2VDb25maWcoKSB7XG5cdFx0bGV0IHBhcnNlTWFzayA9IFtcblx0XHRcdFx0XHRcdFsnc3RyaW5nJywgYE5WSlNfTWVudSBpbml0aWFsaXphdGlvbiB3YXJuLiBIZWFkZXIgc2VsZWN0b3IgZG9lc24ndCBleGlzdC4gVHJ5IHVzZWQgZGVmYXVsdC5gXSwgXG5cdFx0XHRcdFx0XHRbJ29iamVjdCcsIGBOVkpTX01lbnUgaW5pdGlhbGl6YXRpb24gd2Fybi4gQ29uZmlndXJhdGlvbiBkb2Vzbid0IGV4aXN0LiBUcnkgdXNlZCBkZWZhdWx0LmBdLCBcblx0XHRcdFx0XHRcdFsnYm9vbGVhbiddXVxuXG5cblx0XHRsZXQgZXJyb3JBcnIgPSBbXTtcblx0XHRsZXQgcGFyc2luZ0RhdGEgPSBbXTtcblx0XHRsZXQgZmFjdG9yeVBhcnNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZmFjdG9yeSwgMCwgcGFyc2VNYXNrLmxlbmd0aCk7XG5cdFx0XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwYXJzZU1hc2subGVuZ3RoOyBpKyspe1xuXHRcdFx0aWYocGFyc2VNYXNrW2ldWzBdID09IGNoZWNrVHlwZShmYWN0b3J5UGFyc2VbMF0pKXtcblxuXHRcdFx0XHRwYXJzaW5nRGF0YS5wdXNoKGZhY3RvcnlQYXJzZS5zaGlmdCgpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRwYXJzaW5nRGF0YS5wdXNoKHVuZGVmaW5lZClcblx0XHRcdFx0ZXJyb3JBcnIucHVzaChwYXJzZU1hc2tbaV1bMV0pXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHBhcnNpbmdEYXRhLnBvcCgpID09IHRydWUpe1xuXHRcdFx0bG9nRXJyb3JzID0gdHJ1ZTtcblx0XHRcdGVycm9yQXJyLmZvckVhY2goZXJyb3JNZXNzYWdlID0+IHNob3dFcnJvcihlcnJvck1lc3NhZ2UpKVxuXHRcdH1cblxuXHRcdHBhcnNlRGF0YS5jYWxsKHBhcnNpbmdEYXRhWzBdLCBwYXJzaW5nRGF0YVsxXSlcblxuXHR9KSgpO1xuICBcbn0iXSwiZmlsZSI6Ik5WSlNfTWVudS5qcyJ9
