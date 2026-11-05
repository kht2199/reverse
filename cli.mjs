#!/usr/bin/env node
// SQLite and parser modules load only after a friendly, explicit version check.
const minimum=[24,0,0],version=process.version.replace(/^v/,'').split('.').map(Number);
const supported=version[0]>minimum[0]||version[0]===minimum[0]&&(version[1]>minimum[1]||version[1]===minimum[1]&&version[2]>=minimum[2]);
if(!supported){process.stderr.write('reverse requires Node.js >=24.0.0 (including --help); current '+process.version+'\n');process.exitCode=1;}else await import('./cli-main.mjs');
