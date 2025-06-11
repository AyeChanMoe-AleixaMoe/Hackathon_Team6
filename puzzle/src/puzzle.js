import { Container, Application, Assets, Sprite, Text, Graphics } from "pixi.js";

(async () => {

  // Objects
  class Scroll {
    constructor(sprite, imgTexture, name){
        this.texture = scrollTexture
        this.sprite = sprite
        this.imgTexture = imgTexture
        this.name = name
        this.completed = completedScroll.includes(this.name.replaceAll('"', '').toLowerCase())
        this.width = sprite.width
        this.height = sprite.height
        this.x = sprite.x 
        this.y = sprite.y
        if(!this.completed) {
            this.sprite.on('pointerdown', this.click.bind(this))
            this.sprite.rotation += 0.5
        }
        this.questionSprite = ""
        this.scrollNameSprite = ""
    }
    click(){
        scrollContainer.removeChildren()
        this.name = this.name.replaceAll('"', '').toLowerCase()
        puzzleScene(this.name)
    }
    slideInit(){

    }
    displayText(){
        if(this.completed) {
            createSprite(scrollContainer, this.imgTexture, this.width*0.75, this.height*0.75, this.x - this.width/2.6, this.y - this.height/1.35).anchor.set(0.5)
        } else {
            this.questionSprite = createText(scrollContainer, "?", "Arial", 40, black, this.x, this.y)
        }
        this.scrollNameSprite = createText(scrollContainer, this.name, "Arial", 28, deepRed, this.x, this.y*1.45)
    }
  }

  class Puzzle {
    constructor(scrollName, pieceTexture, boardWidth, boardHeight, boardPadding, boardX, boardY, row, column, text, questionObj){
        this.puzzleCompleted = false
        this.scrollName = scrollName
        this.pieceTexture = pieceTexture
        this.pieceTextures = []
        this.boardWidth = boardWidth
        this.boardHeight = boardHeight
        this.boardPadding = boardPadding
        this.boardX = boardX
        this.boardY = boardY
        this.blockContainer = []
        this.blockGap = 10
        this.blockWidth = this.boardWidth/3 - this.blockGap*(2/3) - this.boardPadding*(2/3)
        this.blockHeight = this.boardHeight/3 - this.blockGap*(2/3) - this.boardPadding*(2/3)
        this.pieceContainer = []
        this.rowPiece = row
        this.columnPiece =  column
        this.numbersOfPiece = this.rowPiece * this.columnPiece
        this.pieceAreaWidth = appWidth*0.35
        this.pieceAreaHeight = appHeight*0.4
        this.noCompletedPiece = 0
        this.text = text
        this.textX = appWidth/1.45
        this.textY = 150
        this.font = 'Arial'
        this.questionObj = questionObj
        this.dragTarget = null
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;
        app.stage.on('pointerup', this.onDragEnd);
        app.stage.on('pointerupoutside', this.onDragEnd);
    }
    cropImg(){
        var rx = 0;
        var ry = 0;
        for (var i = 0; i < this.numbersOfPiece; i++) {
            const rectWidth = this.pieceTexture.width / this.rowPiece
            const rectHeight = this.pieceTexture.height / this.columnPiece
            const rectX = rx * rectWidth;
            const rectY = ry * rectHeight;

            const tempSprite = new Sprite(this.pieceTexture);

            // Define the mask using Graphics (e.g., a rectangle or circle)
            const maskShape = new Graphics();
            maskShape.rect(rectX, rectY, rectWidth, rectHeight);  // (x, y, width, height)
            maskShape.fill(0xffffff); // Fill is necessary

            // Create a container to hold the sprite and apply mask
            const container = new Container();
            container.addChild(tempSprite);
            container.addChild(maskShape);

            // Apply the mask to the sprite
            tempSprite.mask = maskShape;

            const croppedTexture = app.renderer.generateTexture(container);
            this.pieceTextures.push(croppedTexture);
            container.destroy({ children: true, texture: false, baseTexture: false });

            if ((i + 1) % this.rowPiece === 0) {
                rx = 0;
                ry++;
            } else {
                rx++;
            }
        }   
    }
    createBoard(){
        // Create Board
        createRect(puzzleContainer, this.boardWidth, this.boardHeight,  deepRed, this.boardX, this.boardY)

        // Create Text
        createText(puzzleContainer, this.text, this.font, 30, deepRed, this.textX, this.textY)

        // Create Block
        var gx = 0
        var gy = 0
        var w = 0
        var h = 0
        for(var i = 0; i < this.numbersOfPiece; i++){
            var rectX = this.boardX + this.boardPadding + this.blockGap*gx + this.blockWidth*w
            var rectY = this.boardY + this.boardPadding + this.blockGap*gy + this.blockHeight*h
            var block = {
                id: i,
                block: createRect(puzzleContainer, this.blockWidth, this.blockHeight, white, rectX, rectY)
            }
            this.blockContainer.push(block)
            if((i+1) % this.rowPiece == 0){
                gx = 0
                gy++
                w = 0
                h++
            } else{
                gx++  
                w++
            }
        }
    }
    createPiece(){
       for(let i = 0; i < this.numbersOfPiece; i++){
            (function(index) {
                var pieceAreaX = appWidth / 2 + Math.floor(Math.random() * this.pieceAreaWidth);
                var pieceAreaY = appHeight / 5 + Math.floor(Math.random() * this.pieceAreaHeight);
                var piece = {
                    id: index,
                    name: this.scrollName,
                    piece: createSprite(puzzleContainer, this.pieceTextures[index], this.blockWidth, this.blockHeight, pieceAreaX, pieceAreaY),
                };
                piece.piece.on('pointerdown', () => this.onDragStart(piece.piece));
                this.pieceContainer.push(piece);
            }).call(this, i);
        }
    }
    createMultipleChoice(){ // need for loop yeah
        const question = createText(puzzleContainer, this.questionObj.question, "Arial", 30, black, this.textX, this.textY + 50, 'left')
        const opts = ["A", "B", "C"]
        for(let i = 0; i < opts.length; i++){
            const option = createText(puzzleContainer, this.questionObj[opts[i]], "Arial", 30, black, this.textX, this.textY + 75 + question.height*i, 'left')
            option.interactive = true;
            option.buttonMode = true
            option.on('pointerdown', () => {
                console.log('yuh')
                if(option.text.charAt(0) == this.questionObj.Ans) this.puzzleCompleted = true
                if(this.puzzleCompleted && this.noCompletedPiece == this.numbersOfPiece){
                    createAnnouncement(puzzleContainer, appWidth/2, appHeight/2, 50, "You completed puzzle!", "You shall now continue your journey.", "Continue", 10, () => {
                        completedScroll.push(this.scrollName);
                        puzzleContainer.removeChildren();
                        scrollScene();
                    })
                } else{
                    console.log('why')
                    createAnnouncement(announceContainer, appWidth/2, appHeight/2, 50, "Nuh uh", "Tryna think again!", "OK", 10, () => {
                        announceContainer.removeChildren()
                    })
                }
            })
            puzzleContainer.addChild(option)
        }

        puzzleContainer.addChild(question)
   
    }
    onDragStart(sprite) {
        sprite.alpha = 0.5;
        this.dragTarget = sprite; 
        app.stage.on('pointermove', this.onDragMove);
    }

    onDragMove(event) {
        if (!this.dragTarget) return

        this.dragTarget.parent.toLocal(event.global, null, this.dragTarget.position);

        this.blockContainer.forEach(block => {
            if (detectCollision(block.block, this.dragTarget)) {
                changeRectColor(block.block, gray);
            } else {
                changeRectColor(block.block, white);
            }
        });
    }

    onDragEnd() {
        if (this.dragTarget) {
            app.stage.off('pointermove', this.onDragMove.bind(this));
            this.dragTarget.alpha = 1;

            this.pieceContainer.forEach(piece => {
                const touchedBlock = this.blockContainer[piece.id].block;
                changeRectColor(touchedBlock, white);

                if (piece.piece === this.dragTarget && detectCollision(touchedBlock, this.dragTarget)) {
                    const _bounds = touchedBlock.getBounds();
                    const x = _bounds.x + _bounds.width / 2;
                    const y = _bounds.y + _bounds.height / 2;

                    this.noCompletedPiece += 1;
                    piece.piece.eventMode = '';
                    piece.piece.cursor = '';
                    piece.piece.position.set(x, y);

                    if (this.noCompletedPiece === this.numbersOfPiece) {
                        this.createMultipleChoice()
                    }
                }
            });

            this.dragTarget = null;
        }
    }
}

  // colors
  const black = "#211D1D"
  const white = "#F5F5F5"
  const gray = "#808080"
  const deepRed = "#A50000"
  const richGold = "#D4AF37"

  // Create a new application
  const app = new Application();
  const pixiContainer = document.getElementById("pixi-container")
  await app.init({ background: richGold, resizeTo: pixiContainer });
  pixiContainer.appendChild(app.canvas);

  // APP
  const appWidth = app.screen.width
  const appHeight = app.screen.height
  
  // BACKGROUND
  const bgTextture = await Assets.load("/assets/puzzle_background.jpg")
  const bg = new Sprite(bgTextture)

  bg.anchor.set(0.5)
  bg.position.set(appWidth/2, appHeight/2)
  bg.width = appWidth
  bg.height = appHeight

  app.stage.addChild(bg)

  // SCROLL
  const scrollContainer = new Container()
  app.stage.addChild(scrollContainer)
  const numbersOfScroll = 5
  const scrollGap = 120
  const scrollWidth = appWidth/numbersOfScroll - (scrollGap/4)*5
  const scrollHeight = 200
  const scrollsX = (appWidth - ((scrollWidth + scrollGap) * numbersOfScroll - scrollGap))/2
  const scrollsY = appHeight/2 - scrollHeight
  const scrollCompletedWdith = appWidth/numbersOfScroll - (scrollGap/8)*5
  const scrollCompletedHeight = 200
  const scrollTextes = ['"Leaf"','"Flower"', '"Picking a flower"', '"Fruit"', '"Tendril"']
  const scrollTexture = await Assets.load("/assets/scroll.png");
  const scrollTextureCompleted = await Assets.load("/assets/scroll_completed.png");
  const completedScroll = []

  // PUZZLE
  const puzzleContainer = new Container()
  app.stage.addChild(puzzleContainer)
  const boardWidth = appWidth*0.38
  const boardHeight = appHeight*0.7
  const boardMargin = 90
  const boardX = boardMargin
  const boardY = boardMargin
  const boardPadding = 25
  const rowPiece = 3
  const columnPiece =  3
  const questions = {
    "leaf": {
        "question": "The meaning of the leaf gesture",
        "A": "A. Be kind",
        "B": "B. Be Nice",
        "C": "C. Be Brutal",
        "Ans": "A"
    },
    "flower": {
        "question": "The meaning of the flower gesture",
        "A": "A. Be kind",
        "B": "B. Be Nice",
        "C": "C. Be Brutal",
        "Ans": "A"
    },
    "picking a flower": {
        "question": "The meaning of the picking a flower gesture",
        "A": "A. Be kind",
        "B": "B. Be Nice",
        "C": "C. Be Brutal",
        "Ans": "B"
    },
    "fruit": {
        "question": "The meaning of the fruit gesture",
        "A": "A. Be kind",
        "B": "B. Be Nice",
        "C": "C. Be Brutal",
        "Ans": "A"
    },
    "tendril": {
        "question": "The meaning of the tendril gesture",
        "A": "A. Be kind",
        "B": "B. Be Nice",
        "C": "C. Be Cunning",
        "Ans": "C"
    },
  }

  // Announce Msg Box
  const announceContainer = new Container()
  app.stage.addChild(announceContainer)

  scrollScene()

  // Scenes
  async function scrollScene(){
    // Create scroll
    if(completedScroll.length == numbersOfScroll){
        window.alert("You completed this this challenge")
        createAnnouncement(announceContainer, appWidth/2, appHeight/2, 50, "Yayyyy", "You completed all the scrolls", "Continue", 10, () => {
            announceContainer.removeChildren()
            // move back to first scene
        })
    }
    for(var i = 0; i < numbersOfScroll; i++){
        var scrollName = scrollTextes[i].replaceAll('"', '').toLowerCase()
        const imgTexture = await Assets.load(`/assets/${scrollName}.png`);
        var scrollX = (scrollsX) + scrollWidth*i + scrollGap*i
        var scrollY = scrollsY
        if(completedScroll.includes(scrollName)){
            var scroll = new Scroll(createSprite(scrollContainer, scrollTextureCompleted, scrollCompletedWdith, scrollCompletedHeight, scrollX-scrollCompletedWdith/3.3, scrollY), imgTexture, scrollTextes[i])
        } else{
            var scroll = new Scroll(createSprite(scrollContainer, scrollTexture, scrollWidth, scrollHeight, scrollX, scrollY), imgTexture, scrollTextes[i])
        }
        scroll.displayText()
    }
    createText(scrollContainer, "Choose a Scroll", "Arial", 30, deepRed, appWidth/2, 120)
  }

  async function puzzleScene(scrollName){
    const pieceTexture = await Assets.load(`/assets/${scrollName}.png`);
    const puzzleText = `Solve "${String(scrollName).charAt(0).toUpperCase() + String(scrollName).slice(1)}" Puzzle`
    const puzzle = new Puzzle(scrollName, pieceTexture, boardWidth, boardHeight, boardPadding, boardX, boardY, rowPiece, columnPiece, puzzleText, questions[scrollName]);
    puzzle.cropImg();
    puzzle.createBoard();
    puzzle.createPiece();
  }

  // Create Component
  function createSprite(container, texture, width, height, x, y)
  {
      const sprite = new Sprite(texture, 0, 5);

      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';

      // Center the sprite's anchor point
      sprite.anchor.set(0.5);

      // Make it a bit bigger, so it's easier to grab
      sprite.width = width
      sprite.height = height

      // Move the sprite to its designated position
      sprite.position.set(x + sprite.width/2, y + sprite.height)

      // Add it to the stage
      container.addChild(sprite);

      return sprite
  }

  function createRect(container, width, height, color, x, y){
    const graphics = new Graphics()
      .rect(x, y, width, height)
      .fill(color);
      
    graphics.pivot.set(0, 0)
    container.addChild(graphics)
    return graphics
  }

  function createText(container, text, font, size, color, x, y, align = 'center'){
    const theText = new Text({
      text: text,
      style: {
        fontFamily: font,
        fontSize: size,
        fill: color,
        align: align,
        wordWrap: true,
        wordWrapWidth: appWidth/2,
      }
    });

    theText.x = x - theText.width/2;
    theText.y = y - theText.height/2;

    container.addChild(theText);
    return theText
  }

  function createButton(container, text, padding, x ,y, func){
    var modelText = createText(container, text, "Arial", 24, white, x, y)
    var buttonRectWidth = modelText.width + padding*2 
    var buttonRectHeight = modelText.height + padding*2 
    var buttonRect = createRect(
        container,
        buttonRectWidth,
        buttonRectHeight,
        black,
        x  - buttonRectWidth/2,
        y - buttonRectHeight/2
    )

    buttonRect.eventMode = 'static';
    buttonRect.cursor = 'pointer';

    var buttonText = createText(container, text, "Arial", 24, white, x, y)

    buttonText.eventMode = 'static';
    buttonText.cursor = 'pointer';

    buttonRect.on('pointerdown', func)
    buttonText.on('pointerdown', func)
    container.removeChild(modelText)
  }

  function createAnnouncement(container, x, y, padding, heading, message, buttonMsg, buttonPadding, action){
    var modelText = createText(container, message, "Arial", 24, white, x, y)
    var boxWidth = modelText.width + padding*2
    var boxHeight = modelText.height*3 + padding*2
    createRect(container, boxWidth, boxHeight, richGold, x - boxWidth/2, y - boxHeight/2)
    createText(container, heading, "Arial", 30, deepRed, x, y - boxHeight/2 + padding)
    createText(container, message, "Arial", 24, white, x, y)
    createButton(container,  buttonMsg, buttonPadding, x, y + boxHeight/2 - padding + 10, action)
  }

  // Create Animation
  function slideUp(){
    // console.log("sliding upp")
  }

  // Create Action
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

  function detectCollision(obj1, obj2){
    var obj1Bound = obj1.getBounds()
    var obj2Bound = obj2.getBounds()

    return obj1Bound.x + obj1.width > obj2Bound.x &&
           obj1Bound.x < obj2Bound.x + obj2.width &&
           obj1Bound.y + obj1.height > obj2Bound.y &&
           obj1Bound.y < obj2Bound.y + obj2.height;
  }

  app.ticker.add(slideUp);

})();
