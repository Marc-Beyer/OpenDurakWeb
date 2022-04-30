import CardElement, { CardLocation } from "./webComponents/CardElement.js";
import * as screen from "./screen.js";
import { Card, GameState } from "./interfaces.js";
import GameManager, { Role } from "./gameManager.js";

interface CardElementPair {
    first: CardElement | null;
    second: CardElement | null;
}

export default class CardManager {
    public trumpCardElement: CardElement | null = null;
    public handCardElements: CardElement[] = [];
    public battleFieldCardElements: CardElementPair[] = [];
    public gameManager: GameManager;

    public cardHeight: number;
    public cardWidth: number;

    public takeAllCards = false;
    public lastPlayedCard: CardElement | null = null;
    public secondaryPlayedCard: CardElement | null = null;

    private cardContainer = document.getElementById("cardContainer") as HTMLElement;
    private trumpCardContainer = document.getElementById("trumpCardContainer") as HTMLElement;

    constructor(gameManager: GameManager, cardSize = 80, cardRatio = 1.7) {
        this.cardWidth = cardSize;
        this.cardHeight = cardSize * cardRatio;
        this.gameManager = gameManager;

        window.addEventListener("resize", () => {
            this.updateCardPositions();
        });
    }

    public updateCards(gameState: GameState) {
        this.manageCards(gameState);
        this.updateCardPositions();
    }

    public manageCards(gameState: GameState) {
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

            if (this.handCardElements.length === gameState.selfPlayer?.cards.length) return;
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

                if (this.battleFieldCardElements.length === gameState.battlefield.length) return;
            } else if (this.gameManager.role === Role.Defender) {
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

                    if (this.battleFieldCardElements.length === gameState.battlefield.length) return;
                }
            }
            this.lastPlayedCard = null;
        }

        while (this.battleFieldCardElements.length > 0) {
            const CardElementPair = this.battleFieldCardElements.splice(0, 1)[0];
            CardElementPair.first?.remove();
            CardElementPair.second?.remove();
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
            const cardElementPair: CardElementPair = {
                first: new CardElement(cardPair.first, this.gameManager, CardLocation.Battlefield),
                second: null,
            };
            if (cardPair.second) {
                cardElementPair.second = new CardElement(cardPair.second, this.gameManager, CardLocation.Battlefield);
            }

            this.battleFieldCardElements.push(cardElementPair);

            if (cardElementPair.first) this.cardContainer.appendChild(cardElementPair.first);
            if (cardElementPair.second) this.cardContainer.appendChild(cardElementPair.second);
        }

        this.manageTrumpCard(gameState);
    }

    private manageTrumpCard(gameState: GameState) {
        if (areCardsEqual(this.trumpCardElement?.card ?? null, gameState.trump)) return;

        this.trumpCardElement?.remove();

        const cardElement = new CardElement(gameState.trump, this.gameManager, CardLocation.Trump);
        this.trumpCardElement = cardElement;
        this.trumpCardContainer.appendChild(cardElement);
    }

    public updateCardPositions() {
        this.updateCardInHandPosition();
        this.updateCardOnBattlegroundPosition();
        this.updateTrumpCardPosition();
    }

    private updateCardInHandPosition() {
        const gap = Math.min(
            (screen.width - this.handCardElements.length * this.cardWidth) / (this.handCardElements.length + 1),
            10,
        );

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

    private updateCardOnBattlegroundPosition() {
        const gap = Math.min(
            (screen.width - this.battleFieldCardElements.length * this.cardWidth) /
                (this.battleFieldCardElements.length + 1),
            10,
        );

        for (let index = 0; index < this.battleFieldCardElements.length; index++) {
            const cardPair = this.battleFieldCardElements[index];

            if (!cardPair.first) return;

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

    private updateTrumpCardPosition() {
        if (this.trumpCardElement) this.trumpCardElement.yPos = 0; // screen.height / 2 - this.cardHeight;
    }
}

export function areCardsEqual(cardA: Card | null, cardB: Card | null): boolean {
    if (!cardA && !cardB) return true;
    if (!cardA || !cardB) return false;
    return cardA.suit === cardB.suit && cardA.value === cardB.value;
}
