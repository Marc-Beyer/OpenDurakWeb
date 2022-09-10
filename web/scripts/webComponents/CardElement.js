import { cardSuitToString, cardValueToString } from "../interfaces.js";
export var CardLocation;
(function (CardLocation) {
    CardLocation[CardLocation["Hand"] = 0] = "Hand";
    CardLocation[CardLocation["Battlefield"] = 1] = "Battlefield";
    CardLocation[CardLocation["Trump"] = 2] = "Trump";
})(CardLocation || (CardLocation = {}));
export default class CardElement extends HTMLElement {
    constructor(card, gameManager, cardLocation) {
        super();
        this._xPos = 0;
        this._yPos = 0;
        this.card = card;
        this.gameManager = gameManager;
        this.cardLocation = cardLocation;
        this.xPos = 0;
        this.yPos = 0;
        this.classList.add(card.suit.toLowerCase());
        this.classList.add(card.value.toLowerCase());
    }
    get xPos() {
        return this._xPos;
    }
    set xPos(x) {
        this._xPos = x;
        this.style.left = `${this._xPos}px`;
    }
    get yPos() {
        return this._yPos;
    }
    set yPos(y) {
        this._yPos = y;
        this.style.top = `${this._yPos}px`;
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
            var _a;
            (_a = this.gameManager) === null || _a === void 0 ? void 0 : _a.playCard(this);
        });
    }
}
customElements.define("card-element", CardElement);
