import getRandomUsername from "./usernames.js";
import * as endpoint from "./controller/endpoint.js";
import { Card, CardPair, CardSuit, cardValueToNumber, DefendRequest, GameState } from "./interfaces.js";
import { Role } from "./gameManager.js";

export default class Bot {
    public lobbyId: string;
    public username: string;
    public userId: string | null = null;
    public role: Role = Role.None;
    public state = 0;

    constructor(lobbyId: string) {
        this.lobbyId = lobbyId;
        this.username = getRandomUsername();

        this.connect();
    }

    private async connect() {
        const response = await fetch(endpoint.joinLobby(this.lobbyId, this.username), {
            method: "post",
        });

        if (response.status !== 200) {
            console.error(`Bot '${this.username}': ${await response.text()}`);
        } else {
            const responseText = await response.text();
            this.userId = responseText.substring(1, responseText.length - 1);
            console.log(`Bot '${this.username}' logged in with id '${this.userId}'`);

            this.createGameStateSocket();
        }
    }

    private createGameStateSocket() {
        if (!this.userId) return;
        const socket = new WebSocket(endpoint.gameStateSocket(this.lobbyId, this.userId));

        socket.addEventListener("open", () => {
            console.log(`Bot '${this.username}' opened gameState websocket!`);
        });

        socket.addEventListener("message", ({ data }) => {
            if (data && data !== "null") {
                try {
                    const gameState = JSON.parse(data) as GameState;
                    this.reactToGameState(gameState);
                } catch (error) {
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

    private async reactToGameState(gameState: GameState) {
        this.setRole(gameState);

        const state = this.state + 1;
        this.state = state;
        await sleep(Math.random() * 1000 + 1000);
        if (this.state !== state) return;

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
    }

    private async handleAttack(gameState: GameState) {
        if (!gameState.selfPlayer || !this.userId) return;

        const card = findBestCardsToAttack(gameState.selfPlayer.cards, gameState.trump.suit, gameState.battlefield);

        if (!card) {
            if (gameState.battlefield.some((cp) => cp.second === null)) return;
            if (gameState.helperHash && this.role === Role.Attacker && !gameState.helperGaveUp) return;

            const response = await fetch(endpoint.giveUp(this.lobbyId, this.userId), {
                method: "post",
            });

            if (response.status !== 200) {
                console.error(`Bot '${this.username}' could not end turn`, await response.text());
            } else {
                console.log(`Bot '${this.username}' ended it's turn!`);
            }
        }

        const endpointUrl =
            this.role === Role.Attacker
                ? endpoint.attack(this.lobbyId, this.userId)
                : endpoint.help(this.lobbyId, this.userId);
        const body = JSON.stringify(card);
        if (body.length > 5) {
            const response = await fetch(endpointUrl, {
                method: "post",
                body,
            });

            if (response.status !== 200) {
                console.error(`Bot '${this.username}' Attack failed because ${await response.text()}`, card);
            } else {
                console.log(`Bot '${this.username}' Attacked with`, card);
            }
        }
    }

    private async handleDefend(gameState: GameState) {
        if (!gameState.selfPlayer || !this.userId) return;

        const attackingCard = gameState.battlefield.find((cp) => cp.second === null)?.first;
        if (!attackingCard) return;

        const card = findBestCardsToDefend(gameState.selfPlayer.cards, gameState.trump.suit, attackingCard);

        if (card) {
            const defendRequest: DefendRequest = {
                defendingCard: card,
                attackingCard,
            };

            const response = await fetch(endpoint.defend(this.lobbyId, this.userId), {
                method: "post",
                body: JSON.stringify(defendRequest),
            });

            if (response.status !== 200) {
                console.error(`Bot '${this.username}' defend failed`, await response.text());
            } else {
                console.log(`Bot '${this.username}' defended with`, defendRequest);
            }
            return;
        }

        const response = await fetch(endpoint.giveUp(this.lobbyId, this.userId), {
            method: "post",
        });

        if (response.status !== 200) {
            console.error(`Bot '${this.username}' error`, await response.text());
        } else {
            console.log(`Bot '${this.username}' ended it's turn!`);
        }
    }

    private setRole(gameState: GameState) {
        if (gameState.selfPlayer) {
            if (gameState.selfPlayer.hash === gameState.attackerHash && !gameState.attackGaveUp) {
                this.role = Role.Attacker;
            } else if (gameState.selfPlayer.hash === gameState.defenderHash && !gameState.defenderGaveUp) {
                this.role = Role.Defender;
            } else if (gameState.selfPlayer.hash === gameState.helperHash && !gameState.helperGaveUp) {
                this.role = Role.Helper;
            } else {
                this.role = Role.None;
            }
        } else {
            this.role = Role.None;
        }
    }
}

function findBestCardsToAttack(cards: Card[], trump: CardSuit, battlefield: CardPair[]): Card | null {
    const playedValues: { [key: string]: boolean } = {};
    for (const cardPair of battlefield) {
        if (cardPair.first) playedValues[cardPair.first.value] = true;
        if (cardPair.second) playedValues[cardPair.second.value] = true;
    }

    const sortedCards = sortCards(cards, trump);

    if (sortedCards.length > 0) {
        if (battlefield.length === 0) return sortedCards[0];

        for (const card of sortedCards) {
            if (playedValues[card.value]) return card;
        }
    }

    return null;
}

function findBestCardsToDefend(cards: Card[], trump: CardSuit, attackingCard: Card): Card | null {
    const sortedCards = sortCards(cards, trump);

    if (sortedCards.length > 0) {
        for (const card of sortedCards) {
            if (card.suit === attackingCard.suit || card.suit === trump) {
                if (cardValueToNumber(card.value) > cardValueToNumber(attackingCard.value)) return card;
            }
        }
    }

    return null;
}

function sortCards(cards: Card[], trump: CardSuit): Card[] {
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

async function sleep(ms: number): Promise<number> {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
}
