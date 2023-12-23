const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Create socket object 
const socket = io()

const scoreEl = document.querySelector('#scoreEl')

// Device screens pixel ratio assign if no ratio set it to 1 which is default value
const resolutionRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * resolutionRatio
canvas.height = innerHeight * resolutionRatio

const x = canvas.width / 2
const y = canvas.height / 2

// const player = new Player(x, y, 10, 'white')
const FrontendPlayers = {}

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
        color: backendPlayer.color
      })
    } else {

      if (id === socket.id) {

        // if a player already exists
        FrontendPlayers[id].x = backendPlayer.x
        FrontendPlayers[id].y = backendPlayer.y

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backendPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          FrontendPlayers[id].x += input.dx
          FrontendPlayers[id].y += input.dy
        })
      }
      else {

        // For other players

        gsap.to(FrontendPlayers[id], {
          x: backendPlayer.x,
          y: backendPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })

      }
    }
  }

  // Iterate through every player that comes from Frontend
  for (const id in FrontendPlayers){
    
    // If Player from frontend does not exist on backend delete player from game
    if(!appPlayers[id]){

      delete FrontendPlayers[id];
    }
  }
  
})

/*
* No need currently 

const projectiles = []
const enemies = []
const particles = []
*/


/*
* Function not needed since enemies will be other players

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4

    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}
*/

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw all players
  for (const id in FrontendPlayers) {

    const PlayerToDraw = FrontendPlayers[id];

    PlayerToDraw.draw();
  }
/*
* No need currently 

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]

    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index]

    projectile.update()

    // remove from edges of screen
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1)
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]

    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    //end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
    }

    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex]

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }
            )
          )
        }
        // this is where we shrink our enemy
        if (enemy.radius - 10 > 5) {
          score += 100
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          projectiles.splice(projectilesIndex, 1)
        } else {
          // remove enemy if they are too small
          score += 150
          scoreEl.innerHTML = score

          enemies.splice(index, 1)
          projectiles.splice(projectilesIndex, 1)
        }
      }
    }
  }
  */

}

const LocalSpeed = 10;
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

    FrontendPlayers[socket.id].y -= LocalSpeed
    socket.emit('keydown', { keycode: 'keyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -LocalSpeed, dy: 0})

    FrontendPlayers[socket.id].x -= LocalSpeed
    socket.emit('keydown', { keycode: 'keyA', sequenceNumber })
  }

  if (keys.s.pressed) {
   
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: LocalSpeed })

    FrontendPlayers[socket.id].y += LocalSpeed
    socket.emit('keydown', { keycode: 'keyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: LocalSpeed, dy: 0})

    FrontendPlayers[socket.id].x += LocalSpeed
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
      console.log('W key pressed')
      keys.w.pressed = true
      break

    case 'KeyA':
      console.log('A key pressed')
      keys.a.pressed = true
      break
    
    case 'KeyD':
      console.log('D key pressed')  
      keys.d.pressed = true
      break
      
    case 'KeyS':
      console.log('S key pressed')
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
