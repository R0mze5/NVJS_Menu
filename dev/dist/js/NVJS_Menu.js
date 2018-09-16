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
				high : 0,
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
				
				let scrollForward = {
					scrollToTop: false,
					scrollToBottom: false
				};
				
				
				if(!_isScrolled &&  window.scrollY > 0){
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
					if(ypos == 0){
						setScrollEvent(false);
					} else if(ypos > 0){
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