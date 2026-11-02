'use strict';

// Public URLs are independent of the source directory layout.
const shell = Object.freeze([
 './', './index.html', './app.bundle.js', './broadcast.css', './premium-v267.css',
 './live-clock-v268b.css', './live-substitutions-v268c.css', './live-pitch-v268d.css',
 './live-events-v268e.css', './premium-v2614.css', './analytics-v2616.css', './stitch-v2617.css',
 './assets/ms-emblem-mark.png', './assets/match-studio-gold-brand.png',
 './assets/match-studio-brand-preview.png', './assets/match-studio-blue-violet-brand.png',
 './fonts/outfit-variable.ttf', './fonts/plus-jakarta-sans-variable.ttf',
 './fonts/outfit-OFL.txt', './fonts/plus-jakarta-sans-OFL.txt',
 './manifest.webmanifest', './device-test.html', './device-test.js',
 './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
]);
const runtimeFiles = Object.freeze([...new Set(shell.filter(url => url !== './').map(url => url.slice(2)))]);
// All relative server dependencies must travel with an extracted PWA archive.
const serverFiles = Object.freeze(['tools/serve.cjs', 'tools/runtime-files.cjs', 'tools/security-headers.cjs']);
module.exports = {shell, runtimeFiles, serverFiles};
