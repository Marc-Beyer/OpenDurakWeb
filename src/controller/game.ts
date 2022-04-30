import Bot from "../bot.js";
import GameManager, { Role } from "../gameManager.js";
import { GameState, Player } from "../interfaces.js";
import getRandomUsername from "../usernames.js";
import PlayerAvatar from "../webComponents/PlayerAvatars.js";
import * as endpoint from "./endpoint.js";

console.log("Welcome to OpenDurak!");

const loginModal = document.getElementById("loginModal") as HTMLDivElement;
const usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
const usernameInfo = document.getElementById("usernameInfo") as HTMLParagraphElement;
const joinButton = document.getElementById("joinButton") as HTMLButtonElement;
const playerListElement = document.getElementById("playerListElement") as HTMLDivElement;

const startGameButton = document.getElementById("startGameButton") as HTMLButtonElement;
const endTurnButton = document.getElementById("endTurnButton") as HTMLButtonElement;
const actionText = document.getElementById("actionText") as HTMLElement;
const botsSelect = document.getElementById("botsSelect") as HTMLSelectElement;
const deckNr = document.getElementById("deckNr") as HTMLElement;
const trumpContainer = document.getElementById("trumpContainer") as HTMLElement;
const playerListContainer = document.getElementById("playerListContainer") as HTMLElement;
const avatarContainer = document.getElementById("avatarContainer") as HTMLElement;

const lobbyId = window.location.href.replace(/^[^#]*#*/, "");
const bots: Bot[] = [];

let gameManager: GameManager | null = null;
let username: string | null = null;
let userId: string | null = null;
let playerList: string[] = [];

if (!lobbyId) {
    window.location.href = "./index.html";
}

usernameInput.value = getRandomUsername();

joinButton?.addEventListener("click", async () => {
    const inputUsername = usernameInput.value.trim();
    if (inputUsername.length < 5) {
        usernameInfo.textContent = "The username has to be at least 5 characters long!";
    } else if (!inputUsername.match("^[A-Za-z0-9]*$")) {
        usernameInfo.textContent = "The username can only contain letters and numbers!";
    } else {
        username = inputUsername;
        usernameInfo.textContent = "loading...";
        console.log(`join '${lobbyId}' as '${username}'`);

        const headers = new Headers();
        headers.append("username", username);

        const response = await fetch(endpoint.joinLobby(lobbyId), {
            method: "post",
            headers,
        });

        if (response.status !== 200) {
            usernameInfo.textContent = await response.text();
        } else {
            const responseText = await response.text();
            userId = responseText.substring(1, responseText.length - 1);
            console.log(`logged in with id '${userId}'`);

            gameManager = new GameManager(userId, lobbyId);

            createLobbySocket();

            loginModal.hidden = true;

            createGameStateSocket();

            playerListContainer.style.display = "";
        }
    }

    const botNr: number = parseInt(botsSelect.value, 10) ?? 0;
    for (let index = 0; index < botNr; index++) {
        bots.push(new Bot(lobbyId));
    }
});

function createLobbySocket() {
    if (!userId) return;
    const socket = new WebSocket(endpoint.lobbySocket(lobbyId, userId));

    socket.addEventListener("open", () => {
        console.log("opened lobby websocket!");
    });

    socket.addEventListener("message", ({ data }) => {
        if (data) {
            try {
                playerList = JSON.parse(data) as string[];

                fillPlayerListElement(playerList);
            } catch (error) {
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

function fillPlayerListElement(players: string[] | Player[], gameState: GameState | null = null) {
    playerListElement.innerHTML = "";
    for (const player of players) {
        const playerElement = document.createElement("h3");
        if (typeof player === "string" || player instanceof String) {
            playerElement.append(player as string);
        } else {
            const playerObj = player as Player;
            if (gameState) {
                if (playerObj.hash === gameState.attackerHash) {
                    playerElement.classList.add("attacker");
                    if (gameState.attackGaveUp) {
                        playerElement.classList.add("gaveUp");
                    }
                } else if (playerObj.hash === gameState.defenderHash) {
                    playerElement.classList.add("defender");
                    if (gameState.defenderGaveUp) {
                        playerElement.classList.add("gaveUp");
                    }
                } else if (playerObj.hash === gameState.helperHash) {
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

function addPlayerAvatars(players: Player[], gameState: GameState) {
    avatarContainer.innerHTML = "";

    for (const player of players) {
        avatarContainer.appendChild(new PlayerAvatar(player, gameState));
    }
}

startGameButton.addEventListener("click", async () => {
    if (playerList.length < 2 || !userId) return;

    const headers = new Headers();
    headers.append("userId", userId);

    const response = await fetch(endpoint.startGame(lobbyId), {
        method: "post",
        headers,
    });

    if (response.status !== 200) {
        console.error(await response.text());
    } else {
        startGameButton.hidden = true;
    }
});

endTurnButton.addEventListener("click", async () => {
    if (!userId) return;

    if (
        gameManager?.role === Role.Defender &&
        gameManager.cardManager.battleFieldCardElements.some((cardElementPair) => !cardElementPair.second)
    ) {
        gameManager.cardManager.takeAllCards = true;
    }

    const headers = new Headers();
    headers.append("userId", userId);

    const response = await fetch(endpoint.giveUp(lobbyId), {
        method: "post",
        headers,
    });

    if (response.status !== 200) {
        console.error(await response.text());
    } else {
        actionText.textContent = "Ended Your Turn!";
    }
});

function createGameStateSocket() {
    if (!userId) return;
    const socket = new WebSocket(endpoint.gameStateSocket(lobbyId, userId));

    socket.addEventListener("open", () => {
        console.log("opened gameState websocket!");
    });

    socket.addEventListener("message", ({ data }) => {
        if (data && data !== "null") {
            startGameButton.hidden = true;
            try {
                const gameState = JSON.parse(data) as GameState;
                console.log("GameState", gameState);

                gameManager?.updateGameState(gameState);
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
            } catch (error) {
                console.error("could not parse gameState!");
            }
        } else {
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
