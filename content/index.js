import definitions from './heroes.json' with {type:'json'};
export function freezeTree(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freezeTree);Object.freeze(v);}return v;}
export const heroes=freezeTree(definitions);
