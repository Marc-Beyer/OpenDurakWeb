import CardElement, { CardLocation } from "./webComponents/CardElement.js";
import * as screen from "./screen.js";
import { Role } from "./gameManager.js";
export default class CardManager {
    constructor(gameManager, cardSize = 80, cardRatio = 1.7) {
        this.trumpCardElement = null;
        this.handCardElements = [];
        this.battleFieldCardElements = [];
        this.takeAllCards = false;
        this.lastPlayedCard = null;
        this.secondaryPlayedCard = null;
        this.cardContainer = document.getElementById("cardContainer");
        this.trumpCardContainer = document.getElementById("trumpCardContainer");
        this.cardWidth = cardSize;
        this.cardHeight = cardSize * cardRatio;
        this.gameManager = gameManager;
        window.addEventListener("resize", () => {
            this.updateCardPositions();
        });
    }
    updateCards(gameState) {
        this.manageCards(gameState);
        this.updateCardPositions();
    }
    manageCards(gameState) {
        var _a, _b, _c;
        if (this.takeAllCards && gameState.battlefield.length === 0) {
            this.takeAllCards = false;
            while (this.battleFieldCardElements.length > 0) {
                const CardElementPair = this.battleFieldCardElements.splice(0, 1)[0];
                if (CardElementPair.first) {
                    this.handCardElements.push(CardElementPair.first);
                    CardElementPair.first.cardLocation = CardLocation.Hand;
                }
                if (CardElementPair.second) {
                    this.handCardElements.push(CardElementPair.second);
                    CardElementPair.second.cardLocation = CardLocation.Hand;
                }
            }
            if (this.handCardElements.length === ((_a = gameState.selfPlayer) === null || _a === void 0 ? void 0 : _a.cards.length))
                return;
        }
        if (this.lastPlayedCard) {
            if (this.gameManager.role === Role.Attacker || this.gameManager.role === Role.Helper) {
                this.battleFieldCardElements.push({
                    first: this.lastPlayedCard,
                    second: null,
                });
                this.lastPlayedCard.cardLocation = CardLocation.Battlefield;
                const index = this.handCardElements.indexOf(this.lastPlayedCard);
                this.handCardElements.splice(index, 1);
                this.lastPlayedCard = null;
                if (this.battleFieldCardElements.length === gameState.battlefield.length)
                    return;
            }
            else if (this.gameManager.role === Role.Defender) {
                const cardElementPair = this.battleFieldCardElements.find((CardElementPair) => {
                    const found = CardElementPair.first === this.secondaryPlayedCard;
                    return found;
                });
                if (cardElementPair) {
                    cardElementPair.second = this.lastPlayedCard;
                    this.lastPlayedCard.cardLocation = CardLocation.Battlefield;
                    const index = this.handCardElements.indexOf(this.lastPlayedCard);
                    this.handCardElements.splice(index, 1);
                    this.lastPlayedCard = null;
                    if (this.battleFieldCardElements.length === gameState.battlefield.length)
                        return;
                }
            }
            this.lastPlayedCard = null;
        }
        while (this.battleFieldCardElements.length > 0) {
            const CardElementPair = this.battleFieldCardElements.splice(0, 1)[0];
            (_b = CardElementPair.first) === null || _b === void 0 ? void 0 : _b.remove();
            (_c = CardElementPair.second) === null || _c === void 0 ? void 0 : _c.remove();
        }
        while (this.handCardElements.length > 0) {
            this.handCardElements.splice(0, 1)[0].remove();
        }
        if (gameState.selfPlayer) {
            for (const card of gameState.selfPlayer.cards) {
                const cardElement = new CardElement(card, this.gameManager, CardLocation.Hand);
                this.handCardElements.push(cardElement);
                this.cardContainer.appendChild(cardElement);
            }
        }
        for (const cardPair of gameState.battlefield) {
            const cardElementPair = {
                first: new CardElement(cardPair.first, this.gameManager, CardLocation.Battlefield),
                second: null,
            };
            if (cardPair.second) {
                cardElementPair.second = new CardElement(cardPair.second, this.gameManager, CardLocation.Battlefield);
            }
            this.battleFieldCardElements.push(cardElementPair);
            if (cardElementPair.first)
                this.cardContainer.appendChild(cardElementPair.first);
            if (cardElementPair.second)
                this.cardContainer.appendChild(cardElementPair.second);
        }
        this.manageTrumpCard(gameState);
    }
    manageTrumpCard(gameState) {
        var _a, _b, _c;
        if (areCardsEqual((_b = (_a = this.trumpCardElement) === null || _a === void 0 ? void 0 : _a.card) !== null && _b !== void 0 ? _b : null, gameState.trump))
            return;
        (_c = this.trumpCardElement) === null || _c === void 0 ? void 0 : _c.remove();
        const cardElement = new CardElement(gameState.trump, this.gameManager, CardLocation.Trump);
        this.trumpCardElement = cardElement;
        this.trumpCardContainer.appendChild(cardElement);
    }
    updateCardPositions() {
        this.updateCardInHandPosition();
        this.updateCardOnBattlegroundPosition();
        this.updateTrumpCardPosition();
    }
    updateCardInHandPosition() {
        const gap = Math.min((screen.width - this.handCardElements.length * this.cardWidth) / (this.handCardElements.length + 1), 10);
        for (let index = 0; index < this.handCardElements.length; index++) {
            const card = this.handCardElements[index];
            card.style.zIndex = `${index}`;
            card.yPos = screen.height - this.cardHeight - gap;
            card.xPos =
                screen.width / 2 -
                    (this.handCardElements.length / 2) * (this.cardWidth + gap) +
                    index * (this.cardWidth + gap);
        }
    }
    updateCardOnBattlegroundPosition() {
        const gap = Math.min((screen.width - this.battleFieldCardElements.length * this.cardWidth) /
            (this.battleFieldCardElements.length + 1), 10);
        for (let index = 0; index < this.battleFieldCardElements.length; index++) {
            const cardPair = this.battleFieldCardElements[index];
            if (!cardPair.first)
                return;
            cardPair.first.style.zIndex = `${index * 2}`;
            cardPair.first.yPos = screen.height / 2 - this.cardHeight;
            cardPair.first.xPos =
                screen.width / 2 -
                    (this.battleFieldCardElements.length / 2) * (this.cardWidth + gap) +
                    index * (this.cardWidth + gap);
            if (cardPair.second) {
                cardPair.second.style.zIndex = `${index * 2 + 1}`;
                cardPair.second.yPos = cardPair.first.yPos + this.cardHeight / 4;
                cardPair.second.xPos = cardPair.first.xPos - 5;
            }
        }
    }
    updateTrumpCardPosition() {
        if (this.trumpCardElement)
            this.trumpCardElement.yPos = 0; // screen.height / 2 - this.cardHeight;
    }
}
export function areCardsEqual(cardA, cardB) {
    if (!cardA && !cardB)
        return true;
    if (!cardA || !cardB)
        return false;
    return cardA.suit === cardB.suit && cardA.value === cardB.value;
}
