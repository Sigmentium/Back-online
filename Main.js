const WebSocket = require('ws');

const port = process.env.PORT || 1000;

const wss = new WebSocket.Server({ port });
///////////////////////////////////////////

let Count = 0;
let Player, Opponent;
let TsuEFaItems = new Map();

let TsuEFa = [];
let BullsCows = [];

// function GenerateId() {}

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

function Winner(Player, Opponent, PlayerConnection, OpponentConnection) {
    if (Player === Opponent) {
        Count = 0;
        Player = undefined;
        Opponent = undefined;
        TsuEFaItems.clear();

        Send(PlayerConnection, 'Draw');
        Send(OpponentConnection, 'Draw');
    }
    else if ((Player === 'Камень' && Opponent === 'Ножницы') ||
             (Player === 'Ножницы' && Opponent === 'Бумага') ||
             (Player === 'Бумага' && Opponent === 'Камень')) {
        Count = 0;
        Player = undefined;
        Opponent = undefined;
        TsuEFaItems.clear();

        Send(PlayerConnection, 'Win');
        Send(OpponentConnection, 'Defeat');
    }
    else {
        Count = 0;
        Player = undefined;
        Opponent = undefined;
        TsuEFaItems.clear();

        Send(PlayerConnection, 'Defeat');
        Send(OpponentConnection, 'Win');
    }
}

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const data = JSON.parse(msg);

        if (data.type === 'Info-Tsu-E-Fa') {
            Count++;
            TsuEFaItems.set(Player.Connection, data.item);

            if (Count === 2) {
                Winner(TsuEFaItems.get(Player.Connection), TsuEFaItems.get(Opponent.Connection), Player.Connection, Opponent.Connection);
            }
        }
        else if (data.type ===  'Connected') {
            if (data.game === 'Tsu-E-Fa') {
                if (TsuEFa.length < 1) {
                    TsuEFa.push({ UserId: data.UserId, Name: data.Name, Connection: ws });
                }
                else {
                    Player = { UserId: data.UserId, Name: data.Name, Connection: ws };
                    Opponent = TsuEFa[0];
        
                    Send(ws, 'Connected', JSON.stringify({ UserId: Opponent.UserId, Name: Opponent.Name }));
                    Send(Opponent.Connection, 'Connected', JSON.stringify({ UserId: data.UserId, Name: data.Name }));
        
                    TsuEFa.shift();
                }
            }
        }
    });

    ws.on('close', () => {
        Send(Opponent.Connection, 'Disconnected');
    });
});

console.log('> Successful start');