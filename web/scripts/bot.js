var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import getRandomUsername from "./usernames.js";
import * as endpoint from "./controller/endpoint.js";
import { cardValueToNumber } from "./interfaces.js";
import { Role } from "./gameManager.js";
export default class Bot {
    constructor(lobbyId) {
        this.userId = null;
        this.role = Role.None;
        this.state = 0;
        this.lobbyId = lobbyId;
        this.username = getRandomUsername();
        this.connect();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(endpoint.joinLobby(this.lobbyId, this.username), {
                method: "post",
            });
            if (response.status !== 200) {
                console.error(`Bot '${this.username}': ${yield response.text()}`);
            }
            else {
                const responseText = yield response.text();
                this.userId = responseText.substring(1, responseText.length - 1);
                console.log(`Bot '${this.username}' logged in with id '${this.userId}'`);
                this.createGameStateSocket();
            }
        });
    }
    createGameStateSocket() {
        if (!this.userId)
            return;
        const socket = new WebSocket(endpoint.gameStateSocket(this.lobbyId, this.userId));
        socket.addEventListener("open", () => {
            console.log(`Bot '${this.username}' opened gameState websocket!`);
        });
        socket.addEventListener("message", ({ data }) => {
            if (data && data !== "null") {
                try {
                    const gameState = JSON.parse(data);
                    this.reactToGameState(gameState);
                }
                catch (error) {
                    console.error(`Bot '${this.username}' could not parse gameState!`);
                }
            }
        });
        socket.addEventListener("error", (event) => {
            console.error(`Bot '${this.username}' error`, event);
        });
        socket.addEventListener("close", (event) => {
            console.log(`Bot '${this.username}' connection closed because: '${event.reason}'`);
        });
    }
    reactToGameState(gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setRole(gameState);
            const state = this.state + 1;
            this.state = state;
            yield sleep(Math.random() * 1000 + 1000);
            if (this.state !== state)
                return;
            switch (this.role) {
                case Role.Attacker:
                    this.handleAttack(gameState);
                    break;
                case Role.Helper:
                    if (gameState.battlefield.length > 0) {
                        this.handleAttack(gameState);
                    }
                    break;
                case Role.Defender:
                    if (gameState.battlefield.length > 0) {
                        this.handleDefend(gameState);
                    }
                    break;
                default:
                    break;
            }
        });
    }
    handleAttack(gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!gameState.selfPlayer || !this.userId)
                return;
            const card = findBestCardsToAttack(gameState.selfPlayer.cards, gameState.trump.suit, gameState.battlefield);
            if (!card) {
                if (gameState.battlefield.some((cp) => cp.second === null))
                    return;
                if (gameState.helperHash && this.role === Role.Attacker && !gameState.helperGaveUp)
                    return;
                const response = yield fetch(endpoint.giveUp(this.lobbyId, this.userId), {
                    method: "post",
                });
                if (response.status !== 200) {
                    console.error(`Bot '${this.username}' could not end turn`, yield response.text());
                }
                else {
                    console.log(`Bot '${this.username}' ended it's turn!`);
                }
            }
            const endpointUrl = this.role === Role.Attacker
                ? endpoint.attack(this.lobbyId, this.userId)
                : endpoint.help(this.lobbyId, this.userId);
            const body = JSON.stringify(card);
            if (body.length > 5) {
                const response = yield fetch(endpointUrl, {
                    method: "post",
                    body,
                });
                if (response.status !== 200) {
                    console.error(`Bot '${this.username}' Attack failed because ${yield response.text()}`, card);
                }
                else {
                    console.log(`Bot '${this.username}' Attacked with`, card);
                }
            }
        });
    }
    handleDefend(gameState) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!gameState.selfPlayer || !this.userId)
                return;
            const attackingCard = (_a = gameState.battlefield.find((cp) => cp.second === null)) === null || _a === void 0 ? void 0 : _a.first;
            if (!attackingCard)
                return;
            const card = findBestCardsToDefend(gameState.selfPlayer.cards, gameState.trump.suit, attackingCard);
            if (card) {
                const defendRequest = {
                    defendingCard: card,
                    attackingCard,
                };
                const response = yield fetch(endpoint.defend(this.lobbyId, this.userId), {
                    method: "post",
                    body: JSON.stringify(defendRequest),
                });
                if (response.status !== 200) {
                    console.error(`Bot '${this.username}' defend failed`, yield response.text());
                }
                else {
                    console.log(`Bot '${this.username}' defended with`, defendRequest);
                }
                return;
            }
            const response = yield fetch(endpoint.giveUp(this.lobbyId, this.userId), {
                method: "post",
            });
            if (response.status !== 200) {
                console.error(`Bot '${this.username}' error`, yield response.text());
            }
            else {
                console.log(`Bot '${this.username}' ended it's turn!`);
            }
        });
    }
    setRole(gameState) {
        if (gameState.selfPlayer) {
            if (gameState.selfPlayer.hash === gameState.attackerHash && !gameState.attackGaveUp) {
                this.role = Role.Attacker;
            }
            else if (gameState.selfPlayer.hash === gameState.defenderHash && !gameState.defenderGaveUp) {
                this.role = Role.Defender;
            }
            else if (gameState.selfPlayer.hash === gameState.helperHash && !gameState.helperGaveUp) {
                this.role = Role.Helper;
            }
            else {
                this.role = Role.None;
            }
        }
        else {
            this.role = Role.None;
        }
    }
}
function findBestCardsToAttack(cards, trump, battlefield) {
    const playedValues = {};
    for (const cardPair of battlefield) {
        if (cardPair.first)
            playedValues[cardPair.first.value] = true;
        if (cardPair.second)
            playedValues[cardPair.second.value] = true;
    }
    const sortedCards = sortCards(cards, trump);
    if (sortedCards.length > 0) {
        if (battlefield.length === 0)
            return sortedCards[0];
        for (const card of sortedCards) {
            if (playedValues[card.value])
                return card;
        }
    }
    return null;
}
function findBestCardsToDefend(cards, trump, attackingCard) {
    const sortedCards = sortCards(cards, trump);
    if (sortedCards.length > 0) {
        for (const card of sortedCards) {
            if (card.suit === attackingCard.suit || card.suit === trump) {
                if (cardValueToNumber(card.value) > cardValueToNumber(attackingCard.value))
                    return card;
            }
        }
    }
    return null;
}
function sortCards(cards, trump) {
    return cards.sort((cardA, cardB) => {
        if (cardA.suit === trump && cardB.suit !== trump) {
            return 1;
        }
        if (cardA.suit !== trump && cardB.suit === trump) {
            return -1;
        }
        if (cardValueToNumber(cardA.value) === cardValueToNumber(cardB.value)) {
            return 0;
        }
        if (cardValueToNumber(cardA.value) > cardValueToNumber(cardB.value)) {
            return 1;
        }
        return -1;
    });
}
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line no-promise-executor-return
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
