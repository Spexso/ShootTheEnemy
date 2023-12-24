// Create express server 
// Later express server will be wrapped around http server
const express = require('express')
const app = express()

// Set up http protocol 
// Create the server from 'app'
// 1-Since we are using socket.io, we need a http server to use it on socket.io 
// 2-Thats why we wrap the http server around the express server  
const http = require('http')
const server = http.createServer(app)

// Socket io setup 
// Wrapped around http server 
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 3000})           // Checks clients in every 2 seconds & if no response in 3 seconds timeouts clients

// Port Number for local run
const port = 3000

app.use(express.static('public'))

// Response to the requests
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

/* Above Server Set up */
////////////////////////////////////////////////////////////////////////////////////////////////////////

// Players array to store each player's informations
const serverPlayers = {}

// Amount of pixels to shift on movement
const moveSpeed = 10

// Radius of player pawn
const RADIUS = 10

// Projectiles array 
const serverProjectiles = {}
let projectileId = 0
const PROJECTILE_RADIUS = 5


// Player connection Handle
// Function will stay alive until player disconnect
// Event driven functions will be called inside this function 
io.on('connection', (socket) => {
  
  console.log('A new player has connected');

  // Create a new player with id comes from socket
  // 2D Locations of players are randomized
  serverPlayers[socket.id] = {
    x: 600 * Math.random(),
    y: 600 * Math.random(),
    radius: 10,
    color: `hsl(${360 * Math.random()}, 100%, 70%)`,         // Generate random color for player 
    sequenceNumber: 0,
    points: 0
  }    
  
  // Broadcast new players to everyone
  io.emit('refreshPlayers', serverPlayers)

  // Listen for connect then initialize canvas
  socket.on('initCanvas', ({width, height, devicePixelRatio}) => {

    serverPlayers[socket.id].canvas = {
      width,
      height,
    }

    
    // Set player radius
    if( devicePixelRatio > 1) {
      serverPlayers[socket.id].radius = 2 * RADIUS
    } else {
      serverPlayers[socket.id].radius = RADIUS
    }
    
  })

  // Listen for shoot action 
  socket.on('shoot', ({x, y, angle}) => {
    projectileId++;

    // Calculate velocity
    const velocity = {
      x: Math.cos(angle) * 20,
      y: Math.sin(angle) * 20
    }

    serverProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }

    console.log(serverProjectiles)
  })
  
  // If player disconnects delete that player and send a response
  socket.on('disconnect', (reason) => {
    
    delete serverPlayers[socket.id]       // Player deletion
    
    console.log('A player has disconnected');
    console.log(reason)
    
    io.emit('refreshPlayers', serverPlayers)
  })


  // Player inputs will be caught here
  socket.on('keydown', ({keycode, sequenceNumber }) => {
    

    // Track sequence number of keys for individual player
    serverPlayers[socket.id].sequenceNumber = sequenceNumber

    // Based on input select movement action
    switch (keycode) {
      case 'keyW':
        console.log('Key W initiated');
        serverPlayers[socket.id].y -= moveSpeed
        break

      case 'keyA':
        console.log('Key A initiated');
        serverPlayers[socket.id].x -= moveSpeed
        break

      case 'keyS':
        console.log('Key S initiated');
        serverPlayers[socket.id].y += moveSpeed
        break

      case 'keyD':
        console.log('Key D initiated');
        serverPlayers[socket.id].x += moveSpeed
        break

      default:
        console.log("Key did not recognized")
    }
  })
  
  console.log(serverPlayers)
})


/**
 * Server tick rate initialized here 
 * Interval set as 15ms by default 
 */
setInterval( () => {

  // Update projectiles positions
  for (const id in serverProjectiles) {

    serverProjectiles[id].x += serverProjectiles[id].velocity.x
    serverProjectiles[id].y += serverProjectiles[id].velocity.y


    
    // Delete projectile if it reaches end of canvas
    if(
         serverProjectiles[id].x - PROJECTILE_RADIUS >= serverPlayers[serverProjectiles[id].playerId]?.canvas?.width 
      || serverProjectiles[id].x + PROJECTILE_RADIUS <= 0 
      || serverProjectiles[id].y - PROJECTILE_RADIUS >= serverPlayers[serverProjectiles[id].playerId]?.canvas?.height
      || serverProjectiles[id].y + PROJECTILE_RADIUS <= 0 
      ) 
      {
      
        delete serverProjectiles[id]
        continue;
      }

    for(const playerId in serverPlayers){

      const serverPlayer = serverPlayers[playerId]

      const distance_projectile_player = Math.hypot(
                                  serverProjectiles[id].x - serverPlayer.x, 
                                  serverProjectiles[id].y - serverPlayer.y)
      
      // Remove projectile and player if they collide
      if( 
        distance_projectile_player < PROJECTILE_RADIUS + serverPlayer.radius && 
        serverProjectiles[id].playerId !== playerId) {

          if(serverPlayers[serverProjectiles[id].playerId]){

            serverPlayers[serverProjectiles[id].playerId].points++
            console.log(serverPlayers[serverProjectiles[id].playerId])
          }
          

          delete serverProjectiles[id]
          delete serverPlayers[playerId]
        break;
      }
    }
  }

  io.emit('refreshProjectiles', serverProjectiles)
  io.emit('refreshPlayers', serverPlayers)
}, 15)


// Listening on http server
server.listen(port, () => {

  console.log(`Program listening on port ${port}`);
})
