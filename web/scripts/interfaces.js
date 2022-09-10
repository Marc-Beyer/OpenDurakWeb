export var CardSuit;
(function (CardSuit) {
    CardSuit["HEART"] = "HEART";
    CardSuit["DIAMOND"] = "DIAMOND";
    CardSuit["CLUB"] = "CLUB";
    CardSuit["SPADE"] = "SPADE";
})(CardSuit || (CardSuit = {}));
const CardSuitStringArr = {
    HEART: "♥",
    DIAMOND: "⯁",
    CLUB: "♣",
    SPADE: "♠",
};
export function cardSuitToString(cardSuit) {
    return CardSuitStringArr[cardSuit];
}
export var CardValue;
(function (CardValue) {
    CardValue["SIX"] = "SIX";
    CardValue["SEVEN"] = "SEVEN";
    CardValue["EIGHT"] = "EIGHT";
    CardValue["NINE"] = "NINE";
    CardValue["TEN"] = "TEN";
    CardValue["JACK"] = "JACK";
    CardValue["QUEEN"] = "QUEEN";
    CardValue["KING"] = "KING";
    CardValue["ACE"] = "ACE";
})(CardValue || (CardValue = {}));
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
export function cardValueToString(cardValue) {
    return CardValueStringArr[cardValue];
}
export function cardValueToNumber(cardValue) {
    return Object.keys(CardValue).indexOf(cardValue);
}
