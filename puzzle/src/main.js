import { Application, Assets, Sprite, Text, Graphics } from "pixi.js";

(async () => {
  
  // const sound = new Howl()

  // Create a new application
  const app = new Application();

  // Div tag
  const pixiContainer = document.getElementById("pixi-container")

  // Initialize the application
  await app.init({ background: "#D4AF37", resizeTo: pixiContainer });

  // Append the application canvas to the document body
  pixiContainer.appendChild(app.canvas);

  // VARIABLES
  const appWidth = app.screen.width
  const appHeight = app.screen.height
  const boardWidth = appWidth*0.4
  const boardHeight = appHeight*0.7
  const boardMargin = 75
  const boardX = boardMargin-30
  const boardY = boardMargin+20
  const boardPadding = 25
  const blockContainer = []
  const blockGap = 5
  const blockWidth = boardWidth/3 - blockGap*(2/3) - boardPadding*(2/3)
  const blockHeight = boardHeight/3 - blockGap*(2/3) - boardPadding*(2/3)
  const rowPiece = 3
  const columnPiece =  3
  const numbersOfPiece = rowPiece*columnPiece
  const pieceContainer = []
  const pieceAreaWidth = appWidth*0.28
  const pieceAreaHeight = appHeight*0.4
  var score = 0

  // colors
  const white = "#FFFFFF"
  const gray = "#808080"
  const deepRed = "#A50000"
  const richGold = "#D4AF37"

  // Load the bunny texture
  const texture = await Assets.load("/assets/bunny.png");

  // Create Board
  createRect(boardWidth, boardHeight,  deepRed, boardX, boardY)

  // Create Block
  var gx = 0
  var gy = 0
  var w = 0
  var h = 0
  for(var i = 0; i < numbersOfPiece; i++){
    var rectX = boardX + boardPadding + blockGap*gx + blockWidth*w
    var rectY = boardY + boardPadding + blockGap*gy + blockHeight*h
    var block = {
      id: i,
      block: createRect(blockWidth, blockHeight, white, rectX, rectY)
    }
    blockContainer.push(block)
    if((i+1) % rowPiece == 0){
      gx = 0
      gy++
      w = 0
      h++
    } else{
      gx++  
      w++
    }
  }

  // Create Text
  createText("Cambodian Story", deepRed, appWidth/1.375, 150)
  var scoreText = createText(`Your score: ${score}/90`,white, appWidth/1.375, 200)

  // Create Bunny
  for(var i = 0; i < numbersOfPiece; i++){
    var piece = {
      id: i,
      piece: createBunny(appWidth/2 + Math.floor(Math.random() * pieceAreaWidth), appHeight/5 + Math.floor(Math.random() * pieceAreaHeight)),
      allowToMove: true
    }
      pieceContainer.push(piece)
  }

  function createBunny(x, y)
  {
      const bunny = new Sprite(texture, 0,5);

      // Enable the bunny to be interactive... this will allow it to respond to mouse and touch events
      bunny.eventMode = 'static';

      // This button mode will mean the hand cursor appears when you roll over the bunny with your mouse
      bunny.cursor = 'pointer';

      // Center the bunny's anchor point
      bunny.anchor.set(0.5);

      // Make it a bit bigger, so it's easier to grab
      bunny.scale.set(3);

      // Setup events for mouse + touch using the pointer events
      bunny.on('pointerdown', onDragStart, bunny);

      // Move the sprite to its designated position
      bunny.position.set(x + bunny.width/2, y + bunny.height)

      // Add it to the stage
      app.stage.addChild(bunny);

      return bunny
  }

  function createRect(width, height, color, x, y){
    const graphics = new Graphics()
      .rect(x, y, width, height)
      .fill(color);
      
    graphics.pivot.set(0, 0)
    
    app.stage.addChild(graphics)
    return graphics
  }

  function createText(text, color, x, y){
    const theText = new Text({
      text: text,
      style: {
        fontFamily:'Arial',
        fontSize: 30,
        fill: color,
        align: "center"
      }
    });

    theText.x = x - theText.width/2;
    theText.y = y - theText.height/2;

    app.stage.addChild(theText);
    return theText
  }

  function detectCollision(obj1, obj2){
    var obj1Bound = obj1.getBounds()
    var obj2Bound = obj2.getBounds()

    return obj1Bound.x + obj1.width > obj2Bound.x &&
           obj1Bound.x < obj2Bound.x + obj2.width &&
           obj1Bound.y + obj1.height > obj2Bound.y &&
           obj1Bound.y < obj2Bound.y + obj2.height;
  }

  function changeRectColor(block, color){
    var blockBounds = block.getBounds()
    var blockX = blockBounds.x 
    var blockY = blockBounds.y 
    var blockWidth = blockBounds.width
    var blockHeight = blockBounds.height 
    block.clear()
      .rect(blockX, blockY, blockWidth, blockHeight)
      .fill(color);

  }

  let dragTarget = null;

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd);
  app.stage.on('pointerupoutside', onDragEnd);

  function onDragMove(event)
  {
      if (dragTarget)
      {
          dragTarget.parent.toLocal(event.global, null, dragTarget.position);
      }
      
    blockContainer.forEach(block => {
      if(detectCollision(block.block, dragTarget)){
        changeRectColor(block.block, gray)
      }else{
        changeRectColor(block.block, white)
      }
    });
  }

  function onDragStart()
  {
      // Store a reference to the data
      // * The reason for this is because of multitouch *
      // * We want to track the movement of this particular touch *
      this.alpha = 0.5;
      dragTarget = this;
      app.stage.on('pointermove', onDragMove);
      console.log(dragTarget)
  }

  function onDragEnd()
  {
    if (dragTarget)
    {
      app.stage.off('pointermove', onDragMove);
      dragTarget.alpha = 1;
      pieceContainer.forEach(piece => {
        var touchedBlock = blockContainer[piece.id].block
        changeRectColor(touchedBlock, white)
        if(piece.piece == dragTarget){
          if(detectCollision(touchedBlock, dragTarget)) {
            var _bounds = touchedBlock.getBounds()
            var x = _bounds.x + _bounds.width/2
            var y = _bounds.y + _bounds.height/2
            window.alert("got it")
            score += 10
            scoreText.text = `Your score: ${score}/90`
            if(score == 90){
              const utterance = new SpeechSynthesisUtterance("You have just beated the puzzle game congratulation");
              window.speechSynthesis.speak(utterance)
              const test = new SpeechSynthesisUtterance("testing");
              window.speechSynthesis.speak(test)
            }
            piece.piece.eventMode = ""
            piece.piece.cursor = ""
            piece.piece.position.set(x, y)
          }
        }
      });
      dragTarget = null;
    }
  }

  // console.log(blockContainer)
  // console.log(pieceContainer)

  // Listen for animate update
  // app.ticker.add((time) => {
  //   // Just for fun, let's rotate mr rabbit a little.
  //   // * Delta is 1 if running at 100% performance *
  //   // * Creates frame-independent transformation *
  //   bunny.rotation += 0.1 * time.deltaTime;

  // });
})();
