const WebSocket = require('ws');

const port = process.env.PORT || 1000;

const wss = new WebSocket.Server({ port });
///////////////////////////////////////////

let TsuEFa = [];
let BullsCows = [];

// function GenerateId() {}

function Send(to, type, data) {
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
                type: 'Win',
                item: data.item
            }));
            break;
        case 'Defeat':
            to.send(JSON.stringify({
                type: 'Defeat',
                item: data.item
            }));
            break;
        case 'Draw':
            to.send(JSON.stringify({
                type: 'Draw',
                item: data.item
            }));
            break;
        case 'Connected':
            to.send(JSON.stringify({
                type: 'Connected',
                opponent: data.UserId
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
    let Opponent;
    let TsuEFaItems = {};

    ws.on('message', (msg) => {
        const data = JSON.parse(msg);

        if (data.type === 'Info-Tsu-E-Fa') {
            if (Object.keys(TsuEFaItems).length === 2) {
                const obj = Object.keys(TsuEFaItems);

                if (obj[0] === obj[1]) {
                    Send(obj[0], 'Draw');
                    Send(obj[1], 'Draw');
                }
                else if ((TsuEFaItems[ws] === 'Камень' && TsuEFaItems[Opponent.Connection] === 'Ножницы') ||
                         (TsuEFaItems[ws] === 'Ножницы' && TsuEFaItems[Opponent.Connection] === 'Бумага') ||
                         (TsuEFaItems[ws] === 'Бумага' && TsuEFaItems[Opponent.Connection] === 'Камень')) {            
                    Send(ws, 'Win');
                    Send(Opponent.Connection, 'Defeat');
                }
                else {
                    Send(ws, 'Defeat');
                    Send(Opponent.Connection, 'Win');
                }
            }
            else {
                TsuEFaItems[ws] = data.item;
            }
        }
        else if (data.type ===  'Connected') {
            if (data.game === 'Tsu-E-Fa') {
                if (TsuEFa.length < 1) {
                    TsuEFa.push({ UserId: data.UserId, Name: data.Name, Connection: ws });
                }
                else {
                    Opponent = TsuEFa[0];
        
                    Send(ws, 'Connected', JSON.stringify({ UserId: Opponent.UserId, Name: Opponent.Name }));
                    Send(Opponent.Connection, 'Connected', JSON.stringify({ UserId: data.UserId, Name: data.Name }));
        
                    TsuEFa.shift();
                }
            }
            // else if (data.game === 'Bulls-Cows') {
            //     if (BullsCows.length < 1) {
            //         BullsCows.push({ 'UserId': data.UserId, 'Connection': ws });
            //     }
            //     else {
            //         Opponent = BullsCows[0];

            //         Send(ws, 'Connected', JSON.stringify({ UserId: Opponent.UserId}));
            //         Send(Opponent.Connection, 'Connected', JSON.stringify({ UserId: data.UserId }));

            //         BullsCows.shift();
            //     }
            // }
        }
    });

    ws.on('close', () => {
        Send(Opponent.Connection, 'Disconnected');
    });
});

console.log('> Successful start');