<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
  </div>
</template>

<script>
import "pdfjs-dist/web/pdf_viewer.css";

const PDFJS = require("pdfjs-dist");
PDFJS.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker");

import * as PDFLib from 'pdf-lib';

import {getAsset} from "@/utils/prepareAssets";
// import Tailwind from "./Tailwind.svelte";
// import PDFPage from "./PDFPage.svelte";
// import Image from "./Image.svelte";
// import Text from "./Text.svelte";
// import Drawing from "./Drawing.svelte";
// import DrawingCanvas from "./DrawingCanvas.svelte";
import {fetchFont} from "@/utils/prepareAssets.js";
import {
  readAsImage,
  readAsPDF,
  readAsDataURL
} from "@/utils/asyncReader.js";
import {save} from "@/utils/PDF.js";

getAsset('makeTextPDF');

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      pdfFile: null,
      pdfName: "",
      pages: [],
      pagesScale: [],
      allObjects: [],
      currentFont: "Times-Roman",
      focusId: null,
      selectedPageIndex: -1,
      saving: false,
      addingDrawing: false,
    }
  },
  async mounted() {
    try {
      const res = await fetch("https://raw.githubusercontent.com/pdf-association/pdf20examples/master/pdf20-utf8-test.pdf");
      const pdfBlob = await res.blob();
      await this.addPDF(pdfBlob);
      this.selectedPageIndex = 0;
      setTimeout(() => {
        fetchFont(this.currentFont);
        // prepareAssets();
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  },
  async created() {
    const pdfDoc = await PDFLib.PDFDocument.create();
    console.log("-> pdfDoc", pdfDoc);
  },
  methods: {
    genID() {
      let id = 0;
      return function genId() {
        return id++;
      };
    },
    async onUploadPDF(e) {
      const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
      const file = files[0];
      if (!file || file.type !== "application/pdf") return;
      this.selectedPageIndex = -1;
      try {
        await this.addPDF(file);
        this.selectedPageIndex = 0;
      } catch (e) {
        console.log(e);
      }
    },
    async addPDF(file) {
      try {
        const pdf = await readAsPDF(file);
        this.pdfName = file.name;
        this.pdfFile = file;
        const numPages = pdf.numPages;
        this.pages = Array(numPages)
            .fill()
            .map((_, i) => pdf.getPage(i + 1));
        this.allObjects = this.pages.map(() => []);
        this.pagesScale = Array(numPages).fill(1);
      } catch (e) {
        console.log("Failed to add pdf.");
        throw e;
      }
    },
    async onUploadImage(e) {
      const file = e.target.files[0];
      if (file && this.selectedPageIndex >= 0) {
        this.addImage(file);
      }
      e.target.value = null;
    },
    async addImage(file) {
      try {
        // get dataURL to prevent canvas from tainted
        const url = await readAsDataURL(file);
        const img = await readAsImage(url);
        const id = this.genID();
        const {width, height} = img;
        const object = {
          id,
          type: "image",
          width,
          height,
          x: 0,
          y: 0,
          payload: img,
          file
        };
        this.allObjects = this.allObjects.map((objects, pIndex) =>
            pIndex === this.selectedPageIndex ? [...objects, object] : objects
        );
      } catch (e) {
        console.log(`Fail to add image.`, e);
      }
    },
    onAddTextField() {
      if (this.selectedPageIndex >= 0) {
        this.addTextField();
      }
    },

    addTextField(text = "New Text Field") {
      const id = this.genID();
      fetchFont(this.currentFont);
      const object = {
        id,
        text,
        type: "text",
        size: 16,
        width: 0, // recalculate after editing
        lineHeight: 1.4,
        fontFamily: this.currentFont,
        x: 0,
        y: 0
      };
      this.allObjects = this.allObjects.map((objects, pIndex) =>
          pIndex === this.selectedPageIndex ? [...objects, object] : objects
      );
    },

    onAddDrawing() {
      if (this.selectedPageIndex >= 0) {
        this.addingDrawing = true;
      }
    },

    addDrawing(originWidth, originHeight, path, scale = 1) {
      const id = this.genID();
      const object = {
        id,
        path,
        type: "drawing",
        x: 0,
        y: 0,
        originWidth,
        originHeight,
        width: originWidth * scale,
        scale
      };
      this.allObjects = this.allObjects.map((objects, pIndex) =>
          pIndex === this.selectedPageIndex ? [...objects, object] : objects
      );
    },

    selectFontFamily(event) {
      const name = event.detail.name;
      fetchFont(name);
      this.currentFont = name;
    },

    selectPage(index) {
      this.selectedPageIndex = index;
    },

    updateObject(objectId, payload) {
      this.allObjects = this.allObjects.map((objects, pIndex) =>
          pIndex == this.selectedPageIndex
              ? objects.map(object =>
                  object.id === objectId ? {...object, ...payload} : object
              )
              : objects
      );
    },

    deleteObject(objectId) {
      this.allObjects = this.allObjects.map((objects, pIndex) =>
          pIndex == this.selectedPageIndex
              ? objects.filter(object => object.id !== objectId)
              : objects
      );
    },

    onMeasure(scale, i) {
      this.pagesScale[i] = scale;
    },

// FIXME: Should wait all objects finish their async work
    async savePDF() {
      if (!this.pdfFile || this.saving || !this.pages.length) return;
      this.saving = true;
      try {
        await save(this.pdfFile, this.allObjects, this.pdfName, this.pagesScale);
      } catch (e) {
        console.log(e);
      } finally {
        this.saving = false;
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
