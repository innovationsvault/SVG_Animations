/**This code was create by Trevor Gibbons Date: May 1, 2019.
The purpose of this code is to take simple SVG objects and animate them.
There are three type of animations completed for this:
  - Line animation which uses the strokeDasharrayOffset property to simulate a moving line.
  - Rect animation which manipulates a rect dimensions to simulate growth.
  - Spline animation, where objects can be animated along a spline.
  These were created specifically for my COMP266 website, but do have some
  room for accepting other animation types (although limited).
  This code was more increase my knowledge of JavaScript and better understand the coding language
  The layout and design of this script is class based, there is one main class, 'animatedObject' and
  several sub-classes:
    - AnimatedBar - takes in rects and animates them.
    - AnimatedLine - takes in polylines and uses strokeDasharrayOffset to simulate motion.
    - AnimatedSpline - takes in polylines and other objects to animate along a path.
  The animatedObject class allows for several parameters to be passed in, such as:
    - Animation timing - how long the animation should be
    - Delay - how long to wait before the animation starts
    - Type - The type of animation to be done (linear, quad, bounce, etc.)
  To control draw frame calls the 'requestAnimation' function is used. This call
  is separate to the other classes in the script and is used mainly to allow objects
  to request frames when it suits them and to ensure that no more than one call takes
  place each frame.
  This is acomplished with a 'reservation list' where objects are added to the list when
  they need a frame and removed when then they do not. The main way this done with a Flag
  (rAF), each object looks to see if it is being animated and if this animation is complete.
  With this information it sets the flag and is added/taken off of the list.
  The main class (animatedObject) only returns a percentage back to the object of how much of
  the animation is completed. With this percentage the object will determine itself what should
  be drawn. In this way there is are clear boundaries for what the superclass provides.
  Classes are used in the script, which is new to JavaScript, for this reason the final production
  code may not look the same as the original code. A copy of the original code will be kept for
  reference.**/


//IDEA: add some high contrast pixels at the edge of each animation
//IDEA: put in step intervals into the line animation class (or another class)
/*NOTE: The SVG objects to be animated should be in their final position at the start of the animation, this will ensure that if the animation does not work then
the SVG is still presented in the browser as drawn.*/

window.onload = start;

function start() {

  //check for the SVG to fire the animtations
  if (document.getElementsByClassName("animatedSpline").length > 0) {
    flowChartAnimation();
  }

  if (document.getElementsByClassName("box").length > 0) {
    graphAnimation();
  }

}

//Set up the needed objects for the 'flow chart' animation
function flowChartAnimation() {
  let boxFollow1 = new AnimatedSpline("dummyBox");
  let boxFollowArray = [7];
  boxFollowArray[0] = new AnimatedSpline("box1");
  boxFollowArray[1] = new AnimatedSpline("box2");
  boxFollowArray[2] = new AnimatedSpline("box3");
  boxFollowArray[3] = new AnimatedSpline("box4");
  boxFollowArray[4] = new AnimatedSpline("box5");
  boxFollowArray[5] = new AnimatedSpline("box6");
  boxFollowArray[6] = new AnimatedSpline("box7");
  let spline1 = new AnimatedLine("spline_main", 3000, 1000, "linear");
  boxFollow1.groupFollow(boxFollowArray, spline1);
  boxFollow1.animate();

  let boxFollow2 = new AnimatedSpline("box8");
  let spline2 = new AnimatedLine("spline_second", 500, 3500, "linear");
  //FIXME: The following is a hack to get the final element in the flowchart to work correctly. This should be part of the overall functionality of the class, but for this exersice I am too far down the rabbit hole. If this was to be redone then the full class would be re-worked with this included.
  document.getElementById("box8").style.display = "none";
  setTimeout(function() {
    document.getElementById("box8").style.display = "block";
  }, 2900);
  boxFollow2.follow(spline2);
  boxFollow2.animate();

}

