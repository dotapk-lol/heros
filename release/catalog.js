import entries from './catalog-status.json' with {type:'json'};
import {freezeTree} from '../content/index.js';
export const catalogStatus=freezeTree(entries);
export {heroes,releaseProfile,releasedHeroIds,isReleasedHero} from './index.js';
