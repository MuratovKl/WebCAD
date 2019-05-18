<template>
  <div id="app">
    <div id="canvas-wrapper">

    </div>
    <div id="sidebar">
      <input v-model="L" type="text" placeholder="L">
      <input v-model="R" type="text" placeholder="R">
      <input v-model="A" type="text" placeholder="A">
      <input v-model.number="axisCenter" type="text" placeholder="Axis Center">
      <input v-model.number="axisX" type="text" placeholder="Axis X">
      <input v-model.number="axisY" type="text" placeholder="Axis Y">
      <input v-model.number="axisAngle" type="text" placeholder="Axis Angle">
      <button @click="importPorfile">Import</button>
    </div>
  </div>
</template>

<script>
import p5 from 'p5';
import { sketch } from './sketch.js';
import Draft from './Draft.js';
import Converter from './Converter.js';

export default {
  name: 'app',
  data() {
    return {
      P5: null,
      draft: null,
      L: '',
      R: '',
      A: '',
      axisCenter: '',
      axisX: '',
      axisY: '',
      axisAngle: ''
    };
  },
  mounted() {
    this.draft = new Draft();
    this.P5 = new p5(sketch(this.draft));
  },
  methods: {
    importPorfile() {
      let l = this.L.split(',').map((el) => parseFloat(el));
      let r = this.R.split(',').map((el) => parseFloat(el));
      let a = this.A.split(',').map((el) => parseFloat(el));

      l = [50, 0, 50, 0, 50];
      r = [0, 40, 0, 40, 0];
      a = [0, 90, 0, 90, 0];
      this.axisX = 50;
      this.axisY = 40;
      this.axisAngle = 20;
      this.axisCenter = 3.5;

      this.draft.makeProfileTransformMatrices(this.axisX, this.axisY, this.axisAngle);
      let result = Converter.vectorsToPrimitives(l, r, a, this.axisCenter, this.axisX, this.axisY, this.axisAngle);
      console.log(result);
      this.draft.import = JSON.parse(result);
    }
  }
}
</script>

<style lang="scss">

  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  #sidebar {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    padding: 20px;

    & > input {
      margin-bottom: 5px;
    }
  }

</style>