//Set up the needed objects for the bar graph animation
function graphAnimation() {
  //FIXME: the bars are getting shorter with each playback, I think this is because the last frame is not setting them to the original position.
  let line1 = new AnimatedLine("lineOne", 1000, 1000, "quad");
  let line2 = new AnimatedLine("lineTwo", 2000, 2000, "circ");
  let bar1 = new AnimatedBar("barOne", 2000, 1000, "circ");
  let bar3 = new AnimatedBar("barThree", 2000, 1000, "circ");
  let bar5 = new AnimatedBar("barFive", 2000, 1000, "circ");
  let bar2 = new AnimatedBar("barTwo", 2500, 1500, "quad");
  let bar4 = new AnimatedBar("barFour", 2500, 1500, "quad");
  let bar6 = new AnimatedBar("barSix", 2500, 1500, "quad");
  //line1.print();
  line1.animate();
  line2.animate();
  bar1.animate();
  bar2.animate();
  bar3.animate();
  bar4.animate();
  bar5.animate();
  bar6.animate();
}

/*The following functions will request a common frame for each object that is looking for one.
The cycle will continue as long as there are objects that require a frame.
The AnimationObject superclass is responsible for adding items to the request list and taking them off.
This is only used for animation frame callback when an object wants one. */
//This function checks the list of items looking to be animated and puts them
function requestAnimation(animatedObject) {
  rl.push(animatedObject);
  //console.log("Set " + animatedObject.name + " on request list");
  if (rl.length < 2) { //Only call for animation frame if nothing else has yet
    requestFrame();
  }
}
//Holds the list of objects that need animation frames
rl = [];

//The requestFrame callback. Recursive, will be called whenever an object needs a frame
function requestFrame() {
  function step(timestamp) {
    for (let i = 0; i < rl.length; i++) { //Iterate through the request list
      if (rl[i].rAF) { //Check to see if the animationObject wants a frame
        //console.log(timestamp);
        rl[i].animate(timestamp);
        //console.log("Passing timestamp to " + rl[i]);
      } else { //No longer needs an amination frame remove from list
        //console.log(" Removed " + rl[i].name + " from request list");
        //console.table(rl[i].log);
        rl.splice(i, 1);
      }
    }
    if (rl.length > 0) { //There are still items on the list, get another frame
      requestAnimationFrame(step);
    } else { //NOTE: This is the end of all animation cycles, this can be replaced with a button or some other means of restarting
      setTimeout(() => start(), 3000);
    }
  }
  requestAnimationFrame(step);
}

/*This is the superclass for all animated objects. This has as much abstraction as possible for the underlying objects.
It takes care of the following main functions for all objects:
- timeout - animationType - setting current animation progress (measured as a percentage) - if a frame should be requested */
class AnimationObject {
  elm; //the element object in the DOM
  animTime; //How fast the animation should be
  delay; //The animation should start
  current = 0; //Set the current time in the animation
  rAF = false; //Toggle for the object to signal when it needs frames
  start = 0;
  animType;
  rFD = false; //flag to test if a delay is required
  log; //A log file that stores information about the object, useful because the passing timestamps can make debugging tricky
  pointAt; //The current 'leading edge that is being animated. Mainly for line animations, but may be included in boxes as well
  progress = 1; //The progress (from 1 to 0) of the current animation
  constructor(name, animTime = 2000, delay = 0, animType = "linear") {
    this.name = name;
    this.elm = document.getElementById(name);
    this.animTime = animTime;
    this.delay = delay;
    this.current = 0;
    this.animType = animType;
    if (this.delay > 0) { //Test if a delay is needed, if so then set this flag
      this.rFD = true;
    }
    this.log = []; //Create an empty array to hold log information (for debugging)
    this.progress = 1; //Set progress to 1 (done for safety, but is also done in other places)
  }

  //Standard print function for the object. The sub-class will add more to this.
  print() {
    console.log("Elements name is " + this.name);
    console.log("Elements type is " + this.elm.localName);
    console.dir(this);
    console.dir(this.elm);
  }

