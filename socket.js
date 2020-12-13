const games = {};

const getBlocks = () => {
  const colors = ['blue', 'cyan', 'green', 'purple', 'red'];
  const blocks = [];
  for (let i = 0; i < 200; i++) {
    blocks.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  return blocks;
}

const setupSockets = (http) => {

  var io = require('socket.io')(http, {
    origins: '*:*'
  });

  io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('join', (game) => {
      if (!games[game]) {
        games[game] = {
          id: game,
          started: false,
          startsOn: false,
          host: socket.id,
          players: [socket.id],
          blocks: getBlocks()
        };
        socket.emit('host', games[game])
      } else {
        games[game].players.push(socket.id);
        socket.emit('wait', games[game])
      }
      console.log(games[game]);
      socket.join(game);
      io.to(game).emit('players', games[game].players);
    })

    socket.on('players', (game) => {
      console.log("players", game);
      const players = games[game] ? games[game].players : [];
      socket.emit('players', players);
    })

    socket.on('start', (game) => {
      console.log("got start", game);
      if (games[game]) {
        console.log("got game")
        if (games[game].host === socket.id) {
          console.log("is host")
          games[game].started = true;
          games[game].startsOn = Date.now() + (1000 * 5);
          io.to(game).emit('start', games[game]);
        }
      }
    })

    socket.on('attack', (msg) => {
      console.log('attack', msg);
      io.to(msg.game).emit('attack', {
        attackerId: socket.id,
        numRows: 1
      });
    })

  });

}

exports.setupSockets = setupSockets;