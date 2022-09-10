import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
// import del from 'del';
import squosh from 'gulp-libsquoosh';
// import svgstore from 'gulp-svgstore';
import webpo from 'gulp-webp';
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
export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

export const libsquo = () => {
  return gulp.src(['source/img/catalog/*.jpg', '!source/img/catalog/*.png', '!source/img/index/*.jpg', '!source/img/index/*.png', '!source/img/vaficon/*.jpg', '!source/img/vaficon/*.png'])
  .pipe(webpo())
  .pipe(gulp.dest('build/img'));
}

export const webp = () => {
  return gulp.src(['source/img/catalog/*.jpg', '!source/img/catalog/*.png', '!source/img/index/*.jpg', '!source/img/index/*.png', '!source/img/vaficon/*.jpg', '!source/img/vaficon/*.png'])
  .pipe(squosh())
  .pipe(gulp.dest('build/webP'));
}

export const svg = () => {
  return gulp.src(['source/img/catalog/*.svg', '!source/img/index/*.svg', '!source/img/vaficon/*.svg', '!source/img/footer/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/svg'));
}

// export const dele = () => {
//   return del('build');
// };

// Scripts
export const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}
// Images

// WebP

// SVG

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
}


export default gulp.series(
  svg, webp, libsquo, script, html, styles, server, watcher
);