  //The following is the animation algorithm for the objects
  animateBase(animatedObject, timestamp) {
    if (animatedObject.rFD) { //Check if this object should be timed out
      //console.log(animatedObject.name + " is going for timeout");
      this.delayer(animatedObject);
      return; //Do not continue executing this code
    }

    //Check to see if this object is not currently requesting a frame, if not then add it to the animation list
    if (!animatedObject.rAF) { //If called for the first time (or recalled) request a frame
      requestAnimation(animatedObject);
      animatedObject.rAF = true;
      return 1; //Set the progress to 1 (it counts down) for the first frame
    }
    /* The following block does the following:
    - creates a starting frame for the adminTime to be measured against, OR
    - converts the animTime into a value between 1 and 0, the further along its aminTime the closer to 0 the object is, OR
    - if the total adminTime has past (start + adminTime < timestamp) then remove this object from the amimated list */
    animatedObject.current = (timestamp - animatedObject.start); //Set the current amount of time that has passed
    if (animatedObject.start === 0) { //There is no timestamp received yet, set the start time and do nothing else
      animatedObject.start = timestamp;
      return 1; //This is starting point for the animated object, note: this is second frame that object receives a 1
    } else if (animatedObject.animTime > animatedObject.current) {
      let progress = this[this.animType](animatedObject.current, animatedObject.animTime); //Call the type of animation that this is performing
      progress = 1 - progress;
      //NOTE this reversed the progress from 0 to 1 to 1 to 0. This is used for strokeDasharrayOffset, but the other objects want a 0 to 1. This can be either way as some objects require a conversion.
      return progress;
    } else { //Signal that this object has completed its animation
      animatedObject.rAF = false;
      animatedObject.start = 0;
      //console.table(animatedObject.log);
      return 0; //Set the animation to the final position (ensures they end where designed)
    }
  }
  //Animation functions credit to: https://javascript.info/js-animation
  linear(timePassed, aminTime) { //The linear math for determining current line position
    let progress = timePassed / aminTime; //This is the math function
    if (progress > 1) {
      progress = 1;
    }
    return progress;
  }
  quad(timePassed, aminTime) { //The linear math for determining current line position
    let progress = this.linear(timePassed, aminTime); //Call linear for percent
    progress = Math.pow(progress, 2); //This is the math function
    return progress;
  }
  circ(timePassed, aminTime) {
    let progress = this.linear(timePassed, aminTime); //Call linear for percent
    return 1 - Math.sin(Math.acos(progress));
  }
  back(timePassed, aminTime) {
    let progress = this.linear(timePassed, aminTime); //Call linear for percent
    let x = 1.5 //This is called function from the website. Can add a parameter later if needed/wanted
    return Math.pow(progress, 2) * ((x + 1) * progress - x)
  }
  bounce(timePassed, aminTime) {
    let progress = this.linear(timePassed, aminTime); //Call linear for percent
    for (let a = 0, b = 1, result; 1; a += b, b /= 2) {
      if (progress >= (7 - 4 * a) / 11) {
        return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
      }
    }
  }
  elastic(timePassed, aminTime) {
    let progress = this.linear(timePassed, aminTime); //Call linear for percent
    let x = 1.5 //This is called function from the website. Can add a parameter later if needed/wanted
    return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress)
  }

  //set a time out for the object to start its animation
  delayer(animatedObject) {
    animatedObject.rFD = false;
    setTimeout(animatedObject.animate.bind(this), this.delay); //Need to bind the 'this' to timeout so the object 'knows itself' when the timeout is completed
  }
}

