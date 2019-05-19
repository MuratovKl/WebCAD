import { Matrix } from 'transformation-matrix-js';
import p5 from 'p5';
// line: {
//   type: 0
//   p0: {x, y},
//   p1: {x, y}
// }

// arc: {
//   type: 1
//   c,
//   d,
//   from,
//   to
// }

// tools: 0 - hand, 1 - polyline

export default class Draft {
  constructor() {
    this.curTool = 0;
    this.curStage = 0; // 0 - draw line, 1 - draw arc
    this.tempEl = 0;
    this.elements = [[], []];
    this.sk = null;
    this.interactionMap = [];
    this.draftTranformMatrix = new Matrix(); // tranformation matrix for center of draft
    this.transformMatrix = null; // matrix for transformations
    this.negativeRotateMatrix = null; // matrix for negative rotation
    this.rotateMatrix = null; // matrix for rotation

    // object for imported profile
    this.import = null;
  }

  findLinesIntersection(l1, l2) {
    let x1 = l1.p0.x;
    let y1 = l1.p0.y;
    let x2 = l1.p1.x;
    let y2 = l1.p1.y;
    let x3 = l2.p0.x;
    let y3 = l2.p0.y;
    let x4 = l2.p1.x;
    let y4 = l2.p1.y;
    return this.sk.createVector(((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
    );
  }

  findParallelLine(l, r, direction) {
    let parallel = p5.Vector.sub(l.p1, l.p0);
    let normal = p5.Vector.fromAngle(parallel.heading() + direction * this.sk.HALF_PI, r);
    return {
      p0: p5.Vector.sub(l.p0, normal),
      p1: p5.Vector.sub(l.p1, normal),
      normal: normal.heading()
    };
  }

  setRounding() {
    let lines = this.elements[0];
    for(let i = 0; i < lines.length - 1; i++) {
      let l1 = lines[i];
      let l2 = lines[i+1];
      let l1V = p5.Vector.sub(l1.p1, l1.p0);
      let l2V = p5.Vector.sub(l2.p1, l2.p0);
      let l1Angle = this.sk.degrees(l1V.heading());
      let l2Angle = this.sk.degrees(l2V.heading());
      let direction, maxRadius, r, l1p, l2p, c, from, to, cut;

      console.log(l1Angle);
      console.log(l2Angle);
      if(l1Angle === l2Angle || (180 - l1Angle) === l2Angle) {
        return;
      } else if((l2Angle < l1Angle && l2Angle > l1Angle - 180) || (l1Angle < 0 && l2Angle > 180 + l1Angle)) {
        direction = 1;
      } else {
        direction = -1;
      }

      maxRadius = Math.max(l1.p0.dist(l1.p1), l2.p0.dist(l2.p1));
      r = +prompt(`Enter radius of rounding between ${i+1} and ${i+2} line:`);
      l1p = this.findParallelLine(l1, r, direction);
      l2p = this.findParallelLine(l2, r, direction);
      c = this.findLinesIntersection(l1p, l2p);

      if(direction === -1) {
        from = l1p.normal;
        to = l2p.normal;
      } else {
        from = l2p.normal;
        to = l1p.normal;
      }
      cut = Math.sqrt(Math.pow(c.dist(l1.p1), 2) - r * r);
      console.log(cut);
      l1V.setMag(l1V.mag() - cut);
      l2V.setMag(l2V.mag() - cut);
      l1.p1 = p5.Vector.add(l1.p0, l1V);
      l2.p0 = p5.Vector.sub(l2.p1, l2V);

      this.elements[1].push({
        c,
        d: 2 * r,
        from,
        to
      });
    }
  }

  eventHandler(key) {
    console.log('draft event handler');
    if(key) {
      console.log('keyboard event');
      if(key == this.sk.ESCAPE) {
        this.curStage = 0;
        this.tempEl = 0;
        this.elements = [[], []];
      } else if(key == this.sk.ENTER) {
          if(this.curStage == 0) {
            this.curStage = 1;
            this.tempEl = 0;
            this.setRounding();
          }
      }
    } else {
      console.log('mouse event');
      if(this.curTool === 0 || this.curStage !== 0) {
        return;
      } else if(this.curTool === 1) {
        if(this.tempEl === 0) {
          this.tempEl = {
            p0: this.sk.createVector(this.sk.mouseX, this.sk.mouseY)
          };
        } else {
          let p1 = this.sk.createVector(this.sk.mouseX, this.sk.mouseY);
          this.tempEl.p1 = p1;
          this.elements[0].push(Object.assign({}, this.tempEl));
          this.tempEl = {
            p0: p1
          };
        }
      }
    }
  }

  render() { 
    // draw imported profile
    // apply first transformation
    if(!!this.import) { // if import not null

      if (this.transformMatrix) {
        this.sk.applyMatrix(...this.transformMatrix.toArray());
      }
      if (this.rotateMatrix) {
        this.sk.applyMatrix(...this.rotateMatrix.toArray());
      }

      // draw profile and applying transformation matrices
      for(let i = 0; i < this.import.elements.length; i++) {
        if(this.import.elements[i].type === 0) {  // draw line
          this.sk.line(
            this.import.elements[i].p0.x,
            this.import.elements[i].p0.y,
            this.import.elements[i].p1.x,
            this.import.elements[i].p1.y
          );
        } else {  // draw arc
          this.sk.noFill();
          this.sk.arc(
            this.import.elements[i].c.x,
            this.import.elements[i].c.y,
            this.import.elements[i].d,
            this.import.elements[i].d,
            this.import.elements[i].from,
            this.import.elements[i].to
          );
        }
      }
    }
  }

  makeProfileTransformMatrices(axisX, axisY, axisAngle) {
    if (axisX || axisY) {
      this.transformMatrix = Matrix.from(1, 0, 0, 1, axisX, axisY);
    }
    if (axisAngle) {
      this.rotateMatrix = new Matrix().rotateDeg(axisAngle);
      this.negativeRotateMatrix = new Matrix().rotateDeg(-axisAngle);
    }
  }

  mouseMovedHandler() {
    let cursorX = this.sk.mouseX;
    let cursorY = this.sk.mouseY;
    let draftCenterX = this.sk.width / 2;
    let draftCenterY = this.sk.height / 2;

    let newCenter = Matrix.from(1, 0, 0, -1, 0, 0).applyToPoint(draftCenterX, draftCenterY);
    let newCursor = Matrix.from(1, 0, 0, -1, 0, 0).applyToPoint(cursorX, cursorY);

    if (this.transformMatrix) {
      newCenter = this.transformMatrix.applyToPoint(newCenter.x, newCenter.y);
    }
    if (this.negativeRotateMatrix) {
      newCenter = this.negativeRotateMatrix.applyToPoint(newCenter.x, newCenter.y);
      newCursor = this.negativeRotateMatrix.applyToPoint(newCursor.x, newCursor.y);
    }

    cursorX = newCursor.x - newCenter.x; 
    cursorY = newCenter.y - newCursor.y; 

    console.log('relativeCursor', cursorX, cursorY);
  }
}