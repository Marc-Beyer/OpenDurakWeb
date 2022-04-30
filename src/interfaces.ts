export enum CardSuit {
    HEART = "HEART",
    DIAMOND = "DIAMOND",
    CLUB = "CLUB",
    SPADE = "SPADE",
}

const CardSuitStringArr = {
    HEART: "♥",
    DIAMOND: "⯁",
    CLUB: "♣",
    SPADE: "♠",
};

export function cardSuitToString(cardSuit: CardSuit): string {
    return CardSuitStringArr[cardSuit];
}

export enum CardValue {
    SIX = "SIX",
    SEVEN = "SEVEN",
    EIGHT = "EIGHT",
    NINE = "NINE",
    TEN = "TEN",
    JACK = "JACK",
    QUEEN = "QUEEN",
    KING = "KING",
    ACE = "ACE",
}

const CardValueStringArr = {
    SIX: "6",
    SEVEN: "7",
    EIGHT: "8",
    NINE: "9",
    TEN: "10",
    JACK: "J",
    QUEEN: "Q",
    KING: "K",
    ACE: "A",
};

export function cardValueToString(cardValue: CardValue): string {
    return CardValueStringArr[cardValue];
}

export function cardValueToNumber(cardValue: CardValue): number {
    return Object.keys(CardValue).indexOf(cardValue);
}

export interface Card {
    suit: CardSuit;
    value: CardValue;
}

export interface CardPair {
    first: Card;
    second: Card | null;
}

export interface Player {
    hash: string;
    username: string;
    cardCount: number;
}

export interface GameState {
    selfPlayer: {
        hash: string;
        cards: Card[];
    } | null;
    players: Player[];
    stackCount: number;
    trump: Card;
    battlefield: CardPair[];
    attackerHash: string | null;
    defenderHash: string | null;
    helperHash: string | null;
    attackGaveUp: boolean;
    defenderGaveUp: boolean;
    helperGaveUp: boolean;
    gameFinished: boolean;
}

export interface DefendRequest {
    defendingCard: Card;
    attackingCard: Card;
}
