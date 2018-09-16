# Dist / Build

On production use files (HTML, JS and CSS) only from `dist/` folder, there will be the most stable versions, `dev/` folder is only for development purpose

## Development Build

NVJS_Menu uses `gulp` to build a development (dev) and production (dist) versions.

First you need to have `gulp-cli` which you should install globally.

```
$ npm install --global gulp
```

Then install all dependencies, in repo's root:

```
$ npm install
```

And build development version of Swiper:
```
$ npm run build:dev
```

The result is available in `build/` folder.

## Production Build

```
$ npm run build:prod
```

Production version will available in `dist/` folder.

