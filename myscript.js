  var mousepos = {x:0, y:0};
  // Inits
  window.onload = function init() {
    var game = new GF();
    game.start();
  };


  // GAME FRAMEWORK STARTS HERE
  var GF = function(){
      // Vars relative to the canvas
      var canvas, ctx, w, h; 
      var mousepos = {x:0, y:0};

      // Game states
      var states = {
        startMenu : 0,
        play : 1,
        gameOver : 2,
      };

      // Let's begin with the startMenu
      currentState = states.startMenu;

      // initialization of the score
      currentScore = 0;

      // vars for counting frames/s, used by the measureFPS function
      var frameCount = 0;
      var lastTime;
      var fpsContainer;
      var fps="--"; 
      // for time based animation
      var delta, oldTime = 0;

      // vars for handling inputs
      var inputStates = {};

      // The eater !
      var eater = {
        x: 0,
        y: 0,
        speed:100, // pixels/s this time !
        boundingCircleRadius: 80,
        hole: 40,
        angle:0
      };

      var player = {
        x:0,
        y:0,
        boundingCircleRadius: 20    
      };

      // array of balls to animate
      var ballArray = [];

      var calcDistanceToMove = function(delta, speed) {
      //console.log("#delta = " + delta + " speed = " + speed);
      return (speed * delta) / 1000; 
    };
    
    var measureFPS = function(newTime){

           // test for the very first invocation
           if(lastTime === undefined) {
             lastTime = newTime; 
             return;
           }

          //calculate the difference between last & current frame
          var diffTime = newTime - lastTime; 

          if (diffTime >= 1000) {
            fps = frameCount;    
            frameCount = 0;
            lastTime = newTime;
          }

          //and display it in an element we appended to the 
          // document in the start() function
          fpsContainer.innerHTML = 'FPS: ' + fps; 
          frameCount++;
        };

       // clears the canvas content
       function clearCanvas() {
         ctx.clearRect(0, 0, w, h);
       }

       // Functions for drawing the eater and maybe other objects
       function drawMyEater() {

        // save the context
        ctx.save();
        ctx.translate( eater.x, eater.y );
        ctx.rotate( eater.angle );

         // Draw bounding circle
         ctx.beginPath();
         negAngle = -(eater.hole/2)*Math.PI/180;
         posAngle = (eater.hole/2)*Math.PI/180;

         var dx = w - h/2;                                         
         var dy = w/2 - h/2;
        angleDebutMonstre = Math.atan2(dy,dx)*Math.PI/180;


         ctx.arc(0, 0, eater.boundingCircleRadius, negAngle, posAngle, true);

         ctx.lineWidth = 5;
         ctx.stroke();
         ctx.beginPath();
         ctx.lineTo(0,300);
         ctx.stroke();
        // restore the context
        ctx.restore(); 
      }



      function timer(currentTime) {
        var delta = currentTime - oldTime;
        oldTime = currentTime;
        return delta;
      }

      // Main Loop of the game
      var mainLoop = function(time){
         // Clear the canvas
         clearCanvas();
        // check inputStates
        ctx.fillText("SCORE: " +currentScore, 400, 20);

        if (inputStates.left) {
          ctx.fillText("left", 150, 20);
        }
        if (inputStates.up) {
          ctx.fillText("up", 150, 40);
        }
        if (inputStates.right) {
          ctx.fillText("right", 150, 60);
        }
        if (inputStates.down) {
          ctx.fillText("down", 150, 80);
        } 
        if (inputStates.space) {
          ctx.fillText("space bar", 140, 100);
        }
        if (inputStates.mousePos) { 
          mousepos.x = inputStates.mousePos.x;
          mousepos.y = inputStates.mousePos.y;
          //ctx.fillText("mouse(x = " + inputStates.mousePos.x + " y = " + inputStates.mousePos.y +")", 370, 580);
        }
        if (inputStates.mousedown) { 
          ctx.fillText("mousedown b" + inputStates.mouseButton, 5, 180);
        }

        if(eater.dead) {
          currentState = states.gameOver;
        }
        
        switch(currentState) {

          case states.startMenu:
          ctx.fillText("MY GAME", 100, 100);
          ctx.fillText("Press SPACE to start the game", 100, 150);
          if(inputStates.space) {
            currentState = states.play;
          }

          break;
          case states.play: 
            //main function, called each frame 
            measureFPS(time);

            // number of ms since last frame draw
            delta = timer(time);


            drawMyEater();

            updatePlayer();

            // Check inputs and move the eater
            updateEaterPosition(delta);

            // update and draw balls
            updateBalls(delta);
            break;
            case states.gameOver:
            //console.log("GAME OVER");
            ctx.fillText("GAME OVER", 100, 100);
            ctx.fillText("Press SPACE to start again", 100, 150);
            
            if(inputStates.space) {
              currentScore = 0;
              eater.dead = false;
              ballArray = [];
              createBalls(1);
              currentState = states.play;
            }
            break;

          }
          requestAnimationFrame(mainLoop);
        };


        function updateEaterPosition(delta) {
          eater.speedX = eater.speedY = 0;
          // check inputStates
          if (inputStates.left) {
              //eater.speedX = -eater.speed;
            }
            if (inputStates.up) {
             //eater.speedY = -eater.speed;
           }
           if (inputStates.right) {
              //eater.speedX = eater.speed;
            }
            if (inputStates.down) {
              //eater.speedY = eater.speed;
            } 
            if (inputStates.space) {
            }
            if (inputStates.mousePos) { 
            }
            if (inputStates.mousedown) { 
              eater.speed = 500;
            } else {
            // mouse up
            eater.speed = 100;
          }

          var dx = eater.x - mousepos.x;

          var dy = eater.y - mousepos.y;
          eater.angle = Math.atan2(dy, dx) + Math.PI;
          // Compute the incX and inY in pixels depending
          // on the time elasped since last redraw
          eater.x += calcDistanceToMove(delta, eater.speedX);
          eater.y += calcDistanceToMove(delta, eater.speedY);
        }

        function updateBalls(delta) {
        // for each ball in the array
        for(var i=0; i < ballArray.length; i++) {
          var ball = ballArray[i];

        // 1) move the ball
        ball.move();   

        // 2) test if the ball collides with a wall
        testCollisionWithWalls(ball);

                
        // teste collisions avec monstre
        checkCollisions(ball);

        // 3) draw the ball
        ball.draw();
      }
    } 
    
    function updatePlayer() {
      // The player is just a circle, drawn at the mouse position
      // Just to test circle/circle collision.
      
      if(inputStates.mousePos) {
       player.x = inputStates.mousePos.x;
       player.y = inputStates.mousePos.y;
         // draws a circle
         ctx.beginPath();
         ctx.arc(player.x, player.y, player.boundingCircleRadius, 0, 2*Math.PI);
         ctx.stroke();
       }
     }

     function checkCollisions(ball) {
      /*ctx.fillText("angleDebutMonstre :" +angleDebutMonstre, 10, 320);
      ctx.fillText("negAngle : " + negAngle * (180 / Math.PI)+"°", 10, 340);
      ctx.fillText("posAngle : " + posAngle * (180 / Math.PI)+"°", 10, 360);
      ctx.fillText("collisionSourisMonstre : " +collisionSourisMonstre(player, eater.x, eater.y) +"°", 10, 380);
      ctx.fillText("collisionMonstreBalle : " +collisionMonstreBalle(ball, eater.x, eater.y) +"°", 10, 400);*/
      var v1 = collisionSourisMonstre(player, eater.x, eater.y) + (posAngle*(180 / Math.PI));
      var v2 = collisionMonstreBalle(ball, eater.x, eater.y) + (negAngle*(180 / Math.PI));
      var v3 = Math.abs(collisionSourisMonstre(player, eater.x, eater.y) + (posAngle*(180 / Math.PI))-collisionMonstreBalle(ball, eater.x, eater.y) + (negAngle*(180 / Math.PI)));
      ctx.fillText("collisionSourisMonstre+posAngle: " + v1 +"°", 10, 420);
      ctx.fillText("collisionMonstreBalle+negAngle : " + v2 +"°", 10, 440);
      ctx.fillText("dif angle :" +v3, 10, 200);
      ctx.fillText("ball.x : " +ball.x, 10, 460);
      ctx.fillText("ball.y : " +ball.y, 10, 480);
      ctx.fillText("ball.boundingCircleRadius : " +ball.boundingCircleRadius, 10, 500);
      ctx.fillText("eater.x : " +eater.x, 10, 520);
      ctx.fillText("eater.y : " +eater.y, 10, 540);
      ctx.fillText("eater.boundingCircleRadius : " +eater.boundingCircleRadius, 10, 560);

      if(circleCollide(ball.x, ball.y, ball.boundingCircleRadius, eater.x, eater.y, eater.boundingCircleRadius)) {
        ctx.fillText("Collision", 10, 20);
        ctx.strokeStyle = ctx.fillStyle = 'red';
        if (v3<=13){
          ctx.strokeStyle = ctx.fillStyle = 'green';
          ctx.fillText("BINGO", 10, 40);
        } else {
           
          ball.color = 'red';
          eater.dead = true;
          console.log("collision1");
        } 
      } else {
        
        ctx.fillText("No collision", 10, 20);
        ctx.strokeStyle = ctx.fillStyle = 'black';
      }
      var i1=Math.abs(Math.round(ball.x)-Math.round(eater.x));
      var i2=Math.abs(Math.round(ball.y)-Math.round(eater.y));
      ctx.fillText("i1 : " +i1, 400, 540);
      ctx.fillText("i2 : " +i2, 400, 560);
      if (i1<15 || i2<15 ){
            console.log("axe touché");
            ball.color = 'green';
            currentScore++;
            eater.dead = true;

      }
    }
  
    function collisionSourisMonstre(player, eaterx, eatery) {
      var dx = player.x - eaterx;
      var dy = player.y - eatery;
      if (dx>0 && dy>=0){
        var angle = Math.atan2(dy,dx);
      } else if (dx>0 && dy<0){
        var angle = Math.atan2(dy,dx)+(2*Math.PI);
      } else if (dx<0){
        var angle = Math.atan2(dy,dx)+Math.PI;
      } else if (dx==0 && dy>0){
        var angle = Math.PI/2;
      } else if (dx==0 && dy<0){
        var angle = (3*Math.PI)/2;
      }
      return angle* (180 / Math.PI);
    }

    function collisionMonstreBalle(balle, eaterx, eatery) {
      var dx = eaterx - balle.x;
      var dy = eatery - balle.y;
      if (dx>0 && dy>=0){
        var angle = Math.atan2(dy,dx);
      } else if (dx>0 && dy<0){
        var angle = Math.atan2(dy,dx)+(2*Math.PI);
      } else if (dx<0){
        var angle = Math.atan2(dy,dx)+Math.PI;
      } else if (dx==0 && dy>0){
        var angle = Math.PI/2;
      } else if (dx==0 && dy<0){
        var angle = (3*Math.PI)/2;
      }
      return angle* (180 / Math.PI);
    }

    function circleCollide(x1, y1, r1, x2, y2, r2) {

      var dx = x1 - x2;
      var dy = y1 - y2;
      return ((dx * dx + dy * dy) < (r1 + r2)*(r1+r2));  
    }
    
    function testCollisionWithWalls(ball) {
      // left
      if (ball.x < ball.boundingCircleRadius) {
        ball.x = ball.boundingCircleRadius;
        ball.angle = -ball.angle + Math.PI;
      } 
      // right
      if (ball.x > w - (ball.boundingCircleRadius)) {
        ball.x = w - (ball.boundingCircleRadius);
        ball.angle = -ball.angle + Math.PI; 
      }     
      // up
      if (ball.y < ball.boundingCircleRadius) {
        ball.y = ball.boundingCircleRadius;
        ball.angle = -ball.angle;     
      }     
      // down
      if (ball.y > h - (ball.boundingCircleRadius)) {
        ball.y = h - (ball.boundingCircleRadius);
        ball.angle = -ball.angle; 
      } 
    }
    
    function getMousePos(evt) {
          // necessary to take into account CSS boudaries
          var rect = canvas.getBoundingClientRect();
          return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
          };
        }

        function createBalls(numberOfBalls) {
          for(var i=0; i < numberOfBalls; i++) {
          // Create a ball with random position and speed. 
          // You can change the radius
          if (i===0){
            var ball =  new Ball(w,h);
          }

          else {
            setTimeout(function(){
            var ball =  new Ball(w,h);
          }, 200);
          }

          if(!circleCollide(ball.x, ball.y, ball.boundingCircleRadius,
           eater.x, eater.y, eater.boundingCircleRadius)) {
          // On la rajoute au tableau
        ballArray[i] = ball;
      } else {
        i--;     
      }
    }
  }                                
  // constructor function for balls
  function Ball(w,h) {
   this.v = 1;
   this.boundingCircleRadius = 30/2;
   this.color = "black";
   this.dead = false;

  /*
          0
      -----------
      |         |
  1   |         |   3
      |         |
      |         |
      -----------
          2


          */
          var cote = Math.floor(4*Math.random());
          if (cote === 0){
      // Côté Haut
      this.x = Math.random()*w;
      this.y = 0;
      var dx = w/2-this.x;
      var dy = h/2-this.y;
      this.angle = Math.atan2(dy,dx);
    }

    else if (cote === 1){
      // Côté Gauche
      this.x = 0;
      this.y = Math.random()*h;
      var dx = w/2-this.x;
      var dy = h/2-this.y;
      this.angle = Math.atan2(dy,dx);
    }

    else if (cote === 2){
      // Côté Bas
      this.x = Math.random()*w;
      this.y = h;
      var dx = w/2-this.x;
      var dy = h/2-this.y;
      this.angle = -Math.atan2(dy,dx);
    } 

    else if (cote === 3){
      // Côté Droit
      this.x = w;
      this.y = Math.random()*h;
      var dx = w/2-this.x;
      var dy = h/2-this.y;
      this.angle = Math.atan2(dy,dx);
    }
    console.log("x: " +this.x);
    console.log("Y: " +this.y);


    
    this.draw = function() {
      // si la balle est "morte" on ne fait rien
      if(this.dead) return;
      
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.boundingCircleRadius, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
      //ctx.fillText("Ball : (x: " + this.x + ",y: " + this.y +")", 10, 580);
      this.color = 'black';
    };
    
    this.move = function() {
      // si la balle est "morte" on ne fait rien
      if(this.dead) return;
      
      this.x += this.v * Math.cos(this.angle);
      this.y += this.v * Math.sin(this.angle);
    };
  }


  var start = function(){
          // adds a div for displaying the fps value
          fpsContainer = document.createElement('div');
          fpsContainer.className = "fps";
          document.body.appendChild(fpsContainer);

          // Canvas, context etc.
          canvas = document.querySelector("#myCanvas");

          // often useful
          w = canvas.width; 
          h = canvas.height; 

          eater.x = w/2;
          eater.y = h/2;
          

          // important, we will draw with this object
          ctx = canvas.getContext('2d');
          // default police for text
          ctx.font="20px Arial";

         //add the listener to the main, window object, and update the states
         window.addEventListener('keydown', function(event){
          if (event.keyCode === 37) {
           inputStates.left = true;
         } else if (event.keyCode === 38) {
           inputStates.up = true;
         } else if (event.keyCode === 39) {
           inputStates.right = true;
         } else if (event.keyCode === 40) {
           inputStates.down = true;
         }  else if (event.keyCode === 32) {
           inputStates.space = true;
         }
       }, false);

        //if the key will be released, change the states object 
        window.addEventListener('keyup', function(event){
          if (event.keyCode === 37) {
           inputStates.left = false;
         } else if (event.keyCode === 38) {
           inputStates.up = false;
         } else if (event.keyCode === 39) {
           inputStates.right = false;
         } else if (event.keyCode === 40) {
           inputStates.down = false;
         } else if (event.keyCode === 32) {
           inputStates.space = false;
         }
       }, false);
        
        // Mouse event listeners
        canvas.addEventListener('mousemove', function (evt) {
          inputStates.mousePos = getMousePos(evt);
        }, false);

        canvas.addEventListener('mousedown', function (evt) {
          inputStates.mousedown = true;
          inputStates.mouseButton = evt.button;
        }, false);

        canvas.addEventListener('mouseup', function (evt) {
          inputStates.mousedown = false;
        }, false);      

          // We create tge balls: try to change the parameter
          createBalls(1); 

          // start the animation
          requestAnimationFrame(mainLoop);
        };

      //our GameFramework returns a public API visible from outside its scope
      return {
        start: start
      };
    };


