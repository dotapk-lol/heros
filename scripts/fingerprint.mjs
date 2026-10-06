import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=fs.readdirSync(root,{recursive:true}).filter(file=>!file.includes('node_modules')&&file!=='rules/fingerprint.js'&&/\.(?:js|mjs|ts|json)$/.test(file)&&fs.statSync(path.join(root,file)).isFile()).sort();
const manifest=Object.fromEntries(files.map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
fs.writeFileSync(path.join(root,'rules/fingerprint.js'),'// Generated from actual package source files; no Function.toString identity.\nexport const sourceManifest='+JSON.stringify(manifest,null,2)+';\n');
