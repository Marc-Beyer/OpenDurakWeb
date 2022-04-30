import { Role } from "../gameManager.js";
import { GameState, Player } from "../interfaces.js";

export default class PlayerAvatar extends HTMLElement {
    public player: Player;
    public role: Role = Role.None;
    public gaveUp = false;

    constructor(player: Player, gameState: GameState) {
        super();
        this.player = player;

        this.setRole(player, gameState);
    }

    connectedCallback() {
        this.append(`${this.player.username} (${this.player.cardCount})`);
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
