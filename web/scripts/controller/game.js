var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Bot from "../bot.js";
import GameManager, { Role } from "../gameManager.js";
import getRandomUsername from "../usernames.js";
import PlayerAvatar from "../webComponents/PlayerAvatars.js";
import * as endpoint from "./endpoint.js";
console.log("Welcome to OpenDurak!");
const loginModal = document.getElementById("loginModal");
const usernameInput = document.getElementById("usernameInput");
const usernameInfo = document.getElementById("usernameInfo");
const joinButton = document.getElementById("joinButton");
const playerListElement = document.getElementById("playerListElement");
const startGameButton = document.getElementById("startGameButton");
const endTurnButton = document.getElementById("endTurnButton");
const actionText = document.getElementById("actionText");
const botsSelect = document.getElementById("botsSelect");
const deckNr = document.getElementById("deckNr");
const trumpContainer = document.getElementById("trumpContainer");
const playerListContainer = document.getElementById("playerListContainer");
const avatarContainer = document.getElementById("avatarContainer");
const lobbyId = window.location.href.replace(/^[^#]*#*/, "");
const bots = [];
let gameManager = null;
let username = null;
let userId = null;
let playerList = [];
if (!lobbyId) {
    window.location.href = "./index.html";
}
usernameInput.value = getRandomUsername();
joinButton === null || joinButton === void 0 ? void 0 : joinButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const inputUsername = usernameInput.value.trim();
    if (inputUsername.length < 5) {
        usernameInfo.textContent = "The username has to be at least 5 characters long!";
    }
    else if (!inputUsername.match("^[A-Za-z0-9]*$")) {
        usernameInfo.textContent = "The username can only contain letters and numbers!";
    }
    else {
        username = inputUsername;
        usernameInfo.textContent = "loading...";
        console.log(`join '${lobbyId}' as '${username}'`);
        const response = yield fetch(endpoint.joinLobby(lobbyId, username), {
            method: "post",
        });
        if (response.status !== 200) {
            usernameInfo.textContent = yield response.text();
        }
        else {
            const responseText = yield response.text();
            userId = responseText.substring(1, responseText.length - 1);
            console.log(`logged in with id '${userId}'`);
            gameManager = new GameManager(userId, lobbyId);
            createLobbySocket();
            loginModal.hidden = true;
            createGameStateSocket();
            playerListContainer.style.display = "";
        }
    }
    const botNr = (_a = parseInt(botsSelect.value, 10)) !== null && _a !== void 0 ? _a : 0;
    for (let index = 0; index < botNr; index++) {
        bots.push(new Bot(lobbyId));
    }
}));
function createLobbySocket() {
    if (!userId)
        return;
    const socket = new WebSocket(endpoint.lobbySocket(lobbyId, userId));
    socket.addEventListener("open", () => {
        console.log("opened lobby websocket!");
    });
    socket.addEventListener("message", ({ data }) => {
        if (data) {
            try {
                playerList = JSON.parse(data);
                fillPlayerListElement(playerList);
            }
            catch (error) {
                console.error("could not parse playerList!");
            }
        }
    });
    socket.addEventListener("error", (event) => {
        console.log("error: ", event);
    });
    socket.addEventListener("close", (event) => {
        console.log("connection closed: ", event);
        window.location.href = "./index.html";
    });
}
function fillPlayerListElement(players, gameState = null) {
    playerListElement.innerHTML = "";
    for (const player of players) {
        const playerElement = document.createElement("h3");
        if (typeof player === "string" || player instanceof String) {
            playerElement.append(player);
        }
        else {
            const playerObj = player;
            if (gameState) {
                if (playerObj.hash === gameState.attackerHash) {
                    playerElement.classList.add("attacker");
                    if (gameState.attackGaveUp) {
                        playerElement.classList.add("gaveUp");
                    }
                }
                else if (playerObj.hash === gameState.defenderHash) {
                    playerElement.classList.add("defender");
                    if (gameState.defenderGaveUp) {
                        playerElement.classList.add("gaveUp");
                    }
                }
                else if (playerObj.hash === gameState.helperHash) {
                    playerElement.classList.add("helper");
                    if (gameState.helperGaveUp) {
                        playerElement.classList.add("gaveUp");
                    }
                }
            }
            playerElement.append(`${playerObj.username} (${playerObj.cardCount})`);
        }
        playerListElement.appendChild(playerElement);
    }
}
function addPlayerAvatars(players, gameState) {
    avatarContainer.innerHTML = "";
    const playerIndex = players.findIndex((player) => { var _a; return player.hash === ((_a = gameState.selfPlayer) === null || _a === void 0 ? void 0 : _a.hash); });
    if (playerIndex > 0) {
        players.push(...players.splice(0, playerIndex));
    }
    const slice = (Math.PI * 2) / players.length;
    let angle = Math.PI / 2;
    for (const player of players) {
        const playerAvatar = new PlayerAvatar(player, gameState, angle);
        avatarContainer.appendChild(playerAvatar);
        angle += slice;
    }
}
startGameButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    if (playerList.length < 2 || !userId)
        return;
    const response = yield fetch(endpoint.startGame(lobbyId, userId), {
        method: "post",
    });
    if (response.status !== 200) {
        console.error(yield response.text());
    }
    else {
        startGameButton.hidden = true;
    }
}));
endTurnButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId)
        return;
    if ((gameManager === null || gameManager === void 0 ? void 0 : gameManager.role) === Role.Defender &&
        gameManager.cardManager.battleFieldCardElements.some((cardElementPair) => !cardElementPair.second)) {
        gameManager.cardManager.takeAllCards = true;
    }
    const response = yield fetch(endpoint.giveUp(lobbyId, userId), {
        method: "post",
    });
    if (response.status !== 200) {
        console.error(yield response.text());
    }
    else {
        actionText.textContent = "Ended Your Turn!";
    }
}));
function createGameStateSocket() {
    if (!userId)
        return;
    const socket = new WebSocket(endpoint.gameStateSocket(lobbyId, userId));
    socket.addEventListener("open", () => {
        console.log("opened gameState websocket!");
    });
    socket.addEventListener("message", ({ data }) => {
        if (data && data !== "null") {
            startGameButton.hidden = true;
            try {
                const gameState = JSON.parse(data);
                console.log("GameState", gameState);
                gameManager === null || gameManager === void 0 ? void 0 : gameManager.updateGameState(gameState);
                fillPlayerListElement(gameState.players, gameState);
                addPlayerAvatars(gameState.players, gameState);
                deckNr.textContent = `(${gameState.stackCount})`;
                trumpContainer.style.display = "";
                if (gameState.gameFinished) {
                    startGameButton.hidden = false;
                    trumpContainer.style.display = "none";
                    actionText.textContent = "Game Finished! ";
                    if (gameState.players.length === 1) {
                        actionText.textContent += ` ${gameState.players[0].username} is DURAK!`;
                    }
                }
            }
            catch (error) {
                console.error("could not parse gameState!");
            }
        }
        else {
            startGameButton.hidden = false;
            trumpContainer.style.display = "none";
        }
    });
    socket.addEventListener("error", (event) => {
        console.log("error: ", event);
    });
    socket.addEventListener("close", (event) => {
        console.log(`connection closed because: '${event.reason}'`);
        window.location.href = "./index.html";
    });
}
