import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import {deleteAsync} from 'del';
import squosh from 'gulp-libsquoosh';
import terser from 'gulp-terser';
// import svgstore from 'gulp-svgstore';
// import webpo from 'gulp-webp';
import svgo from 'gulp-svgmin';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true }) // 1 состояние - найди файл
    .pipe(plumber()) // обработка ошибок
    .pipe(less()) // style.less -> style.css (библиотека gulp-less)
    .pipe(postcss([ // библиотека автопрефиксов (autoprefixer)
      autoprefixer(),
      csso() // получаем минифицированный файл css
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' })) // 3 состояние - куда положить файл
    .pipe(browser.stream());
}

// Создание сборки (HTML)
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

const libsquo = () => {
  return gulp.src('source/img/**/*.{jpg,png}') // ** - зайди во все папки; {jpg, png} - найди форматы из скобок; пробелов ни до скобок, ни внутри быть не должно
    .pipe(squosh())
    .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}') // ** - зайди во все папки; {jpg, png} - найди форматы из скобок; пробелов ни до скобок, ни внутри быть не должно
    .pipe(gulp.dest('build/img'));
}

const webp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'));
}

const svg = () => {
  return gulp.src('source/img/**/*.svg') // ['source/img/**/*.svg', '!source/img/index/*.svg'] - ! говорит, что сюда лезть не нужно
    // return gulp.src(['source/img/kek/*.svg', 'source/img/kek2/*.svg', 'source/img/kek3/*.svg']) - зайди только в массив из 3-х папок
    .pipe(svgo())
    .pipe(gulp.dest('build/svg'));
}

// Scripts
const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}

// шрифты и фав-иконки (возьми и перенеси в build)
const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2, woff}',
    'source/*.ico'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}
// почистить папку build, если в source были какие-то удаления

const dele = () => {
  return del('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
  gulp.watch('source/js/script.js', gulp.series(script));
}

// описываем билд, чтобы каждый раз не прописывать все задачи
// задачи выполняются последовательно
// версия для production

export const build = gulp.series(
  dele,
  copy,
  libsquo,
  gulp.parallel( // выполняются параллельно
    styles,
    html,
    script,
    webp,
    svg
  )
);

// версия для разработки
// запускается 'gulp' из package.json (npm run start - "start": "npx gulp")

export default gulp.series(
  dele,
  copy,
  copyImages, // копируем картинки, а не оптимизируем
  gulp.parallel( // выполняются параллельно
    styles,
    html,
    script,
    webp,
    svg
  ),
  gulp.series(
    server,
    watcher
  )
);


// export default gulp.series(
//   libsquo, script, html, styles, server, watcher
// );


// ОБРАЗЕЦ

// import gulp from 'gulp';
// import plumber from 'gulp-plumber';
// import less from 'gulp-less';
// import postcss from 'gulp-postcss';
// import autoprefixer from 'autoprefixer';
// import csso from 'postcss-csso';
// import rename from 'gulp-rename';
// import terser from 'gulp-terser';
// import squoosh from 'gulp-libsquoosh';
// import svgo from 'gulp-svgmin';
// import svgstore from 'gulp-svgstore';
// import del from 'del';
// import browser from 'browser-sync';

// // Styles

// export const styles = () => {
// return gulp.src('source/less/style.less', { sourcemaps: true })
// .pipe(plumber())
// .pipe(less())
// .pipe(postcss([
// autoprefixer(),
// csso()
// ]))
// .pipe(rename('style.min.css'))
// .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
// .pipe(browser.stream());
// }

// // HTML

// const html = () => {
// return gulp.src('source/*.html')
// .pipe(gulp.dest('build'));
// }

// // Scripts

// const scripts = () => {
// return gulp.src('source/js/script.js')
// .pipe(gulp.dest('build/js'))
// .pipe(browser.stream());
// }

// // Images

// const optimizeImages = () => {
// return gulp.src('source/img/**/*.{png,jpg}')
// .pipe(squoosh())
// .pipe(gulp.dest('build/img'))
// }

// const copyImages = () => {
// return gulp.src('source/img/**/*.{png,jpg}')
// .pipe(gulp.dest('build/img'))
// }

// // WebP

// const createWebp = () => {
// return gulp.src('source/img/**/*.{png,jpg}')
// .pipe(squoosh({
// webp: {}
// }))
// .pipe(gulp.dest('build/img'))
// }

// // SVG

// const svg = () =>
// gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
// .pipe(svgo())
// .pipe(gulp.dest('build/img'));

// const sprite = () => {
// return gulp.src('source/img/icons/*.svg')
// .pipe(svgo())
// .pipe(svgstore({
// inlineSvg: true
// }))
// .pipe(rename('sprite.svg'))
// .pipe(gulp.dest('build/img'));
// }

// // Copy

// const copy = (done) => {
// gulp.src([
// 'source/fonts/*.{woff2,woff}',
// 'source/*.ico',
// ], {
// base: 'source'
// })
// .pipe(gulp.dest('build'))
// done();
// }

// // Clean

// const clean = () => {
// return del('build');
// };

// // Server

// const server = (done) => {
// browser.init({
// server: {
// baseDir: 'build'
// },
// cors: true,
// notify: false,
// ui: false,
// });
// done();
// }

// // Reload

// const reload = (done) => {
// browser.reload();
// done();
// }

// // Watcher

// const watcher = () => {
// gulp.watch('source/less/**/*.less', gulp.series(styles));
// gulp.watch('source/js/script.js', gulp.series(scripts));
// gulp.watch('source/*.html', gulp.series(html, reload));
// }

// // Build

// export const build = gulp.series(
// clean,
// copy,
// optimizeImages,
// gulp.parallel(
// styles,
// html,
// scripts,
// svg,
// sprite,
// createWebp
// ),
// );

// // Default

// export default gulp.series(
// clean,
// copy,
// copyImages,
// gulp.parallel(
// styles,
// html,
// scripts,
// svg,
// sprite,
// createWebp
// ),
// gulp.series(
// server,
// watcher
// ));
