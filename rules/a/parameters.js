/** Current behavior settings. Every consumed execution setting is factory JSON. */
export const A_PARAMETERS=Object.freeze({adaptation:'author-a-v8',unitScale:.55,statusToggleSeconds:3600,routedDeliveryRange:1200});
export function executionParameters(parameters){
 if(!parameters||Object.keys(parameters).sort().join(',')!==Object.keys(A_PARAMETERS).sort().join(',')||parameters.adaptation!=='author-a-v8'||parameters.unitScale!==.55||parameters.statusToggleSeconds!==3600||parameters.routedDeliveryRange!==1200)throw Error('A_INVALID_EXECUTION_PARAMETERS');
 return parameters;
}
