import CardManager from "./cardManager.js";
import * as endpoint from "./controller/endpoint.js";
import { Card, DefendRequest, GameState } from "./interfaces.js";
import CardElement, { CardLocation } from "./webComponents/CardElement.js";

export enum Role {
    None,
    Attacker,
    Defender,
    Helper,
}

export default class GameManager {
    public userId: string;
    public lobbyId: string;
    public role: Role;
    public cardManager: CardManager;

    private actionText: HTMLElement;
    private endTurnButton: HTMLButtonElement;

    private lastClickedCard: CardElement | null = null;

    constructor(userId: string, lobbyId: string) {
        this.userId = userId;
        this.lobbyId = lobbyId;
        this.role = Role.None;
        this.cardManager = new CardManager(this);
        this.actionText = document.getElementById("actionText") as HTMLElement;
        this.endTurnButton = document.getElementById("endTurnButton") as HTMLButtonElement;
    }

    public updateGameState(gameState: GameState) {
        this.lastClickedCard?.classList.remove("marked");
        this.lastClickedCard = null;

        this.setRole(gameState);
        this.cardManager.updateCards(gameState);
    }

    public playCard(cardElement: CardElement) {
        console.log("Play card as", this.role, cardElement);

        switch (this.role) {
            case Role.Attacker:
                console.log("attack with card", cardElement.card);
                this.cardManager.lastPlayedCard = cardElement;
                this.attack(cardElement.card);
                break;
            case Role.Defender:
                if (cardElement.cardLocation === CardLocation.Hand) {
                    console.log("Mark card", cardElement.card);
                    this.cardManager.lastPlayedCard = cardElement;
                    cardElement.classList.add("marked");
                    this.lastClickedCard?.classList.remove("marked");
                    this.lastClickedCard = cardElement;
                } else if (this.lastClickedCard && cardElement.cardLocation === CardLocation.Battlefield) {
                    console.log("defend card", this.lastClickedCard.card, cardElement.card);
                    this.cardManager.secondaryPlayedCard = cardElement;
                    this.defend({
                        defendingCard: this.lastClickedCard.card,
                        attackingCard: cardElement.card,
                    });
                }
                break;
            case Role.Helper:
                console.log("help with card", cardElement.card);
                this.cardManager.lastPlayedCard = cardElement;
                this.help(cardElement.card);
                break;
            case Role.None:
            default:
        }
    }

    private async attack(card: Card) {
        const response = await fetch(endpoint.attack(this.lobbyId, this.userId), {
            method: "post",
            body: JSON.stringify(card),
        });

        if (response.status !== 200) {
            console.error("Attack failed", await response.text());
        } else {
            console.log("Attacked with", card);
        }
    }

    private async defend(defendRequest: DefendRequest) {
        const response = await fetch(endpoint.defend(this.lobbyId, this.userId), {
            method: "post",
            body: JSON.stringify(defendRequest),
        });

        if (response.status !== 200) {
            console.error("Defend failed", await response.text());
        } else {
            console.log("Defended with", defendRequest);
        }
    }

    private async help(card: Card) {
        const response = await fetch(endpoint.help(this.lobbyId, this.userId), {
            method: "post",
            body: JSON.stringify(card),
        });

        if (response.status !== 200) {
            console.error("Helping failed", await response.text());
        } else {
            console.log("Helped with", card);
        }
    }

    private setRole(gameState: GameState) {
        this.endTurnButton.hidden = true;
        if (gameState.selfPlayer) {
            if (gameState.selfPlayer.hash === gameState.attackerHash) {
                this.role = Role.Attacker;
                if (
                    gameState.battlefield.length > 0 &&
                    !gameState.battlefield.some((cp) => cp.second === null) &&
                    !gameState.attackGaveUp
                ) {
                    this.endTurnButton.hidden = false;
                }
                this.actionText.textContent = "Attacking!";
            } else if (gameState.selfPlayer.hash === gameState.defenderHash) {
                if (gameState.battlefield.length > 0 && !gameState.defenderGaveUp) this.endTurnButton.hidden = false;
                this.role = Role.Defender;
                this.actionText.textContent = "Being Attacked!";
            } else if (gameState.selfPlayer.hash === gameState.helperHash) {
                this.role = Role.Helper;
                if (gameState.battlefield.length > 0 && !gameState.helperGaveUp) this.endTurnButton.hidden = false;
                this.actionText.textContent = "Help Attacking!";
            } else {
                this.role = Role.None;
                this.actionText.textContent = "Waiting for Others...";
            }
        } else {
            this.role = Role.None;
            this.actionText.textContent = "Watching Game...";
        }
    }
}
