NVJS_Menu
==========

<!-- [![Greenkeeper badge](https://badges.greenkeeper.io/nolimits4web/Swiper.svg)](https://greenkeeper.io/) -->

NVJS_Menu - is the free and responsive menu script, which used for creating open/close menu and set events on it.

- **No dependencies**
- All modern browsers are supported
- Fully **responsive**

NVJS_Menu is not compatible with all platforms, because it used ES6. it is a modern menu which is focused only on modern apps/platforms to bring the best experience and simplicity.

<!-- _Read documentation in other languages:_
[_Русский_](documentation/README.ru-Ru.md) -->

# Supported Browsers

 - Edge
 - Chrome
 - Safari
 - Mobile Safari
 - Android Default Browser

# Dist / Build

Dist / Build description is available on [Dist / Build documentation](documentation/build.md).

# API

API description is available on [API documentation](documentation/api.md).



# Get Started

## Include NVJS_Menu Files To Website/App

```html
<!DOCTYPE html>
<html lang="en">
<head>
    ...
    <link rel="stylesheet" href="path/to/NVJS_Menu.css">
</head>
<body>
    ...
    <script src="path/to/NVJS_Menu.js"></script>
</body>
</html>
```


## Add NVJS_Menu HTML Layout

```html
<header class="header">
  <div class="header__wrapper">
    <a class="header__logo" href="/">Logo</a>
    <nav class="header__menu">
        <li class="header__menu__item">
            <a class="header__menu__link" href="/">
                Example 
            </a>
        </li>
        <li class="header__menu__item">
            <a class="header__menu__link" href="/">
                Example 
            </a>
        </li>
        <li class="header__menu__item">
            <a class="header__menu__link" href="/">
                Something Else 
            </a>
        </li>
    </nav>
    <div class="hamburger">
        <div class="hamburger__item"></div>
    </div>
  </div>
</header>
```

## Initialize NVJS_Menu

```js
let menu = new NVJSMenu('.header',{
	menuShowButtons: '.hamburger',
	menu: '.header__menu',
	menuOpenClass: 'open',
	autoInitialize: true,
	lockBody: true,
	on: {
		initialized: () => {
            console.log('initialized')
        },
		toggle: {
			elements: ['header', 'menuShowButtons', 'menu',
			activeClass: 'open',
			addClass: true
		},
		scroll: {
			sensivity: 20,
			activeClass: 'scrolled',
			addClass: true
		},
		scrollToTop: {
			activeClass: 'scrolledToTop',
		},
		scrollToBottom: {
			activeClass: 'scrolledToBottom',
		}
	}
}, true);
```


# Changelog

Changelog is available on [Changelog documentation](documentation/changelog.md).


# License

 NVJS_Menu is licensed [WTFPL](http://www.wtfpl.net/about/). You can use it **for free** and **without any attribution**, in any personal or commercial project. You may also fork the project and re-release it under another license you prefer.
