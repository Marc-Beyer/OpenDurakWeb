const tls = false;

const mode = tls ? "s" : "";
const baseUrl = `http${mode}://localhost:8080`;
const baseUrlSocket = `ws${mode}://localhost:8080`;

export const alive = `${baseUrl}/alive`;
export const lobby = `${baseUrl}/lobby`;

export function joinLobby(lobbyId: string): string {
    return `${baseUrl}/lobby/${lobbyId}/join`;
}

export function startGame(lobbyId: string): string {
    return `${baseUrl}/lobby/${lobbyId}/game/start`;
}

/** Moves Endpoints */

export function attack(lobbyId: string): string {
    return `${baseUrl}/lobby/${lobbyId}/game/attack`;
}

export function help(lobbyId: string): string {
    return `${baseUrl}/lobby/${lobbyId}/game/help`;
}

export function defend(lobbyId: string): string {
    return `${baseUrl}/lobby/${lobbyId}/game/defend`;
}

export function giveUp(lobbyId: string): string {
    return `${baseUrl}/lobby/${lobbyId}/game/giveUp`;
}

/** WebSocket Endpoints */

export function lobbySocket(lobbyId: string, userId: string) {
    return `${baseUrlSocket}/lobby/${lobbyId}/listenLobby?userId=${userId}`;
}

export function gameStateSocket(lobbyId: string, userId: string) {
    return `${baseUrlSocket}/lobby/${lobbyId}/game/listenGameState?userId=${userId}`;
}
