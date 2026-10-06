// Fail closed BEFORE effects. These names are requests, not hidden host adapters.
export const HOST_REQUESTS=Object.freeze({
 'vengefulspirit_nether_swap':'A-PORT-01: atomic two-actor swap plus target interruption',
 'kunkka_x_marks_the_spot':'A-STAGE-02: effective status expiry before removal and bounded return motion',
 'bloodseeker_rupture':'A-STAGE-03: pre-status-advance movement observation',
 'lich_sinister_gaze':'A-PORT-04: channel action lock and bounded pull policy',
 'death_prophet_exorcism':'A-PORT-05: host-owned returning spirit contact/expiry lifecycle',
 'death_prophet_spirit_siphon':'A-PORT-14: accepted native spirit-link handle and per-step leash/death lifecycle',
 'dragon_knight_elder_dragon_form':'A-PORT-06: temporary attack and ability range profile'
});
export class HostPortRequired extends Error{constructor(abilityId){super(HOST_REQUESTS[abilityId]);this.name='HostPortRequired';this.abilityId=abilityId;}}