/*This 'AnimatedBar' class extends the 'AnimationObject' class and adds in the functionality needed for just the bar type
The items this covers are: setting and getting y and height values while the bar is being animated
*/
class AnimatedBar extends AnimationObject {
  bHeight; //baseline height of the bar
  fHeight; //final y position of the bar
  bLine; //The baseline or starting point for the bar (will default to graphic bottom)
  constructor(...args) {
    super(...args);
    this.fHeight = this.elm.y.baseVal.value; //Store the final position of the bar height
    //Get the start position of the bar. To do this find the 'baseline' in the SVG, if there is no 'baseline' then start is bottom of SVG
    if (document.getElementById("baseline") === null) {
      //console.error("Cannot find baseline for bar");
      this.bLine = this.elm.parentElement.height.baseVal.value;
      //console.log("Setting baseline to " + this.bLine);
    } else {
      this.bLine = document.getElementById("baseline").y1.baseVal.value;
    }
    this.bHeight = this.elm.height.baseVal.value; //Store the final height of the bar
    this.elm.setAttribute("height", 0); //Set the bar height to 0 for the start of the amination
    this.elm.setAttribute("y", this.bLine); //Set the top of the bar to the baseline for the start of the animation
  }

  //Standard print function, includes final y and the baseline
  print() {
    super.print();
    console.log("The final bar height is " + this.bHeight);
    console.log(" The baseline for the bar is " + this.bLine);
  }

  //The animation function of the bar, takes the progress from the superclass and converts into a 'bar' specific result
  animate(timestamp = 0) {
    this.progress = super.animateBase(this, timestamp);
    if (this.progress > 0) { //Only proceed if there is a progress measurement
      let height = this.bHeight * (1 - this.progress); //Progress is a countdown, so reverse the progress to find how tall the bar should be right now
      this.elm.setAttribute("height", height);
      //The height moves in reverse (y @ 0 = top), so find the y where the (current height + y) will put the bottom of the bar at the baseline
      let setLine = (this.bLine - this.fHeight) * this.progress;
      setLine += this.fHeight;
      this.elm.setAttribute("y", setLine);
    } else if (this.progress === 0) { //Reset the bars to their starting positions once the animation is complete
      this.elm.setAttribute("height", this.bHeight);
      this.elm.setAttribute("y", this.fHeight);
    }
  }
}

/*The following sub-class will take a SVG polyline and use 'strokeDasharrayOffset' to provide an animation.
This is done by getting the full length of the line and the making this the offset value. I have found this technique in the Lynda.com course,
https://www.lynda.com/JavaScript-tutorials/JavaScript-Essential-Training/574716-2.html as well as other places around the internet.
It seems that this is common use case for strokeDashoffset.
This is also used by the 'AnimatedSpline' class to get an updated position of the spline that the objects are following (explained with that class.*/
class AnimatedLine extends AnimationObject {
  lLength; //The length for line
  constructor(...args) {
    super(...args);
    this.lLength = this.elm.getTotalLength(); //Get the total length of all points along the line
    this.elm.style.strokeDasharray = this.lLength; //Set the dash size to the total line size
    this.elm.style.strokeDashoffset = this.lLength; //Set the offset to the full length of the array, so no part of the line is rendered (to start)
    this.pointAt = this.elm.getPointAtLength(this.lLength - this.elm.style.strokeDashoffset); //Set the current point to the start of the line, used for spline animations
  }

  print() {
    super.print();
    console.log("The Lines overall length is " + this.lLength);
  }

  //This is the animate function. It gets back the progress percentage from the superclass
  //and applies this to the strokeDasharrayOffset as a percentage of how much of the line should be revealed at this point
  animate(timestamp = 0) { //Each ojbect type will have its own type of animation requirements
    this.progress = super.animateBase(this, timestamp);
    this.elm.style.strokeDashoffset = this.lLength * this.progress; //Set line position
    this.pointAt = this.elm.getPointAtLength(this.lLength - this.elm.style.strokeDashoffset);
  }
}

