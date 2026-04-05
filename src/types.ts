export interface Realm {
    id: number;
    name: string;
    expRequired: number;
}

export interface Item {
    id: string;
    name: string;
    description: string;
}

export interface GameState {
    exp: number;
    realmIndex: number;
    inventory: Record<string, number>;
    lastSave: number;
}

export interface Plugin {
    id: string;
    name: string;
    init: (core: any) => void;
    enable?: () => void;
    disable?: () => void;
}
