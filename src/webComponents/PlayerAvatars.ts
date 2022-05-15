/* eslint-disable no-underscore-dangle */
import { Role } from "../gameManager.js";
import { GameState, Player } from "../interfaces.js";
import * as screen from "../screen.js";

export default class PlayerAvatar extends HTMLElement {
    public player: Player;
    public role: Role = Role.None;
    public gaveUp = false;

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

    constructor(player: Player, gameState: GameState, angle: number) {
        super();
        this.player = player;
        this.xPos = 0;
        this.yPos = 0;

        this.setRole(player, gameState);
        this.classList.add(Role[this.role].toLowerCase());
        if (this.gaveUp) this.classList.add("gaveUp");

        this.updatePosition(angle);
        window.addEventListener("resize", () => {
            this.updatePosition(angle);
        });
    }

    updatePosition(angle: number) {
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
                } else {
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

    private setRole(player: Player, gameState: GameState) {
        if (player.hash === gameState.attackerHash) {
            this.role = Role.Attacker;
            this.gaveUp = gameState.attackGaveUp;
        } else if (player.hash === gameState.defenderHash) {
            this.role = Role.Defender;
            this.gaveUp = gameState.defenderGaveUp;
        } else if (player.hash === gameState.helperHash) {
            this.role = Role.Helper;
            this.gaveUp = gameState.helperGaveUp;
        } else {
            this.role = Role.None;
            this.gaveUp = false;
        }
    }
}
customElements.define("player-avatar", PlayerAvatar);
