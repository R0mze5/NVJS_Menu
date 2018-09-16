# API

## Initialize NVJS_Menu

``` js
// initialize swiper:
new NVJS_Menu()

// initialize swiper with options:
new NVJS_Menu(menuContainer, parameters, logErrors);
```

- `menuContainer` - string (with CSS Selector) of NVJS_Menu container HTML element. Optional. On default use `'.header'`;
- `parameters` - object with NVJS parameters. Optional;
- `logErrors` - boolean - which allow to log all Errors and Warnings in console, if it's `true`. Optional. On default `false`.


## NVJS_Menu Parameters


**example:**
``` js
new NVJS_Menu({
    menuShowButtons: '.hamburger',
    menu: '.header__menu'
})
``` 

> **`menuShowButtons`** \
> Used for set `toggle menu` on click this elements. May be string (with CSS Selector) or Array of strings (with CSS Selector) \
> **type**  `String` or `Array` \
> **default**  `'.hamburger'`

> **`menu`** \
> String with toggling menu CSS Selector \
> **type**  `String`\
> **default**  `'.header__menu'`

> **`menuOpenClass`** \
> CSS class name added to header elements when it becomes opened \
> **type**  `String`\
> **default**  `'open'`

> **`autoInitialize`** \
> Whether NVJS_Menu should be initialised automatically when you create an instance. If disabled, then you need to init it manually by calling myMenu.initialize() \
> **type**  `Boolean`\
> **default**  `true`

> **`lockBody`** \
> If enable, you can't scroll body, while menu is openned \
> **type**  `Boolean`\
> **default**  `true`

> **`on`** \
> Register and control event handlers \
> **type**  `Object`\
> **default**  `{}`

### NVJS_Menu .on Parameters

_List of events avaliable bellow in paragraph 'Events'_

**example:**
``` js
new NVJS_Menu({
    on: {
        toggle: () => {
            console.log('toggle')
        },
        scroll: {
            'someKey': 'anyValue',
            callingFunction: () => {
                console.log('scroll')
            } 
        },
    }
}); 
```
`toggle` and `scroll` - event names. Event Values May be:
- `boolean` - if true, events will dispatch
- `function` - events will dispatch and function will call, when event send
- `object` - events will dispatch and event may me configurated

#### common Parameters for object type

> **`enable`** \
> If enable, events will dispatch \
> **type**  `Boolean`

> **`addClass`** \
> If enable, activeClass will add to the header \
> **type**  `Boolean`

> **`activeClass`** \
> CSS class name added to header when the event happened \
> **type**  `string`

> **`callingFunction`** \
> JS function called when the event happened\
> **type**  `Boolean`

#### toggle special Parameters

> **`elements`** \
> Used for set `toggle menu` on click this elements. May be string with `'header'`, `'menuShowButtons'``, 'menu'` or Array of strings. Last param in Array may be array with CSS selectors.\
> **type**  `String` or `Array` \
> **avaliable**  `'header'`, `'menuShowButtons'``, 'menu'` and `Array` with CSS selectors\
> **default**  `['header', 'menuShowButtons', 'menu']`

#### scroll special Parameters

> **`sensivity`** \
> Count of pixels which user must scrolled in 300ms to 'scrolled' event happend \
> **avaliable**  `'low'` (40), `'medium'` (20), `'high'` (0) or `Number`\
> **default**  `medium`


## NVJS_Menu Methods & Properties


**example:**
``` js
    let myMenu = new NVJS_Menu();
    myMenu.open()
``` 

> **`.initialize();`** \
> Initialize NVJS_Menu if autoinitialize false in config 

> **`.toggle();`** \
> Hide menu  menu if it was open and conversely

> **`.hide();`** \
> Hide menu 

> **`.show();`** \
> Open menu 

> **`.header;`** \
> Header Element

## Events

 - Using **_`on`_** parameter on initialization:
**example:**
``` js
new NVJS_Menu({
    on: {
        toggle: () => {
            console.log('toggle')
        },
        scroll: () => {
            console.log('scroll')
        }
    }
});
```
 - Using **_`on`_** parameter on initialization, if you want config events:
**example:**
``` js
new NVJS_Menu({
    on: {
        toggle: {
            'someKey': 'anyValue',
            callingFunction: () => {
                console.log('toggle')
            } 
        },
        scroll: {
            'someKey': 'anyValue',
            callingFunction: () => {
                console.log('scroll')
            } 
        },
    }
}); 
```
- Using **_`on`_** parameter after initialization:
**example:**
``` js
    let myMenu = new NVJS_Menu();
    myMenu.on('ready', () => {
        console.log('ready')
    })
``` 


> **`ready`** \
> When swiper ready, but not set Events and wait initialization

> **`initialize`** \
> When swiper initialized

> **`open`** \
> When menu is open

> **`hide`** \
> When menu is hide

> **`scroll`** \
> When menu scroll

> **`scrollToTop`** \
> When menu scroll to top

> **`scrollToBottom`** \
> When menu scroll to bottom
