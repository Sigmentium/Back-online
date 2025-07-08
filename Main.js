const WebSocket = require('ws');

const port = process.env.PORT || 1000;

const wss = new WebSocket.Server({ port });
///////////////////////////////////////////

let Sessions = new Map();

let TsuEFa = [];
let BullsCows = [];

function GenerateId(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function Winner(Player, Opponent, PlayerConnection, OpponentConnection) {
    if (Player === Opponent) {
        Count = 0;
        Player = undefined;
        Opponent = undefined;

        Send(PlayerConnection, 'Draw');
        Send(OpponentConnection, 'Draw');
    }
    else if ((Player === 'Камень' && Opponent === 'Ножницы') ||
             (Player === 'Ножницы' && Opponent === 'Бумага') ||
             (Player === 'Бумага' && Opponent === 'Камень')) {
        Count = 0;
        Player = undefined;
        Opponent = undefined;

        Send(PlayerConnection, 'Win');
        Send(OpponentConnection, 'Defeat');
    }
    else {
        Count = 0;
        Player = undefined;
        Opponent = undefined;

        Send(PlayerConnection, 'Defeat');
        Send(OpponentConnection, 'Win');
    }
}

function Send(to, type, data = '{}') {
    data = JSON.parse(data);

    switch (type) {
        case 'Info-Tsu-E-Fa':
            to.send(JSON.stringify({
                type: 'Info',
                item: data.item
            }));
            break;
        case 'Win':
            to.send(JSON.stringify({
                type: 'Win'
            }));
            break;
        case 'Defeat':
            to.send(JSON.stringify({
                type: 'Defeat'
            }));
            break;
        case 'Draw':
            to.send(JSON.stringify({
                type: 'Draw'
            }));
            break;
        case 'Connected':
            to.send(JSON.stringify({
                type: 'Connected',
                UserId: data.UserId,
                Name: data.Name
            }));
            break;
        case 'Disconnected':
            to.send(JSON.stringify({
                type: 'Disconnected'
            }));
            break;
    }
}

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const data = JSON.parse(msg);

        if (data.type === 'Info-Tsu-E-Fa') {
            const Session = Sessions.get(ws.session);

            Session.Count++;
            Session.Items.set(ws, data.item);

            if (Session.Count === 2) {
                const PlayerItem = Session.Items.get(Session.Player.Connection);
                const OpponentItem = Session.Items.get(Session.Opponent.Connection);

                Winner(PlayerItem, OpponentItem, Session.Player.Connection, Session.Opponent.Connection);

                Sessions.delete(ws.session);
            }
        }
        else if (data.type === 'Connected') {
            if (data.game === 'Tsu-E-Fa') {
                if (TsuEFa.length < 1) {
                    TsuEFa.push({ UserId: data.UserId, Name: data.Name, Connection: ws });
                }
                else {
                    const Player = { UserId: data.UserId, Name: data.Name, Connection: ws };
                    const Opponent = TsuEFa.shift();

                    const SessionId = GenerateId(12);
                    ws.session = SessionId;
                    Opponent.Connection.session = SessionId;

                    Sessions.set(SessionId, {
                        Count: 0,
                        Player,
                        Opponent,
                        Items: new Map()
                    });

                    Send(ws, 'Connected', JSON.stringify({ UserId: Opponent.UserId, Name: Opponent.Name }));
                    Send(Opponent.Connection, 'Connected', JSON.stringify({ UserId: Player.UserId, Name: Player.Name }));
                }
            }
        }
    });

    ws.on('close', () => {
        const Session = Sessions.get(ws.session);

        if (Session) {
            Send(Session.Opponent.Connection, 'Disconnected');
            Sessions.delete(ws.session);
        }
    });
});

console.log('> Successful start');