    /**Create by Trevor Gibbons on May 1, 2019
    The purpose of this code is to take in a json object and convert it into a
    stylized animation.
    Starting with random streams across a canvas object similar to the opening
    scene from the matrix. Once the stream has passed a random char is left behind, and
    once all streams have passed then the final text is revealed.
    This code will convert the json object this final text into something that will
    fit the canvas window and preserve the formatting (including white space and colors).

    This code is laid out as follows:
      - hard coded json object example
      - global variables
      - setup functions (general and json object)
      - json render functions
      - draw
      - symbol creation and rendering
      - helper functions
    In general this code is quite functional, but there are improvements that can be made.
    If I would continue in refining this code, then it is likely that I would start over.
    Note the this is needed, but with knowing how if functions now, there could be a
    decent re-write to get better efficiencies and to remove redundant code.**/


    window.onload = setup;
    //Event.observe(window, 'load', setup);
    /*The following is a json object that is converted into the random symbols and final
    text of the class. This would be the starting point to making this an automated package.
    For example a text editor could be created to take in a colored text block and convert
    it into a similar json object. The code in this script is designed to make the json
    fit into a canvas and render it with the colors provided.  The text editor to convert
    this is outside of the scope of this exercise. */
    var jsonBlock = {
      line: [{
          indent: 0,
          segment: [{
            color: "236, 240, 241",
            text: "//growth formula"
          }],
        },
        {
          indent: 0,
          segment: [{
            color: "108, 212, 255",
            text: "Class"
          }, {
            color: "95, 241, 95",
            text: " GROW"
          }, {
            color: "236, 240, 241",
            text: "() {"
          }],
        },
        {
          indent: 2,
          segment: [{
            color: "108, 212, 255",
            text: "for each"

          }, {
            color: "236, 240, 241",
            text: "("
          }, {
            color: "228, 55, 37",
            text: "cost in overhead"
          }, {
            color: "236, 240, 241",
            text: ") {"
          }],
        }, {
          indent: 4,
          segment: [{
            color: "108, 212, 255",
            text: "If"
          }, {
            color: "236, 240, 241",
            text: "("
          }, {
            color: "95, 241, 95",
            text: "cost == makesClient"
          }, {
            color: "236, 240, 241",
            text: ") {"
          }],
        }, {
          indent: 6,
          segment: [{
            color: "108, 212, 255",
            text: "continue"
          }, {
            color: "236, 240, 241",
            text: ";"
          }],
        }, {
          indent: 4,
          segment: [{
            color: "236, 240, 241",
            text: "}"
          }, {
            color: "108, 212, 255",
            text: "else"
          }, {
            color: "236, 240, 241",
            text: " {"
          }, {
            color: "236, 240, 241",
            text: " //find next level"
          }],
        }, {
          indent: 6,
          segment: [{
            color: "228, 55, 37",
            text: "this.examine"
          }, {
            color: "236, 240, 241",
            text: "("
          }, {
            color: "228, 55, 37",
            text: "systems"
          }, {
            color: "236, 240, 241",
            text: ");"
          }],
        }, {
          indent: 4,
          segment: [{
            color: "236, 240, 241",
            text: "}"
          }],
        }, {
          indent: 2,
          segment: [{
            color: "236, 240, 241",
            text: "}"
          }],
        }, {
          indent: 0,
          segment: [{
            color: "236, 240, 241",
            text: "}"
          }],
        }, {
          indent: 0,
          segment: [{
            color: "108, 212, 255",
            text: "output"
          }, {
            color: "236, 240, 241",
            text: "("
          }, {
            color: "95, 241, 95",
            text: "continuedSuccess"
          }, {
            color: "236, 240, 241",
            text: ");"
          }],
        }
      ]
    }

    //Global modifiers
    var font; //Hardcoded here, but can be taken from CSS or the json object.
    var fillStyle;
    var step; //The pixels back that the face trail will be
    var fade; //The increment down the alpha will be (per step) for symbols trails
    var minSpeed;
    var maxSpeed;
    var minChange; //Min amount for a char change
    var maxChange; //Max amount for a char change
    jsonBlock.padding = 25; //the padding on the top and bottom of the canvas
    //TODO: Re-center the padding after the calculation is made so the text is centered
    var fontRatio; //The ratio of the font size to actual width for monospaced fonts is 1.667
    var ctx; //The context
    var allPassed; //Global flag for if all the streams have finished rendering
    var allFaded; //Global flag to see if all intermediate Symbols have been faded
    var streamText;
    var completed; //A variable to hold if the animation is completed, note this is just for replaying the animation in a loop
    var started; //Global variable to ensure that draw() does not get called more than once with each page load

    function setup() {
      font = "px 'Roboto Mono', 'Anonymous Pro', 'Source Code Pro', monospace"; //Hardcoded here, but can be taken from CSS or the json ojbect.
      fillStyle = "236, 240, 241";
      step = 2; //The pixels back that the face trail will be
      fade = 0.4; //The increment down the alpha will be (per step) for symbols trails
      minSpeed = 200;
      maxSpeed = 300;
      minChange = 50; //Min amount for a char change
      maxChange = 100; //Max amount for a char change
      fontRatio = 1.667; //The ratio of the font size to actual width for monospaced fonts is 1.667
      allPassed = false;
      allFaded = false;
      completed = false;
      var canvas = document.getElementById("matrix");
      ctx = canvas.getContext("2d");
      jsonSetup();
      streamText = new StreamArray(jsonBlock);
      if (!started) {
        started = true;
        draw();
      }
    }

    /*This part sets various parts and pieces for the jsonBlock
    This setup is done to the lowest level (so the chars holds most of the information)
    This goes from the top to the bottom of the json object to get the needed variables for the animation itself
    Starting with json.line -> moving to the segment (which have different colors) -> to the chars themselves.
    During this process each char is converted into a flattened array (one array per line), and the chars hold
    their needed information, like: color, position, etc.
    These are contained within the json object and used throughout the script.*/
    function jsonSetup() {
      //json level variables
      jsonBlock.totalChar = 0; //Count of chars in the text
      jsonBlock.charSelection = []; //An array of the final chars used for the random char streams, this is the selection that the streams can pick from.
      jsonBlock.minRandom = 0;
      jsonBlock.maxRandom = 0;
      jsonBlock.alpha = 0; //Set the alpha of the json object, used to fading in/out the full block of chars as needed
      jsonFontSize(); //set font size

      //Now that the font size in known some other variables can be set as well.
      ctx.font = jsonBlock.fontSize + font; //Set the final font size/type for the context variable
      jsonBlock.minRandom = parseInt(jsonBlock.maxLine / 2.5); //Set the minimum number of streaming chars based on total line size
      jsonBlock.maxRandom = parseInt(jsonBlock.maxLine / 1.25); //Set the maximum number of streaming chars based on total line size
      jsonBlock.standarWidth = ctx.measureText(" ").width; //The text in monospaced, so get a standard spacing for the text.
      //console.log(jsonBlock.standarWidth);

      //Iterate through the json object getting the needed variables
      for (let ln in jsonBlock.line) {
        //console.log("." + ln);
        jsonBlock.line[ln].passed = false; //A flag to hold when the stream is out of the canvas window for each line
        //Create and set the yPos for each line, this is needed to match the 'streams' of random text too (so they line up when the final char is revealed)
        jsonBlock.line[ln].yPos = jsonBlock.padding + ((parseInt(ln) + 2) * (jsonBlock.fontSize)); //NOTE - the +2 is just a small spacer can be removed
        jsonBlock.totalChar += jsonBlock.line[ln].indent; //A count of the total chars in the json object, includes indents
        jsonBlock.line[ln].lineLength = jsonBlock.line[ln].indent; //Store the total number of chars on this line NOTE - can also be done in font setup
        jsonBlock.line[ln].textArray = []; //Create an array of objects from the segments into one line (with colors), this removes the need for 'segments' later.

        for (let sg in jsonBlock.line[ln].segment) {
          //console.log(" ." + sg);
          for (let tx in jsonBlock.line[ln].segment[sg].text) {
            jsonBlock.totalChar++; //Increment the total char count
            jsonBlock.line[ln].lineLength++; //Increment this line length
            //Create and set the xPos for each char, this is used to position the intermediate text and the final render
            let xPos = jsonBlock.padding + (jsonBlock.line[ln].lineLength * jsonBlock.standarWidth);
            //console.log("  ." + tx + ": " + xPos);
            let text = jsonBlock.line[ln].segment[sg].text.charAt(tx) //Store the text value
            jsonBlock.charSelection.push( //Add the current char to the pool of random (intermediate) chars
              text
            );

            //Set the last of the variables needed for the final animation
            let symbol = new Symbol(xPos, jsonBlock.line[ln].yPos, 0); //Give each char an intermediate Symbol (for before final reveal)
            let revealed = false; //A flog used to hold whether the 'stream's' tail has passed this char
            let color = jsonBlock.line[ln].segment[sg].color; //Store the final color for this char
            jsonBlock.line[ln].textArray.push({ //Push all of the variables into the char object
              text,
              symbol,
              color,
              revealed
            });
          }
        }
      }
    }

    /*Set the fontSize based on the number of chars in the lines and the number of lines.
    The following equation takes the min int value between two metrics. One, total height needed and Two, total length needed.
    With this int the font size can be set to ensure that font will not 'overflow' the canvas in either direction.*/
    function jsonFontSize() { //make the argument the json object
      jsonBlock.maxLine = 0; //The number of chars in the longest line
      let currentLine = 0; //The number of chars in the current line
      //Two loops to step through each line and get the total length per line
      for (let ln in jsonBlock.line) {
        currentLine += jsonBlock.line[ln].indent; //Count the indent, these are non-rendered chars
        for (let sg in jsonBlock.line[ln].segment) {
          currentLine += jsonBlock.line[ln].segment[sg].text.length; //Count of each segment length
        }
        //Test if this line is more than current maxLine
        if (currentLine > jsonBlock.maxLine) {
          jsonBlock.maxLine = currentLine;
        }
        currentLine = 0; //Reset the for the next line
      }
      //console.log("jsonBlock.maxLine is " + jsonBlock.maxLine);
      //Calculation for the font size.
      jsonBlock.fontSize = parseInt(Math.min((ctx.canvas.height - jsonBlock.padding * 2) / jsonBlock.line.length,
        ((ctx.canvas.width - (jsonBlock.padding * 2)) / jsonBlock.maxLine) * fontRatio));
      //console.log(jsonBlock.fontSize);
    }

    /*This renders the intermediate text as the stream passes the location of a final letter
    once the stream tail passes the location of a final letter, then that letters symbol is revealed
    After all of the streams have gone, then the intermediate letters are faded and the final text is revealed*/
    function jsonReveal(streaming) {
      //Perform checks to see what intermediate chars should be revealed based on where the 'stream's' tail is currently
      for (let ln in jsonBlock.line) {
        let currentPos = streaming.streams[ln].symbols[0].x - streaming.streams[ln].tail; //Get the current tail position of the stream
        if (currentPos > ctx.canvas.width) { //Check to see if the stream is out of the canvas window
          jsonBlock.line[ln].passed = true;
        }
        //NOTE: the following can be refactored so it does not need to checked, but it contains the call to render and this is needed even if the stream is passed the window
        for (let tx in jsonBlock.line[ln].textArray) {
          if (!jsonBlock.line[ln].textArray[tx].symbol.revealed) { //Check to see if this has already been revealed
            if (currentPos > jsonBlock.line[ln].textArray[tx].symbol.x) { //Compare the tail position to the current letter, if past then render
              jsonBlock.line[ln].textArray[tx].symbol.render(
                jsonBlock.line[ln].textArray[tx].symbol.x,
                jsonBlock.line[ln].textArray[tx].symbol.y, 0);
              jsonBlock.line[ln].textArray[tx].revealed = true;
            } else {
              break; //As the stream moves over each char in sequence, if it has not past this letter then do not check the rest of the line
            }
          }
        }
      }
      //The following will test if all of the streams have made it past the canvas window
      allPassed = true;
      for (let ln in jsonBlock.line) {
        if (!jsonBlock.line[ln].passed) {
          allPassed = false;
        }
      }
    }

    /*This is the final render, after all of the 'streams' have left the canvas.*/
    function jsonRender() {
      //ctx.font = jsonBlock.fontSize + font;
      //Check the alpha of the json object, if less than 1, increase to fade in the final text
      if (jsonBlock.alpha < 1) {
        jsonBlock.alpha += 0.01;
      } else { //If alpha is now 1 then the final text is complete, set a timer to restart the amination
        jsonBlock.alpha = 1;
        setTimeout(setup, 3000);
      }
      for (let ln in jsonBlock.line) {
        for (let tx in jsonBlock.line[ln].textArray) {
          ctx.fillStyle = "rgba(" + jsonBlock.line[ln].textArray[tx].color + "," + jsonBlock.alpha + ")";
          ctx.fillText(jsonBlock.line[ln].textArray[tx].text,
            jsonBlock.line[ln].textArray[tx].symbol.x,
            jsonBlock.line[ln].textArray[tx].symbol.y);
        }
      }
    }

    //The draw function used for animation callback and cycling through various parts of the animation
    function draw(timeStamp = 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      streamText.render(); //Call the streaming part of the animation
      jsonReveal(streamText); //Call the function that will 'leave behind' random symbols where the final text will go
      if (allFaded) {
        jsonRender();
      }
      requestAnimationFrame(draw);
    }

    /*The following the base of the random object class, it holds the items needed
    to render random chars with the speed, how frequent the change is, and blurring.*/
    function Symbol(x, y, speed) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.alpha = 1;
      //this.char = String.fromCharCode(0x0020 + getRndInteger(0, 90));
      this.char = jsonBlock.charSelection[getRndInteger(0, jsonBlock.charSelection.length - 1)];
      this.fillStyle = fillStyle; //Is stored global to allow for easier changing/tweaking
      this.frame = 0;
      this.charInterval = getRndInteger(minChange, maxChange); //Holds the rate at which the chars changes

      //Set the properties of this char
      this.setChar = () => {
        this.char = jsonBlock.charSelection[getRndInteger(0, jsonBlock.charSelection.length - 1)];
        this.charInterval = getRndInteger(minChange, maxChange);
        this.frame = 0;
      }

      //The render function, all chars that need to drawn will call this function
      this.render = () => {
        this.frame++;
        if (this.frame % this.charInterval == 0) { //Check to see if this char should be changed to a new one
          this.setChar();
        }
        //Check to see if this char is moving, if so blur it, if not fade it (when needed)
        if (this.speed > 0) {
          this.blur(); //Create fading object
        } else {
          this.fade();
        }
        if (this.x > ctx.canvas.width) {
          delete this.symbol; //delete this once it is passed the canvas window
        }
      }

      //The blur function, will create faded repeated chars to the left of the current one to simulate motion blur
      this.blur = () => {
        let tempFade = 1 - fade;
        for (let i = 0; i < step; i++) {
          ctx.fillStyle = "rgba(" + this.fillStyle + ", " + tempFade + ")";
          ctx.fillText(this.char, this.x - (i * speed), this.y);
          //console.log(tempFade);
          tempFade = tempFade - (fade * (i + 1));
        }
        ctx.fillStyle = "rgb(" + this.fillStyle + ")";
        ctx.fillText(this.char, this.x += this.speed, this.y);
      }

      //Will fade the char (once all 'streams' have passed the canvas window)
      this.fade = () => {
        if (allPassed) {
          this.alpha -= 0.01;
          if (this.alpha < 0.2) {
            allFaded = true;
          }
        }
        ctx.fillStyle = "rgba(" + this.fillStyle + ", " + this.alpha + ")";
        ctx.fillText(this.char, this.x, this.y);
      }
    }

    /*This function is used to create a single stream of a chars.
    The random size and speed elements are here.*/
    function Stream(yPos) {
      this.symbols = new Array(getRndInteger(jsonBlock.minRandom, jsonBlock.maxRandom)); //Set a random number of chars for this stream
      //Get a random start xPos for the stream
      let randomStart = getRndInteger(50, 250) * -1; //make a negative to start before the canvas window
      this.totalLength = 0;
      this.speed = getRndInteger(minSpeed, maxSpeed) / 100; //Get a random travel speed for these chars to travel at
      for (let i = 0; i < this.symbols.length; i++) {
        this.symbols[i] = new Symbol(randomStart + this.totalLength, yPos, this.speed);
        this.totalLength -= jsonBlock.standarWidth;
        //console.log(ctx.measureText(this.symbols[i].char).width);
      }
      this.totalLength *= -1; //Reverse the total length to a positive number
      this.tail = this.totalLength; //Set tail to on char after the last font

      //Call each Symbol's render function
      this.render = () => {
        for (let i = 0; i < this.symbols.length; i++) {
          this.symbols[i].render();
        }
      }
    }

    //Object that setsup and holds the array of streams
    function StreamArray(jsonObj) {
      this.streams = new Array(jsonObj.line.length); //Get the numbers of streams needed to match the json object

      for (let i = 0; i < this.streams.length; i++) { //Create each stream
        this.streams[i] = new Stream(jsonObj.line[i].yPos);
      }

      this.render = () => { //Call the streams render function
        for (let i = 0; i < this.streams.length; i++) {
          this.streams[i].render();
        }
      }
    }

    //A helper function used to generate random numbers
    function getRndInteger(min, max) {
      let num = Math.floor(Math.random() * (max - min + 1)) + min;
      //console.log(num)
      return num;
    }