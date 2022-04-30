import LobbyElement from "../webComponents/LobbyElement.js";
import * as endpoint from "./endpoint.js";

console.log("start");

const lobbyList = document.getElementById("lobbyList") as HTMLUListElement;
const createLobbyButton = document.getElementById("createLobbyButton") as HTMLButtonElement;

init();

async function init() {
    try {
        const response = await fetch(endpoint.alive);

        if (response.status !== 200) {
            throw new Error("The server seems to be offline!");
        }

        for (const lobby of await getAllLobbies()) {
            lobbyList.appendChild(new LobbyElement(lobby));
        }
    } catch (error) {
        console.error(error);
    }
}

async function getAllLobbies(): Promise<string[]> {
    try {
        const response = await fetch(endpoint.lobby);

        if (response.status !== 200) {
            throw new Error("The server seems to be offline!");
        }

        return (await response.json()) as string[];
    } catch (error) {
        console.error(error);
    }
    return [];
}

createLobbyButton.addEventListener("click", async () => {
    try {
        const response = await fetch(endpoint.lobby, {
            method: "put",
        });

        if (response.status !== 200) {
            throw new Error("The server seems to be offline!");
        }

        let lobbyId = await response.text();
        lobbyId = lobbyId.substring(1, lobbyId.length - 1);
        window.location.href = `./game.html#${lobbyId}`;
    } catch (error) {
        console.error(error);
    }
});
