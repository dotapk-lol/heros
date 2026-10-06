import {sourceManifest} from '../rules/fingerprint.js';
import {canonical,sha256,freeze} from './value.js';
export function codeIdentity(sourceFiles){
 if(!Array.isArray(sourceFiles)||!sourceFiles.length||new Set(sourceFiles).size!==sourceFiles.length||sourceFiles.some(path=>typeof path!=='string'||!Object.hasOwn(sourceManifest,path)))throw Error('Unknown reviewed implementation source');
 const files=[...sourceFiles].sort(),inputs=files.map(path=>({path,sha256:sourceManifest[path]}));
 return freeze({sourceFiles:files,codeHash:sha256(canonical(inputs))});
}
export function assertCodeIdentity(value){const identity=codeIdentity(value.sourceFiles);if(value.codeHash!==identity.codeHash)throw Error('Missing or mismatched implementation digest');return identity;}
export const coreCodeIdentity=()=>codeIdentity(Object.keys(sourceManifest).filter(path=>path.startsWith('contract/')||path==='index.js'));
