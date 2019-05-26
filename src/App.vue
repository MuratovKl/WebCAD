<template>
  <div id="app">
    <div id="canvas-wrapper"></div>
    <div id="sidebar">
      <button
        class="btn"
        id="import-btn"
        @click="toggleImportPopup"
      >
        Импортировать профиль
      </button>
    </div>
    <transition>
      <div v-show="isImportPopupVisible" id="overlay">
        <div class="import-popup">
          <label>
            Количество элементов в профиле:
            <input class="number-input" v-model.number="numberOfParts" type="number">
          </label>
          <button
            @click="fillVectors"
            :disabled="!numberOfParts"
            class="btn"
          >
            Подтвердить
          </button>
          <div class="separator"></div>
          <section v-show="L.length !== 0">
            <label>
              Вектор L:
              <input
                v-for="(el, index) of L"
                :key="index"
                v-model.number="el.value"
                class="number-input"
                type="number">
            </label>
            <div class="separator"></div>
          </section>
          <section v-show="R.length !== 0">
            <label>
              Вектор R:
              <input
                v-for="(el, index) of R"
                :key="index"
                v-model.number="el.value"
                class="number-input"
                type="number">
            </label>
            <div class="separator"></div>
          </section>
          <section v-show="A.length !== 0">
            <label>
              Вектор A:
              <input
                v-for="(el, index) of A"
                :key="index"
                v-model.number="el.value"
                class="number-input"
                type="number">
            </label>
            <div class="separator"></div>
          </section>
          <section v-show="A.length !== 0">
            <label>
              Смещение по оси X:
              <input class="number-input" v-model.number="axisX" type="number">
            </label>
            <br>
            <label>
              Смещение по оси Y:
              <input class="number-input" v-model.number="axisY" type="number">
            </label>
            <br>
            <label>
              Положение системы координат профиля:
              <input class="number-input" v-model.number="axisCenter" type="number">
            </label>
            <br>
            <label>
              Поворот системы координат профиля:
              <input class="number-input" v-model.number="axisAngle" type="number">
            </label>
            <div class="separator"></div>
          </section>

          <div class="button-set">
            <button
              class="btn btn_action button-set__button"
              @click="importPorfile"
            >
              Импортировать
            </button>
            <button
              class="btn button-set__button"
              @click="toggleImportPopup"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </transition>
    <transition>
      <div v-show="isPartInfoVisible" class="part-params">
        <label v-show="selectedLength > 0">
          L:
          <input
            class="number-input"
            v-model.number="selectedL"
            type="number"
          >
        </label>
        <label v-show="selectedRadius > 0">
          R:
          <input
            class="number-input"
            v-model.number="selectedR"
            type="number"
          >
        </label>
        <label v-show="selectedAngle > 0">
          A:
          <input
            class="number-input"
            v-model.number="selectedA"
            type="number"
          >
        </label>
        <div class="separator"></div>
        <button
          @click="rebuildProfile"
          class="btn btn_action part-params__btn"
        >
          Применить
        </button>
        <br>
        <button
          @click="closePartParams"
          class="btn part-params__btn"
        >
          Закрыть
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import p5 from 'p5';
import { sketch } from './sketch.js';
import Draft from './Draft.js';
import Converter from './Converter.js';
import CollisionDetector from './CollisionDetector.js';

