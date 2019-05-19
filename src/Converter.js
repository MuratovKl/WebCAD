/* eslint-disable */
import { Matrix } from 'transformation-matrix-js';
import p5 from 'p5';

export default class Converter {
  static vectorsToPrimitives(l, r, a, ac, ax, ay) {
    let elements = [];
    let matrices = [];
    let startEl = Math.floor(ac) - 1;
    let startPos = ac - Math.floor(ac);

    // matrices, that hold transformation history
    let m = new Matrix();
    let angleCorrection = 0;

    // case when axis center not in the edge of element
    if(startPos !== 0) {
      // discribe start element
      if(r[startEl] !== 0) { // start element - arc
        let from, to;
        let trAngle = (1 - startPos) * Math.abs(a[startEl]); // angle rotate for
        let vLength = r[startEl] * Math.sqrt(2 - 2 * Math.cos(trAngle * Math.PI / 180)); // length of vector from isosceles triangle
        let c = {
          x: 0,
          y: a[startEl] > 0 ? r[startEl] : -r[startEl]
        };

        if(a[startEl] > 0) {
          from = -90 - startPos * a[startEl];
          to = -90 + (1 - startPos) * a[startEl];

          // calc transforms for next element (moving to the right)
          let vAngle = (90 - (180 - trAngle) / 2) * Math.PI / 180;
          let trVector = p5.Vector.fromAngle(vAngle, vLength);

          // rotate clockwisee and translate to trVector
          m.translate(trVector.x, trVector.y).rotateDeg(trAngle);
          angleCorrection += trAngle;
        } else {
          from = 90 - (1 - startPos) * Math.abs(a[startEl]);
          to = 90 + startPos * Math.abs(a[startEl]);

          // calc transforms for next element (moving to right)
          let vAngle = (-90 + (180 - trAngle) / 2) * Math.PI / 180;
          let trVector = p5.Vector.fromAngle(vAngle, vLength);

          // rotate counter clockwise and translate to trVector
          m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
          angleCorrection -= trAngle; 
        }

        elements.push({
          type: 1,
          c,
          d: r[startEl] * 2,
          from,
          to
        });
      } else { // start element - line
        let p0x = -l[startEl] * startPos;
        let p1x = p0x + l[startEl];
        elements.push({
          type: 0,
          p0: { x: p0x, y: 0 },
          p1: { x: p1x, y: 0 }
        });

        // move axis for next element (moving to right)
        m.translateX(p1x);
      }
    }
    
    // move to right
    if(Math.ceil(ac - 1) !== l.length) {
      for(let i = Math.ceil(ac - 1); i < l.length; i++) {
        if(r[i] !== 0) { // current element - arc
          let from, to;
          let trAngle = Math.abs(a[i]); // angle rotate for
          let vLength = r[i] * Math.sqrt(2 - 2 * Math.cos(trAngle * Math.PI / 180)); // length of vector from isosceles triangle

          let c = m.applyToPoint(0, a[i] > 0 ? r[i] : -r[i]);

          if(a[i] > 0) {
            // from = -90;
            // to = -90 + a[i];
            from = -90 + angleCorrection;
            to = -90 + a[i] + angleCorrection;

            // calc transforms for next element (moving to the right)
            let vAngle = (90 - (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element last - 1 translate to start position
            if(i !== l.length - 1) {
              // rotate clockwisee and translate to trVector
              m.translate(trVector.x, trVector.y).rotateDeg(trAngle);
              angleCorrection += trAngle;
            }
          } else {
            // from = 90 - Math.abs(a[i]);
            // to = 90;
            from = 90 - Math.abs(a[i]) + angleCorrection;
            to = 90 + angleCorrection;

            // calc transforms for next element (moving to right)
            let vAngle = (-90 + (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element last - 1 translate to start position
            if(i !== l.length - 1) {
              // rotate counter clockwise and translate to trVector
              m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
              angleCorrection -= trAngle;
            }
          }
          elements.push({
            type: 1,
            c,
            d: r[i] * 2,
            from,
            to
          });
        } else { // current element - line
          elements.push({
            type: 0,
            p0: m.applyToPoint(0, 0),
            p1: m.applyToPoint(l[i], 0)
          });

          // if element last - 1 translate to start position
          if(i !== l.length - 1) {
            m.translateX(l[i]);
          }
        }
      }
    }

    // case when axis center not in the edge of element
    if(startPos !== 0) {
      if(r[startEl] !== 0) { // start element - arc
        let trAngle = startPos * Math.abs(a[startEl]); // angle rotate for
        let vLength = r[startEl] * Math.sqrt(2 - 2 * Math.cos(trAngle * Math.PI / 180)); // length of vector from isosceles triangle

        if(a[startEl] > 0) {
          // calc transforms for next element (moving to left)
          let vAngle = (90 + (180 - trAngle) / 2) * Math.PI / 180;
          let trVector = p5.Vector.fromAngle(vAngle, vLength);

          // rotate counter clockwisee and translate to trVector
          m = new Matrix();
          angleCorrection = 0;
          m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
          angleCorrection -= trAngle;

        } else {
          // calc transforms for next element (moving to left)
          let vAngle = (-90 - (180 - trAngle) / 2) * Math.PI / 180;
          let trVector = p5.Vector.fromAngle(vAngle, vLength);

          // rotate clockwise and translate to trVector
          m = new Matrix();
          angleCorrection = 0;
          m.translate(trVector.x, trVector.y).rotateDeg(trAngle);
          angleCorrection += trAngle;
        }

      } else { // start element - line
        let p0x = -l[startEl] * startPos;
        // move axis for next element (moving to left)
        m = new Matrix();
        angleCorrection = 0;
        m.translateX(p0x);
      }
    } else {
      m = new Matrix();
      angleCorrection = 0;
    }

    // move to left
    if(ac > 2) {
      for(let i = Math.floor(ac - 2); i >= 0; i--) {
        if(r[i] !== 0) { // current element - arc
          let from, to;
          let trAngle = Math.abs(a[i]); // angle rotate for
          let vLength = r[i] * Math.sqrt(2 - 2 * Math.cos(trAngle * Math.PI / 180)); // length of vector from isosceles triangle

          let c = m.applyToPoint(0, a[i] > 0 ? r[i] : -r[i]);

          if(a[i] > 0) {
            from = -90 - a[i] + angleCorrection;
            to = -90 + angleCorrection;

            // calc transforms for next element (moving to the left)
            let vAngle = (90 + (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element last - 1 translate to start position
            if(i !== l.length - 1) {
              // rotate counter clockwisee and translate to trVector
              m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
              angleCorrection -= trAngle;
            } else {
              m = Matrix.from(1, 0, 0, 1, ax, ay);
            }
          } else {
            from = 90 + angleCorrection;
            to = 90 + Math.abs(a[i]) + angleCorrection;

            // calc transforms for next element (moving to left)
            let vAngle = (-90 - (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element 0 translate to start position
            if(i !== 0) {
              // rotate clockwise and translate to trVector
              m.translate(trVector.x, trVector.y).rotateDeg(trAngle);
              angleCorrection += trAngle;
            } else {
              m = new Matrix();
              angleCorrection = 0;
            }
          }
          elements.push({
            type: 1,
            c,
            d: r[i] * 2,
            from,
            to
          });
        } else { // current element - line
          elements.push({
            type: 0,
            p0: m.applyToPoint(0, 0),
            p1: m.applyToPoint(-l[i], 0)
          });

          // if element 0 translate to start position
          if(i !== 0) {
            m.translateX(-l[i]);
          } else {
            m = new Matrix();
          }
        }
      }
    }

    return JSON.stringify({
      elements,
      matrices
    });
  }
}