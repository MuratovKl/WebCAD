export const sketch = (draft) => {
  return (sk) => {
    sk.setup = () => {
      let canvas = sk.createCanvas(sk.windowWidth, sk.windowHeight);
      canvas.parent("canvas-wrapper");
      canvas.mousePressed(() => draft.eventHandler());
      // canvas.mouseMoved();
      sk.frameRate(30);
      sk.background(1);
      sk.fill(255);
      sk.textSize(16);
      draft.sk = sk;
    };
  
    sk.draw = () => {
      sk.background(1);
      sk.angleMode(sk.DEGREES);
      
      sk.translate(sk.width/2, sk.height/2);
      sk.stroke(0, 255, 0); // green line Y
      sk.line(0, 0, 0, 40);
      sk.stroke(255, 0, 0); // red line X
      sk.line(0, 0, 40, 0);


      sk.stroke(255);
      draft.render();
      sk.stroke(0, 255, 0); // green line Y
      sk.line(0, 0, 0, 40);
      sk.stroke(255, 0, 0); // red line X
      sk.line(0, 0, 40, 0);
    };
  
    sk.windowResized = () => {
      sk.resizeCanvas(sk.windowWidth, sk.windowHeight);
    };
  
    sk.keyPressed = () => {
      console.log('key pressed');
      draft.eventHandler(sk.keyCode);
    };
  }
}