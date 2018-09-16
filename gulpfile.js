'use strict';

const gulp = require('gulp');

// ----------   operations with files   ----------
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const path = require('path');

const browserSync = require('browser-sync'); /*(install global)*/
const gutil = require( 'gulp-util' );


// ----------   operations with styles   ----------
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');


// ----------   operations with scripts   ----------
let uglify = require('gulp-uglify-es').default;


// ----------   operations with pagess   ----------
const pug = require('gulp-pug');

/*-********************************************************-*/
/*-                    ./require                           -*/
/*-********************************************************-*/



/*-********************************************************-*/
/*-                     configurate                        -*/
/*-********************************************************-*/

const projectsFolder = '.';

global.variables = {};

try{
	require(projectsFolder + '/gulpConfig.js');
} 
catch(err){
	console.error('not such project folder');
	return false;
}

const preprocessor = global.variables.preprocessor || 'less';
const sourcePath = global.variables.sourcePath || '/';


const projectPath = projectsFolder + '/';
let destPath = projectPath;
let destSourcePath = projectsFolder + sourcePath;
let fontsPath;


/*-********************************************************-*/
/*-                     ./configurate                      -*/
/*-********************************************************-*/


gulp.task('default', ['watch']);


/*---------------------------------------------------------------------------*
 * sync
 *---------------------------------------------------------------------------*/



gulp.task('browser-sync', function() {
	browserSync({
		server:{
			baseDir: destPath
		},
		notify: false
	});
});


gulp.task('localDevelopment', function() {
	destPath += 'dev/';
	destSourcePath = projectsFolder + '/dev' + sourcePath;
});



gulp.task('watch', ['localDevelopment','pug', 'css', 'es', 'browser-sync'], function() {
	gulp.watch(projectPath + 'src/'+ preprocessor +'/**/*.less', ['css']);
	gulp.watch(projectPath + 'src/'+ preprocessor +'/**/*.scss', ['css']);
	gulp.watch(projectPath + 'src/es/**/*.js', ['es']);
	gulp.watch(projectPath + 'src/pug/**/*.pug', ['pug']);

	gulp.watch(destSourcePath +'js/**/*.js', browserSync.reload);
	gulp.watch(projectPath + '**/*.html', browserSync.reload);
	gulp.watch(projectPath + '**/*.php', browserSync.reload);
});


gulp.task('build', ['pug', 'buildcss', 'buildes']);

/*---------------------------------------------------------------------------*
 * ./sync
 *---------------------------------------------------------------------------*/


/*---------------------------------------------------------------------------*
 * styles
 *---------------------------------------------------------------------------*/

gulp.task('less', function() {
	return gulp
		.src(projectPath + 'src/less/*.less')
		.pipe(sourcemaps.init())
		.pipe(less()).on('error', gutil.log)
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 11'], {cascade: true}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(destSourcePath + 'css'))
		.pipe(browserSync.reload({stream: true}));
});


gulp.task('css',['less'], function() {
	return gulp
		.src([ './node_modules/normalize.css/normalize.css', projectPath + 'src/**/vendors/*.css', destSourcePath + 'css/main.css' ])
		.pipe(sourcemaps.init())
		.pipe(concat('common.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(destSourcePath + 'css'))
});

gulp.task('buildless', function() {
	return gulp
		.src(projectPath + 'src/less/*.less')
		.pipe(less()).on('error', gutil.log)
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 11'], {cascade: true}))
		.pipe(cssnano({
			reduceIdents: false
		}))
		.pipe(gulp.dest(destSourcePath + 'css'))
});


gulp.task('buildcss',['buildless'], function() {
	return gulp
		.src([ './node_modules/libs/normalize.css/normalize.css', projectPath + 'src/**/vendors/*.css', destSourcePath + 'css/main.css' ])
		.pipe(concat('common.css'))
		.pipe(cssnano({
			reduceIdents: false
		}))
		.pipe(gulp.dest(destSourcePath + 'css'))
});

/*---------------------------------------------------------------------------*
 * ./styles
 *---------------------------------------------------------------------------*/



/*---------------------------------------------------------------------------*
 * js
 *---------------------------------------------------------------------------*/

gulp.task('es',  function() {
	return gulp
		.src(projectPath + 'src/es/**/*.js')
		.pipe(gulp.dest(destSourcePath + 'js'))
});

gulp.task('buildes',  function() {
	return gulp
		.src(projectPath + 'src/es/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(destSourcePath + 'js'))
});

/*---------------------------------------------------------------------------*
 * ./js
 *---------------------------------------------------------------------------*/



/*---------------------------------------------------------------------------*
 * pages
 *---------------------------------------------------------------------------*/

gulp.task('pug',  function() {
	return gulp
		.src([projectPath + 'src/pug/**/*.pug', '!' + projectPath + 'src/pug/base_areas/*.pug', '!' + projectPath + 'src/pug/components/*.pug', '!' + projectPath + 'src/pug/contacts/*.pug', '!' + projectPath + 'src/pug/include_areas/*.pug', '!' + projectPath + 'src/pug/metrix/*.pug', '!' + projectPath + 'src/pug/sections/*.pug'])
		.pipe(pug({
			pretty: true
		}))
		.pipe(rename(function(file) {
			if(file.basename !== 'index'){
				/* if (file.dirname == '.'){ */
					file.dirname = path.join(file.dirname, file.basename);
					file.basename = 'index';
					file.extname = '.html';
				/* } */
			}
		  }))
		.pipe(gulp.dest(destPath))
});
/*---------------------------------------------------------------------------*
 * ./pages
 *---------------------------------------------------------------------------*/