/* eslint-disable */
import { Matrix } from 'transformation-matrix-js';
import p5 from 'p5';

export default class Converter {
  static vectorsToPrimitives(l, r, a, ac, ax, ay, aa) {
    let elements = [];
    let matrices = [];
    let startEl = Math.floor(ac) - 1;
    let startPos = ac - Math.floor(ac);

    // matrix, that hold transformation history
    let m = new Matrix();

    // translate axis center to (ax, ay) and rotate to aa
    let initialTransform = [1, 0, 0, 1, ax, ay];
    let aaRad = aa * Math.PI / 180;
    if(aa > 0) {
      initialTransform[0] = Math.cos(aaRad);
      initialTransform[1] = Math.sin(aaRad);
      initialTransform[2] = -Math.sin(aaRad);
      initialTransform[3] = Math.cos(aaRad);
    } else if(aa < 0) {
      initialTransform[0] = Math.cos(aaRad);
      initialTransform[1] = -Math.sin(aaRad);
      initialTransform[2] = Math.sin(aaRad);
      initialTransform[3] = Math.cos(aaRad);
    }
    matrices.push(initialTransform);

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
          let trAngleRad = trAngle * Math.PI / 180;
          matrices.push([
            Math.cos(trAngleRad),
            Math.sin(trAngleRad),
            -Math.sin(trAngleRad),
            Math.cos(trAngleRad),
            trVector.x,
            trVector.y
          ]);
          m.translate(trVector.x, trVector.y).rotateDeg(trAngle);

        } else {
          from = 90 - (1 - startPos) * Math.abs(a[startEl]);
          to = 90 + startPos * Math.abs(a[startEl]);

          // calc transforms for next element (moving to right)
          let vAngle = (-90 + (180 - trAngle) / 2) * Math.PI / 180;
          let trVector = p5.Vector.fromAngle(vAngle, vLength);

          // rotate counter clockwise and translate to trVector
          let trAngleRad = trAngle * Math.PI / 180;
          matrices.push([
            Math.cos(trAngleRad),
            -Math.sin(trAngleRad),
            Math.sin(trAngleRad),
            Math.cos(trAngleRad),
            trVector.x,
            trVector.y
          ]);
          m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
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
        matrices.push([1, 0, 0, 1, p1x, 0]);
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
          let c = {
            x: 0,
            y: a[i] > 0 ? r[i] : -r[i]
          };

          if(a[i] > 0) {
            from = -90;
            to = -90 + a[i];

            // calc transforms for next element (moving to the right)
            let vAngle = (90 - (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element last - 1 translate to start position
            if(i !== l.length - 1) {
              // rotate clockwisee and translate to trVector
              let trAngleRad = trAngle * Math.PI / 180;
              matrices.push([
                Math.cos(trAngleRad),
                Math.sin(trAngleRad),
                -Math.sin(trAngleRad),
                Math.cos(trAngleRad),
                trVector.x,
                trVector.y
              ]);
              m.translate(trVector.x, trVector.y).rotateDeg(trAngle);
            }
          } else {
            from = 90 - Math.abs(a[i]);
            to = 90;

            // calc transforms for next element (moving to right)
            let vAngle = (-90 + (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element last - 1 translate to start position
            if(i !== l.length - 1) {
              // rotate counter clockwise and translate to trVector
              let trAngleRad = trAngle * Math.PI / 180;
              matrices.push([
                Math.cos(trAngleRad),
                -Math.sin(trAngleRad),
                Math.sin(trAngleRad),
                Math.cos(trAngleRad),
                trVector.x,
                trVector.y
              ]);
              m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
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
            p0: {
              x: 0,
              y: 0
            },
            p1: {
              x: l[i],
              y: 0
            }
          });

          // if element last - 1 translate to start position
          if(i !== l.length - 1) {
            matrices.push([1, 0, 0, 1, l[i], 0]);
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

          let m1 = m.inverse();
          m = new Matrix();
          m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
          m1.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
          matrices.push(m1.toArray());

        } else {
          // calc transforms for next element (moving to left)
          let vAngle = (-90 - (180 - trAngle) / 2) * Math.PI / 180;
          let trVector = p5.Vector.fromAngle(vAngle, vLength);

          // rotate clockwise and translate to trVector

          let m1 = m.inverse();
          m = new Matrix();
          m.translate(trVector.x, trVector.y).rotateDeg(trAngle);
          m1.translate(trVector.x, trVector.y).rotateDeg(trAngle);
          matrices.push(m1.toArray());
        }

      } else { // start element - line
        let p0x = -l[startEl] * startPos;
        // move axis for next element (moving to left)
        let m1 = m.inverse();
        m = new Matrix();
        m.translateX(p0x);
        m1.translateX(p0x);
        matrices.push(m1.toArray());
      }
    } else {
      matrices.push(m.inverse().toArray());
      m = new Matrix();
    }

    // move to left
    if(ac > 2) {
      for(let i = Math.floor(ac - 2); i >= 0; i--) {
        console.log(i);
        if(r[i] !== 0) { // current element - arc
          let from, to;
          let trAngle = Math.abs(a[i]); // angle rotate for
          let vLength = r[i] * Math.sqrt(2 - 2 * Math.cos(trAngle * Math.PI / 180)); // length of vector from isosceles triangle
          let c = {
            x: 0,
            y: a[i] > 0 ? r[i] : -r[i]
          };

          if(a[i] > 0) {
            from = -90 - a[i];
            to = -90;

            // calc transforms for next element (moving to the left)
            let vAngle = (90 + (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element last - 1 translate to start position
            if(i !== l.length - 1) {
              // rotate counter clockwisee and translate to trVector
              let trAngleRad = trAngle * Math.PI / 180;
              matrices.push([
                Math.cos(trAngleRad),
                -Math.sin(trAngleRad),
                Math.sin(trAngleRad),
                Math.cos(trAngleRad),
                trVector.x,
                trVector.y
              ]);
              m.translate(trVector.x, trVector.y).rotateDeg(-trAngle);
            } else {
              matrices.push(m.inverse().toArray());
              m = Matrix.from(1, 0, 0, 1, ax, ay);
            }
          } else {
            from = 90;
            to = 90 + Math.abs(a[i]);

            // calc transforms for next element (moving to left)
            let vAngle = (-90 - (180 - trAngle) / 2) * Math.PI / 180;
            let trVector = p5.Vector.fromAngle(vAngle, vLength);

            // if element 0 translate to start position
            if(i !== 0) {
              // rotate clockwise and translate to trVector
              let trAngleRad = trAngle * Math.PI / 180;
              matrices.push([
                Math.cos(trAngleRad),
                Math.sin(trAngleRad),
                -Math.sin(trAngleRad),
                Math.cos(trAngleRad),
                trVector.x,
                trVector.y
              ]);
              m.translate(trVector.x, trVector.y).rotateDeg(trAngle);
            } else {
              matrices.push(m.inverse().toArray());
              m = new Matrix();
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
            p0: {
              x: 0,
              y: 0
            },
            p1: {
              x: -l[i],
              y: 0
            }
          });

          // if element 0 translate to start position
          if(i !== 0) {
            matrices.push([1, 0, 0, 1, -l[i], 0]);
            m.translateX(-l[i]);
          } else {
            matrices.push(m.inverse().toArray());
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