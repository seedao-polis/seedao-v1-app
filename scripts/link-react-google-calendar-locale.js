/**
 * @ericz1803/react-google-calendar 的预打包 dist 内含 moment 的 require("./locale/" + name)，
 * 但包内未带 locale 目录；pnpm 下 webpack 会报 Can't resolve './locale'。
 * 将 dist/locale 指向已安装的 moment/locale（需将 moment 列为直接依赖以便 resolve）。
 */
const fs = require('fs');
const path = require('path');

function main() {
  let calRoot;
  let momentLocaleDir;
  try {
    const calEntry = require.resolve('@ericz1803/react-google-calendar');
    calRoot = path.join(path.dirname(calEntry), '..');
    momentLocaleDir = path.join(path.dirname(require.resolve('moment')), 'locale');
  } catch (e) {
    console.warn('[link-react-google-calendar-locale] skip:', e.message);
    return;
  }
  const distLocale = path.join(calRoot, 'dist', 'locale');
  try {
    if (fs.existsSync(distLocale)) {
      fs.rmSync(distLocale, { recursive: true, force: true });
    }
    fs.symlinkSync(momentLocaleDir, distLocale, 'dir');
    console.log('[link-react-google-calendar-locale] ok:', distLocale, '->', momentLocaleDir);
  } catch (e) {
    console.warn('[link-react-google-calendar-locale] failed:', e.message);
  }
}

main();
