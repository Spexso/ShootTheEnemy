const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Create socket object 
const socket = io()

const scoreEl = document.querySelector('#scoreEl')

// Device screens pixel ratio assign if no ratio set it to 1 which is default value
const resolutionRatio = window.devicePixelRatio || 1

canvas.width = 1024 * resolutionRatio
canvas.height = 576 * resolutionRatio

c.scale(resolutionRatio, resolutionRatio)

const x = canvas.width / 2
const y = canvas.height / 2

// const player = new Player(x, y, 10, 'white')
const FrontendPlayers = {}

// Shot projectile array objects
const frontEndProjectiles = {}

// Refresh players on frontend
socket.on('refreshPlayers', (appPlayers) => {

  // Iterate through every player that comes from backend
  for (const id in appPlayers){
    
    const backendPlayer = appPlayers[id];

    // If a new player connected to frontend side create that player / Else 
    if(!FrontendPlayers[id]) {

      /** Passing construct arguments as single object so I can see what kind of variables Player has
       * Applying hsl instead of generic color to manipulate color of each spawned player 
       */
      FrontendPlayers[id] = new Player({
        x:backendPlayer.x,
        y:backendPlayer.y,
        radius: backendPlayer.radius,
        color: backendPlayer.color,
        username: backendPlayer.username
      })

      // Dynamically fill Leaderboard 
      document.querySelector('#playerLabels').innerHTML += 
      `<div data-id="${id}" 
      data-points="${backendPlayer.points}",style="margin-bottom: 3px;">
      ${backendPlayer.username}: ${backendPlayer.points}</div>`

    } else {
      // Update score of player
      document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backendPlayer.username} : ${backendPlayer.points}`

      /* Sort players based on their points */
      document.querySelector(`div[data-id="${id}"]`).setAttribute('data-points', backendPlayer.points)

      const parentDiv = document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      childDivs.sort( (a, b) => {
        const FirstS = Number(a.getAttribute('data-points'))
        const SecondS = Number(b.getAttribute('data-points'))

        return SecondS - FirstS
      })

      // Remove old Element
      childDivs.forEach(div => {

        parentDiv.removeChild(div)
      })

      // Add sorted Element
      childDivs.forEach(div => {
      
        parentDiv.appendChild(div)
      })


      FrontendPlayers[id].target = {
        x: backendPlayer.x,
        y: backendPlayer.y
      }

      /********************************** */

      if (id === socket.id) {

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backendPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          FrontendPlayers[id].target.x += input.dx
          FrontendPlayers[id].target.y += input.dy
        })
      }
      
    }
  }

  // Iterate through every player that comes from Frontend
  for (const id in FrontendPlayers){
    
    // If Player from frontend does not exist on backend delete player from game
    // Also Delete name of player from Leaderboard
    if(!appPlayers[id]){

      const LabelToDelete = document.querySelector(`div[data-id="${id}"]`)
      LabelToDelete.parentNode.removeChild(LabelToDelete)

      if( id == socket.id) {
        document.querySelector('#usernameForm').style.display = 'block'
      }

      delete FrontendPlayers[id];
    }
  }

})


socket.on('refreshProjectiles', (serverProjectiles) => {

  for (const id in serverProjectiles) {

    const serverProjectile = serverProjectiles[id]
    
    // If projectile not existing, create projectile 
    if(!frontEndProjectiles[id]) {

      // Create new projectile
      frontEndProjectiles[id] = new Projectile({
        x: serverProjectile.x, 
        y: serverProjectile.y,
        radius: 5,
        color: FrontendPlayers[serverProjectile.playerId]?.color,       // Only call color if player is available 
        velocity: serverProjectile.velocity
      })
    } else {

      frontEndProjectiles[id].x += serverProjectiles[id].velocity.x
      frontEndProjectiles[id].y += serverProjectiles[id].velocity.y


    }
  }

  // Iterate through every projectile
  for (const frontEndProjectileId in frontEndProjectiles){
    
    // If a Projectile hits the edge of canvas delete it 
    if(!serverProjectiles[frontEndProjectileId]){

      delete frontEndProjectiles[frontEndProjectileId];
    }
  }

})


let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)
  
  // Draw all players
  for (const id in FrontendPlayers) {

    const PlayerToDraw = FrontendPlayers[id]

    // Linear Interpolation 
    if(PlayerToDraw.target) {

      FrontendPlayers[id].x += ( FrontendPlayers[id].target.x - FrontendPlayers[id].x ) * 0.5

      FrontendPlayers[id].y += ( FrontendPlayers[id].target.y - FrontendPlayers[id].y ) * 0.5
    }

    PlayerToDraw.draw();
  }

  
  for (const id in frontEndProjectiles) {

    const ProjectileToDraw = frontEndProjectiles[id];

    ProjectileToDraw.draw();
  }
  
}

const LocalSpeed = 6;
const playerInputs = []
let sequenceNumber = 0

animate()

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

setInterval(() => {
  
  if(keys.w.pressed) {

    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -LocalSpeed })

    //FrontendPlayers[socket.id].y -= LocalSpeed
    socket.emit('keydown', { keycode: 'keyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -LocalSpeed, dy: 0})

    //FrontendPlayers[socket.id].x -= LocalSpeed
    socket.emit('keydown', { keycode: 'keyA', sequenceNumber })
  }

  if (keys.s.pressed) {
   
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: LocalSpeed })

    //FrontendPlayers[socket.id].y += LocalSpeed
    socket.emit('keydown', { keycode: 'keyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: LocalSpeed, dy: 0})

    //FrontendPlayers[socket.id].x += LocalSpeed
    socket.emit('keydown', { keycode: 'keyD', sequenceNumber })
  }

}, 15);

window.addEventListener('keydown', (event) => {

  // Abort if frontend player is not initialized yet
  if(!FrontendPlayers[socket.id]){
    return
  }
    
  // Based on input select movement action
  switch(event.code){

    case 'KeyW':
      //console.log('W key pressed')
      keys.w.pressed = true
      break

    case 'KeyA':
      //console.log('A key pressed')
      keys.a.pressed = true
      break
    
    case 'KeyD':
      //console.log('D key pressed')  
      keys.d.pressed = true
      break
      
    case 'KeyS':
      //console.log('S key pressed')
      keys.s.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!FrontendPlayers[socket.id]) 
    return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break

    case 'KeyA':
      keys.a.pressed = false
      break

    case 'KeyS':
      keys.s.pressed = false
      break

    case 'KeyD':
      keys.d.pressed = false
      break
  }
})


// Event Listener for username select form 
document.querySelector('#usernameForm').addEventListener('submit', (event)=> {
  event.preventDefault()

  document.querySelector('#usernameForm').style.display='none'
  socket.emit('initGame', {
    width: canvas.width, 
    height: canvas.height, 
    resolutionRatio,
    username: document.querySelector('#usernameInput').value
  })

})