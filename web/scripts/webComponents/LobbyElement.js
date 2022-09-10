export default class LobbyElement extends HTMLElement {
    constructor(lobbyId) {
        super();
        this.lobbyId = lobbyId;
    }
    connectedCallback() {
        const lobbySpan = document.createElement("span");
        lobbySpan.append(this.lobbyId);
        this.appendChild(lobbySpan);
        const joinButton = document.createElement("button");
        joinButton.append("join");
        joinButton.addEventListener("click", () => {
            console.log(this.lobbyId);
            window.location.href = `./game.html#${this.lobbyId}`;
        });
        this.appendChild(joinButton);
    }
}
customElements.define("lobby-listing", LobbyElement);
