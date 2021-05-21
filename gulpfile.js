const gulp = require('gulp');
const log = require('fancy-log');
const pp = require('preprocess');
const gap = require('gulp-append-prepend');
const map = require('map-stream');
const fs = require('fs');

gulp.task('watch', function() {
    gulp.watch(['src/**/*', 'gulpfile.js'], function(d) {
        logFile(getFile(d));
    });

    gulp.watch('gulpfile.js', exit);

    gulp.watch(['src/*.txt', 'src/*.jpg'], gulp.series('build-misc'));
    gulp.watch('src/**/*.lua', gulp.series('build-lua'));
});

gulp.task('build-misc', function(e) {
    var src = ['src/*.txt', 'src/*.jpg', 'src/*.lua', '!src/main.lua'];
    var build = 'build/';

    return gulp.src(src)
        .pipe(gulp.dest(build));
});

gulp.task('build-lua', async function(e) {
    let prependText = `-- *********************\n-- This file is not the original source!\n-- The source for this file can be found at <github repo>\n-- *********************\n--\n--`;

    let srcDir = "src/";
    let src = "src/" + "main.lua";
    let build = "build/";

    gulp.src(src)
        .pipe(gap.prependText(prependText))
        .pipe(map(function(file, cb) {

            var fileContents = file.contents.toString();
            // --- do any string manipulation here ---
            fileContents = pp.preprocess(fileContents, process.env, {type: 'lua', srcDir: srcDir});
            // ---------------------------------------
            file.contents = Buffer.from(fileContents);
            cb(null, file);
        }))
        .pipe(gulp.dest(build));
});


async function exit() {
    process.exit();
}


function logFile(t) {
    if (t) {
        console.log("File " + t + " changed.");
    } else {
        console.log(t);
    }
}

function getFile(d) {
    var fileChanged = "";
    var path, last;

    if (d.path) {
        path = d.path;
        last = path.lastIndexOf("\\") + 1;
        fileChanged = path.substr(last, path.length);
    }

    return fileChanged;
}

gulp.task('default', gulp.series('build-misc', 'build-lua', 'watch'));
gulp.task('build-only', gulp.series('build-misc', 'build-lua'));