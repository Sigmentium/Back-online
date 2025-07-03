const WebSocket = require('ws');

const port = process.env.PORT || 1000;

const wss = new WebSocket.Server({ port });
///////////////////////////////////////////

let TsuEFa = [];
let BullsCows = [];

// function GenerateId() {}

function Send(to, type, data) {
    const data = JSON.parse(data);

    switch (type) {
        case 'Info-Tsu-E-Fa':
            to.send(JSON.stringify({
                type: 'Info',
                item: data.item
            }));
            break;
        case 'Connected':
            to.send(JSON.stringify({
                type: 'Found',
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

    ws.on('message', (msg) => {
        const data = JSON.parse(msg);

        if (data.type === 'Info-Tsu-E-Fa') {
            Send(Opponent.Connection, 'Info-Tsu-E-Fa', JSON.stringify({ item: data.item }));
        }
        else if (data.type ===  'Connected') {
            if (data.game === 'Tsu-E-Fa') {
                if (TsuEFa.length < 1) {
                    TsuEFa.push({ 'UserId': data.UserId, 'Connection': ws });
                }
                else {
                    Opponent = TsuEFa[0];
        
                    Send(ws, 'Connected', JSON.stringify({ UserId: Opponent.UserId }));
                    Send(Opponent.Connection, 'Connected', JSON.stringify({ UserId: data.UserId }));
        
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