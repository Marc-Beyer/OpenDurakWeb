const tls = true;
const mode = tls ? "s" : "";
const baseUrl = `http${mode}://opendurak.pascaldornfeld.de:443`;
const baseUrlSocket = `ws${mode}://opendurak.pascaldornfeld.de:443`;
export const alive = `${baseUrl}/alive`;
export const lobby = `${baseUrl}/lobby`;
export function joinLobby(lobbyId, username) {
    return `${baseUrl}/lobby/${lobbyId}/join?username=${username}`;
}
export function startGame(lobbyId, userId) {
    return `${baseUrl}/lobby/${lobbyId}/game/start?userId=${userId}`;
}
/** Moves Endpoints */
export function attack(lobbyId, userId) {
    return `${baseUrl}/lobby/${lobbyId}/game/attack?userId=${userId}`;
}
export function help(lobbyId, userId) {
    return `${baseUrl}/lobby/${lobbyId}/game/help?userId=${userId}`;
}
export function defend(lobbyId, userId) {
    return `${baseUrl}/lobby/${lobbyId}/game/defend?userId=${userId}`;
}
export function giveUp(lobbyId, userId) {
    return `${baseUrl}/lobby/${lobbyId}/game/giveUp?userId=${userId}`;
}
/** WebSocket Endpoints */
export function lobbySocket(lobbyId, userId) {
    return `${baseUrlSocket}/lobby/${lobbyId}/listenLobby?userId=${userId}`;
}
export function gameStateSocket(lobbyId, userId) {
    return `${baseUrlSocket}/lobby/${lobbyId}/game/listenGameState?userId=${userId}`;
}
