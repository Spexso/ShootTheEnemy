addEventListener('click', (event) => {

  const playerPosition = {
    x: FrontendPlayers[socket.id].x,
    y: FrontendPlayers[socket.id].y
  }
  // Get angle 
  const angle = Math.atan2(
    (event.clientY * window.devicePixelRatio) - playerPosition.y,
    (event.clientX * window.devicePixelRatio) - playerPosition.x
  )

  // Get velocity
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }

  frontEndProjectiles.push(
    new Projectile({
      x: playerPosition.x, 
      y: playerPosition.y,
      radius: 5,
      color: 'white',
      velocity
    })
  )

  console.log(frontEndProjectiles)
})