addEventListener('click', (event) => {
  
  // Get canvas element
  const canvas = document.querySelector('canvas')
  const{ top, left} = canvas.getBoundingClientRect()

  const playerPosition = {
    x: FrontendPlayers[socket.id].x,
    y: FrontendPlayers[socket.id].y
  }
  // Get angle 
  const angle = Math.atan2(
    (event.clientY - top)  - playerPosition.y,
    (event.clientX - left)  - playerPosition.x
  )

  // Get velocity
  /*
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  */

  socket.emit('shoot', {
    x: playerPosition.x,
    y: playerPosition.y,
    angle
  })
  /*
  frontEndProjectiles.push(
    new Projectile({
      x: playerPosition.x, 
      y: playerPosition.y,
      radius: 5,
      color: 'white',
      velocity
    })
  )
  */

  console.log(frontEndProjectiles)
})