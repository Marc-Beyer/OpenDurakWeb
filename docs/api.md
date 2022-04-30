# Open Durak API

This API allows you to to interact with an OpenDurak server.

The API is available at `http://0.0.0.0:8080`

## Endpoints


### Status

GET `/alive`

Returns the status of the API.


### List of lobbies

GET `/lobby`

Returns a list of all open lobbies.


### Create a lobby

PUT `/lobby`

Returns the id of hte newly created lobby.


### Join a lobby

POST `/lobby/:lobbyId/join`

Allows you to join a lobby.

The request has to have following headers:

-   `username` - String - Required

Example

```
POST /lobby/2b499c5a-40ee-4a2b-ad25-e108a653b9c7/join
username: user123
```


### Start the game

POST `/lobby/:lobbyId/game/start`

The request has to have following headers:

-   `userId` - String - Required


### Attack

POST `/lobby/:lobbyId/game/attack`

The request has to have following headers:

-   `userId` - String - Required

The request body hast to be in JSON format and has to contain following properties:

-   `suit` - String - Required
-   `value` - String - Required

Example for a body

```
{
    "suit": "DIAMOND",
    "value": "NINE"
}
```


### Help


### Defend


### Give up


---

## WebSockets


### Listen to the Lobby

WS `/lobby/:lobbyId/listenLobby`

The request has to have following headers:

-   `userId` - String - Required

Returns a List of joined player.

Example

```
["user123"]
["user123", "user4242"]
```

### Listen to the GameState

WS `/lobby/:lobbyId/game/listenGameState`

The request has to have following headers:

-   `userId` - String - Required

Returns the current GameState

Example

```
{
    "selfPlayer": {
        "hash": "b6ff0a36652e941265b52f7fafff2603",
        "cards": [
            {
                "suit": "DIAMOND",
                "value": "NINE"
            },
            {
                "suit": "HEART",
                "value": "QUEEN"
            },
            {
                "suit": "DIAMOND",
                "value": "EIGHT"
            },
            {
                "suit": "CLUB",
                "value": "TEN"
            },
            {
                "suit": "CLUB",
                "value": "QUEEN"
            },
            {
                "suit": "SPADE",
                "value": "QUEEN"
            }
        ]
    },
    "players": [
        {
            "hash": "b6ff0a36652e941265b52f7fafff2603",
            "username": "minemes",
            "cardCount": 6
        },
        {
            "hash": "bde12e3ca960dd843f864f326c7ac0ae",
            "username": "minemes2",
            "cardCount": 6
        }
    ],
    "stackCount": 24,
    "trump": {
        "suit": "SPADE",
        "value": "NINE"
    },
    "battlefield": [],
    "attackerHash": "b6ff0a36652e941265b52f7fafff2603",
    "defenderHash": "bde12e3ca960dd843f864f326c7ac0ae",
    "helperHash": null,
    "attackGaveUp": false,
    "defenderGaveUp": false,
    "helperGaveUp": false,
    "gameFinished": false
}
```