/* eslint-disable no-underscore-dangle */
import { Role } from "../gameManager.js";
import * as screen from "../screen.js";
export default class PlayerAvatar extends HTMLElement {
    constructor(player, gameState, angle) {
        super();
        this.role = Role.None;
        this.gaveUp = false;
        this._xPos = 0;
        this._yPos = 0;
        this.player = player;
        this.xPos = 0;
        this.yPos = 0;
        this.setRole(player, gameState);
        this.classList.add(Role[this.role].toLowerCase());
        if (this.gaveUp)
            this.classList.add("gaveUp");
        this.updatePosition(angle);
        window.addEventListener("resize", () => {
            this.updatePosition(angle);
        });
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
    updatePosition(angle) {
        const radius = 220;
        this.xPos = screen.width / 2 + radius * Math.cos(angle) * 2;
        this.yPos = screen.height / 3 + radius * Math.sin(angle);
    }
    connectedCallback() {
        const img = document.createElement("img");
        switch (this.role) {
            case Role.Defender:
                img.src = "./icons/account_circle_FILL0_wght400_GRAD0_opsz48.svg";
                break;
            default:
                if (this.gaveUp) {
                    img.src = "./icons/person_off_FILL0_wght400_GRAD0_opsz48.svg";
                }
                else {
                    img.src = "./icons/person_FILL0_wght400_GRAD0_opsz48.svg";
                }
                break;
        }
        this.appendChild(img);
        this.append(`${this.player.username}`);
        const cards = document.createElement("div");
        cards.classList.add("cardContainer");
        for (let index = 0; index < this.player.cardCount; index++) {
            const card = document.createElement("div");
            card.classList.add("dummyCard");
            card.appendChild(document.createElement("div"));
            cards.appendChild(card);
        }
        this.appendChild(cards);
        this.append(`(${this.player.cardCount})`);
    }
    setRole(player, gameState) {
        if (player.hash === gameState.attackerHash) {
            this.role = Role.Attacker;
            this.gaveUp = gameState.attackGaveUp;
        }
        else if (player.hash === gameState.defenderHash) {
            this.role = Role.Defender;
            this.gaveUp = gameState.defenderGaveUp;
        }
        else if (player.hash === gameState.helperHash) {
            this.role = Role.Helper;
            this.gaveUp = gameState.helperGaveUp;
        }
        else {
            this.role = Role.None;
            this.gaveUp = false;
        }
    }
}
customElements.define("player-avatar", PlayerAvatar);
