// SPDX-License-Identifier: MIT
import {createSwap} from './swap.mjs';import {createMark} from './mark.mjs';
import {createRupture} from './rupture.mjs';import {createGaze} from './gaze.mjs';
import {createExorcism} from './exorcism.mjs';import {createDragon} from './dragon.mjs';
const constructors=Object.freeze({vengefulspirit_nether_swap:createSwap,kunkka_x_marks_the_spot:createMark,bloodseeker_rupture:createRupture,lich_sinister_gaze:createGaze,death_prophet_exorcism:createExorcism,dragon_knight_elder_dragon_form:createDragon});
export function createExtensionDraft(definition){const create=constructors[definition.id];if(!create)throw Error('Not one of six owned extension skills');return create(definition);}
export const EXTENSION_ABILITIES=Object.freeze(Object.keys(constructors));
