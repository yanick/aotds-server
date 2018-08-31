import { AsyncNodeStorage } from 'redux-persist-node-storage';

const storage = new AsyncNodeStorage( './battle_store');

import Battle from 'aotds-battle';

// TODO: the games will get corrupted if there is ever more than
// one thread

// TODO unload old battles
const battles = {}; 

export async function get_battle( name, create = true ) {

    if(!create) {
        let x = await storage.getItem('persist:' + name);
        if(!x) return null;
    }

    if(!battles[name]) {
        battles[name] = new Battle({ persist: {
            key:name, storage
        }})
    }

    return battles[name].persistReady;
}
