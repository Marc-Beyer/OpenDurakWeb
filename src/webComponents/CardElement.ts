/* eslint-disable no-underscore-dangle */
import GameManager from "../gameManager.js";
import { Card, cardSuitToString, cardValueToString } from "../interfaces.js";

export enum CardLocation {
    Hand,
    Battlefield,
    Trump,
}

export default class CardElement extends HTMLElement {
    public card: Card;
    public gameManager: GameManager;
    public cardLocation: CardLocation;

    private _xPos = 0;
    private _yPos = 0;

    public get xPos() {
        return this._xPos;
    }

    public set xPos(x: number) {
        this._xPos = x;
        this.style.left = `${this._xPos}px`;
    }

    public get yPos() {
        return this._yPos;
    }

    public set yPos(y: number) {
        this._yPos = y;
        this.style.top = `${this._yPos}px`;
    }

    constructor(card: Card, gameManager: GameManager, cardLocation: CardLocation) {
        super();
        this.card = card;
        this.gameManager = gameManager;
        this.cardLocation = cardLocation;
        this.xPos = 0;
        this.yPos = 0;

        this.classList.add(card.suit.toLowerCase());
        this.classList.add(card.value.toLowerCase());
    }

    connectedCallback() {
        this.style.transition = "top 1s ease 0s, left 1s ease 0s";

        for (let index = 0; index < 4; index++) {
            const valueElement = document.createElement("div");
            valueElement.classList.add("value");
            valueElement.append(cardValueToString(this.card.value));
            this.appendChild(valueElement);
        }

        const suitElement = document.createElement("div");
        suitElement.classList.add("suit");
        suitElement.append(cardSuitToString(this.card.suit));
        this.appendChild(suitElement);

        this.addEventListener("click", () => {
            this.gameManager?.playCard(this);
        });
    }
}
customElements.define("card-element", CardElement);
