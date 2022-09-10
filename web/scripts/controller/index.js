var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LobbyElement from "../webComponents/LobbyElement.js";
import * as endpoint from "./endpoint.js";
console.log("start");
const lobbyList = document.getElementById("lobbyList");
const createLobbyButton = document.getElementById("createLobbyButton");
init();
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(endpoint.alive);
            if (response.status !== 200) {
                throw new Error("The server seems to be offline!");
            }
            for (const lobby of yield getAllLobbies()) {
                lobbyList.appendChild(new LobbyElement(lobby));
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function getAllLobbies() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(endpoint.lobby);
            if (response.status !== 200) {
                throw new Error("The server seems to be offline!");
            }
            return (yield response.json());
        }
        catch (error) {
            console.error(error);
        }
        return [];
    });
}
createLobbyButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(endpoint.lobby, {
            method: "put",
        });
        if (response.status !== 200) {
            throw new Error("The server seems to be offline!");
        }
        let lobbyId = yield response.text();
        lobbyId = lobbyId.substring(1, lobbyId.length - 1);
        window.location.href = `./game.html#${lobbyId}`;
    }
    catch (error) {
        console.error(error);
    }
}));
