var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import CardManager from "./cardManager.js";
import * as endpoint from "./controller/endpoint.js";
import { CardLocation } from "./webComponents/CardElement.js";
export var Role;
(function (Role) {
    Role[Role["None"] = 0] = "None";
    Role[Role["Attacker"] = 1] = "Attacker";
    Role[Role["Defender"] = 2] = "Defender";
    Role[Role["Helper"] = 3] = "Helper";
})(Role || (Role = {}));
export default class GameManager {
    constructor(userId, lobbyId) {
        this.lastClickedCard = null;
        this.userId = userId;
        this.lobbyId = lobbyId;
        this.role = Role.None;
        this.cardManager = new CardManager(this);
        this.actionText = document.getElementById("actionText");
        this.endTurnButton = document.getElementById("endTurnButton");
    }
    updateGameState(gameState) {
        var _a;
        (_a = this.lastClickedCard) === null || _a === void 0 ? void 0 : _a.classList.remove("marked");
        this.lastClickedCard = null;
        this.setRole(gameState);
        this.cardManager.updateCards(gameState);
    }
    playCard(cardElement) {
        var _a;
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
                    (_a = this.lastClickedCard) === null || _a === void 0 ? void 0 : _a.classList.remove("marked");
                    this.lastClickedCard = cardElement;
                }
                else if (this.lastClickedCard && cardElement.cardLocation === CardLocation.Battlefield) {
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
    attack(card) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(endpoint.attack(this.lobbyId, this.userId), {
                method: "post",
                body: JSON.stringify(card),
            });
            if (response.status !== 200) {
                console.error("Attack failed", yield response.text());
            }
            else {
                console.log("Attacked with", card);
            }
        });
    }
    defend(defendRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(endpoint.defend(this.lobbyId, this.userId), {
                method: "post",
                body: JSON.stringify(defendRequest),
            });
            if (response.status !== 200) {
                console.error("Defend failed", yield response.text());
            }
            else {
                console.log("Defended with", defendRequest);
            }
        });
    }
    help(card) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(endpoint.help(this.lobbyId, this.userId), {
                method: "post",
                body: JSON.stringify(card),
            });
            if (response.status !== 200) {
                console.error("Helping failed", yield response.text());
            }
            else {
                console.log("Helped with", card);
            }
        });
    }
    setRole(gameState) {
        this.endTurnButton.hidden = true;
        if (gameState.selfPlayer) {
            if (gameState.selfPlayer.hash === gameState.attackerHash) {
                this.role = Role.Attacker;
                if (gameState.battlefield.length > 0 &&
                    !gameState.battlefield.some((cp) => cp.second === null) &&
                    !gameState.attackGaveUp) {
                    this.endTurnButton.hidden = false;
                }
                this.actionText.textContent = "Attacking!";
            }
            else if (gameState.selfPlayer.hash === gameState.defenderHash) {
                if (gameState.battlefield.length > 0 && !gameState.defenderGaveUp)
                    this.endTurnButton.hidden = false;
                this.role = Role.Defender;
                this.actionText.textContent = "Being Attacked!";
            }
            else if (gameState.selfPlayer.hash === gameState.helperHash) {
                this.role = Role.Helper;
                if (gameState.battlefield.length > 0 && !gameState.helperGaveUp)
                    this.endTurnButton.hidden = false;
                this.actionText.textContent = "Help Attacking!";
            }
            else {
                this.role = Role.None;
                this.actionText.textContent = "Waiting for Others...";
            }
        }
        else {
            this.role = Role.None;
            this.actionText.textContent = "Watching Game...";
        }
    }
}