export default {
  name: 'app',
  data() {
    return {
      P5: null,
      draft: null,
      collisionDetector: null,
      L: [],
      R: [],
      A: [],
      importedProfile: null,
      axisCenter: 0,
      axisX: 0,
      axisY: 0,
      axisAngle: 0,
      numberOfParts: '',
      selectedElement: { index: -1 },
      selectedL: '',
      selectedR: '',
      selectedA: '',
      isImportPopupVisible: false
    };
  },
  mounted() {
    this.draft = new Draft();
    this.collisionDetector = new CollisionDetector();
    this.P5 = new p5(sketch(this.draft, this.collisionDetector));
    this.draft.collisionDetector = this.collisionDetector;
    this.draft.selectedElement = this.selectedElement; 
  },
  computed: {
    isPartInfoVisible() {
      return this.selectedElement.index === -1 ? false : true;
    },
    selectedLength() {
      if (this.selectedElement.index === -1) {
        this.selectedL = -1;
        return -1;
      } else {
        this.selectedL = this.L[this.selectedElement.index].value;
        return this.L[this.selectedElement.index].value;
      }
    },
    selectedRadius() {
      if (this.selectedElement.index === -1) {
        this.selectedR = -1;
        return -1;
      } else {
        this.selectedR = this.R[this.selectedElement.index].value;
        return this.R[this.selectedElement.index].value;
      }
    },
    selectedAngle() {
      if (this.selectedElement.index === -1) {
        this.selectedA = -1;
        return -1;
      } else {
        this.selectedA = this.A[this.selectedElement.index].value;
        return this.A[this.selectedElement.index].value;
      }
    }
  },
  methods: {
    importPorfile() {
      let l = this.L.map((el) => el.value);
      let r = this.R.map((el) => el.value);
      let a = this.A.map((el) => el.value);

      // l = [50, 0, 50, 0, 50];
      // r = [0, 40, 0, 40, 0];
      // a = [0, 90, 0, 90, 0];
      // this.axisX = 50;
      // this.axisY = 40;
      // this.axisAngle = 20;
      // this.axisCenter = 3.5;

      this.draft.makeProfileTransformMatrices(this.axisX, this.axisY, this.axisAngle);
      this.importedProfile = Converter.vectorsToPrimitives(l, r, a, this.axisCenter, this.axisX, this.axisY);
      this.draft.import = this.importedProfile;
      console.log(this.draft.import);
      this.draft.collisionMap = this.collisionDetector.buildCollisionMap(this.importedProfile.elements);
      this.draft.firstElementIndex = Math.floor(this.axisCenter) - 1;
      this.toggleImportPopup();
    },
    toggleImportPopup() {
      this.isImportPopupVisible = !this.isImportPopupVisible;
    },
    fillVectors() {
      if (this.L.length === this.numberOfParts) {
        return;
      }
      if (this.L.length > this.numberOfParts) {
        this.L = this.L.slice(0, this.numberOfParts);
        this.R = this.R.slice(0, this.numberOfParts);
        this.A = this.A.slice(0, this.numberOfParts);
        return;
      }
      if (this.L.length < this.numberOfParts) {
        let numberOfNew = this.numberOfParts - this.L.length;
        for (let i = 0; i < numberOfNew; i++) {
          this.L.push({ value: 0 });
          this.R.push({ value: 0 });
          this.A.push({ value: 0 });
        }
        return;
      }
    },
    closePartParams() {
      this.selectedElement.index = -1;
    },
    isParamsChanged() {
      if (this.selectedLength !== this.selectedL) {
        return true;
      }
      if (this.selectedRadius !== this.selectedR) {
        return true;
      }
      if (this.selectedAngle !== this.selectedA) {
        return true;
      }
      return false;
    },
    rebuildProfile() {
      if (!this.isParamsChanged()) {
        return;
      }
      console.log('parametrs changed');
      let elToChange = this.selectedElement.index;
      this.L[elToChange].value = this.selectedL;
      this.R[elToChange].value = this.selectedR;
      this.A[elToChange].value = this.selectedA;

      let l = this.L.map((el) => el.value);
      let r = this.R.map((el) => el.value);
      let a = this.A.map((el) => el.value);

      if (elToChange === (Math.floor(this.axisCenter) - 1)) {
        this.importedProfile = Converter.vectorsToPrimitives(l, r, a, this.axisCenter, this.axisX, this.axisY);
        this.draft.import = this.importedProfile;
      } else {
        Converter.recalcProfile(l, r, a, this.axisCenter, this.importedProfile, elToChange);
      }
      this.draft.collisionMap = this.collisionDetector.buildCollisionMap(this.importedProfile.elements);
      this.closePartParams();
    }
  }
}
</script>

<style lang="scss">

  * {
    outline: none;
  }

  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'Montserrat', sans-serif;
  }

  #sidebar {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    padding: 20px;
  }

  .btn {
    height: 30px;
    border: none;
    background-color: white;
    font-size: 12px;
    font-family: inherit;
    border-radius: 15px;
    border: 1px solid #c3e3ff;
    transition: background-color 200ms ease;

    &:not(:disabled) {
      cursor: pointer;
      &:hover, &:focus {
        background-color: #c3e3ff;
      }
    }

    &_action {
      background-color: #c3e3ff;
      border: none;

      &:not(:disabled) {
        cursor: pointer;
        &:hover, &:focus {
          background-color: darken(#c3e3ff, 10);
        }
      }
    }
  }

  .number-input {
    width: 50px;
    height: 30px;
    margin: 5px;
    padding: 0 0 0 10px;
    border-radius: 15px;
    border: 1px solid #c3e3ff;
  }



  #overlay {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .import-popup {
    min-width: 200px;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: scroll;
    padding: 10px;
    background-color: white;
    border-radius: 10px;
    font-size: 12px;
  }

  .button-set {
    display: flex;
    justify-content: center;

    &__button:first-of-type {
      margin-right: 20px;
    }
  }

  .separator {
    height: 1px;
    background-color: #c3e3ff;
    margin: 10px 0;
  }

  .part-params {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 10px;
    text-align: center;
    border-radius: 10px;
    background-color: white;

    &__btn:first-of-type {
      margin-bottom: 5px;
    }
  }

</style>