/*This is a class that will take a line or a rect SVG and animate them over a spline.
For this function to work a rect needs to be passed in.*/
//NOTE: this is to do the flowchart animation and highly specific to this animation. If this was to be a library then this would need to be generalized.
class AnimatedSpline extends AnimationObject {
  following; //The object that will follow the spline animation
  center; //Get the center of this object
  splineStarted; //A flag to ensure the spline animation is only called once
  basePosition; //The starting position of the follow object
  followingGroup = []; //Array of follow objects (if needed)
  pastStart; //Flag to tell if the animation is past its starting point
  constructor(...args) {
    super(...args);
    this.splineStarted = false;
    this.pastStart = false;
    this.positionSetup(); //Setup the position for the object
  }
  //Standard print function
  print() {
    super.print();
    console.log(this.following);
    console.log(this.center);
  }
  //Part of the constructor, set the final position, the center, and the starting position
  positionSetup() {
    //Get the final position and center of rect objects
    if (this.elm.localName == "rect") {
      this.basePosition = {
        x: this.elm.x.baseVal.value,
        y: this.elm.y.baseVal.value
      };
      this.center = {
        x: this.elm.width.baseVal.value / 2,
        y: this.elm.height.baseVal.value / 2
      };
    }
    //This is not a rect, return an error
    else {
      console.error("Needs to be rect to get proper center");
    }
    //set the starting position to be outside of the SVG element
    this.elm.setAttribute("x", this.elm.parentElement.parentElement.width.baseVal.value + (this.elm.width.baseVal.value * 2));
    this.elm.setAttribute("y", this.elm.parentElement.parentElement.height.baseVal.value + (this.elm.height.baseVal.value * 2));
  }

  //The following is used for a single object to follow along a spline
  follow(spline) { //take the same parameters as the animation class
    if (spline.delay > 0) { //Test if a delay is needed, if so then set this flag
      this.rFD = true;
    }
    //Setup the new AnimateLine object and change 'this' variables to match
    this.animTime = spline.animTime;
    this.delay = spline.delay;
    this.animType = spline.animType;
    this.following = spline;
  }

  //The following is used for when a group of objects are following along a spline
  groupFollow(followArray, spline) {
    this.follow(spline);
    this.followingGroup = followArray;
    for (let fo in this.followingGroup) { //set all group object to the same spline
      this.followingGroup[fo].following = spline;
    }
  }

  animate(timestamp = 0) {
    //NOTE - this is requesting an amination frame to be in the callback loop, this will return a progress
    //This progress is should NOT be used. This is because this object has a fallback animType of linear
    //and may not match the spline animType. The purpose of this function is to get the spline 'pointAt' not progress
    if (!this.splineStarted) { //Only need to call animation once.
      this.following.animate();
      this.splineStarted = true;
    }

    this.progress = super.animateBase(this, timestamp); //Call animate so this is on the callback list
    if (this.followingGroup.length > 0) { //This is a group of objects, get 'pointAt' for all members in the group.
      for (let fo in this.followingGroup) {
        if (this.followingGroup[fo].pastStart) {
          this.followingGroup[fo].elm.setAttribute("x", this.followingGroup[fo].basePosition.x);
          this.followingGroup[fo].elm.setAttribute("y", this.followingGroup[fo].basePosition.y);
          this.followingGroup.splice(fo, 1); //remove from the list
        } else {
          this.followingGroup[fo].update();
        }
      }
    } else { //This is single ojbect
      this.update();
    }

    if (this.pastStart) {
      super.animateBase(this, this.current + this.animTime + 1); //force the animation to stop
    }
  }

  //Store the update function separately. This is for the follow objects, they do not need to call animate, they only need the new position
  update() {
    let newX = this.following.pointAt.x - this.center.x;
    let newY = this.following.pointAt.y - this.center.y;

    this.elm.setAttribute("x", newX);
    this.elm.setAttribute("y", newY);

    //FIXME - This works for this animation, but only checks if the object has passed it's x or y. This should be changed to a better proximity detector.
    if (newX > this.basePosition.x || newY > this.basePosition.y) {
      this.pastStart = true;
    }
  }
}