<template>
  <div class="relative w-full h-full">
    <div
        id="canvas-container"
        ref="canvasElement"
        @mousedown="handlePanStart(handleMousedown($event))"
        @mousemove="handlePanMove(handleMousemove($event))"
        @mouseup="handlePanEnd(handleMouseup($event))"
        class="relative w-full h-full select-none"
    >
      <svg class="relative w-full h-full pointer-events-none">
        <path
            stroke-width="5"
            stroke-linejoin="round"
            stroke-linecap="round"
            :d="path"
            stroke="black"
            fill="none"/>
      </svg>
    </div>
    <div class="absolute right-0 bottom-0 mr-4 mb-4 flex">
      <button
          @click="onClose"
          class=" w-24 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4
      rounded mr-4">
        Cancel
      </button>
      <button
          @click="onFinish"
          class="w-24 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4
      rounded">
        Done
      </button>
    </div>
  </div>
</template>
<script>
import itemEventsMixin from "@/components/ItemEventsMixin";

export default {
  name: "DrawingCanvasComponent",
  // components: {itemEventsMixin},
  mixins: [itemEventsMixin],
  props: [],
  data() {
    return {
      // canvas: null,
      x: 0,
      y: 0,
      path: "",
      minX: Infinity,
      maxX: 0,
      minY: Infinity,
      maxY: 0,
      paths: [],
      drawing: false,
    }
  },
  mounted() {
  },
  created() {
  },
  methods: {
    handlePanStart(event) {
      let canvas = document.getElementById("canvas-container");
      if (event.detail.target !== canvas) {
        return (this.drawing = false);
      }
      this.drawing = true;
      this.x = event.detail.x;
      this.y = event.detail.y;
      this.minX = Math.min(this.minX, this.x);
      this.maxX = Math.max(this.maxX, this.x);
      this.minY = Math.min(this.minY, this.y);
      this.maxY = Math.max(this.maxY, this.y);
      this.paths.push(["M", this.x, this.y]);
      this.path += `M${this.x},${this.y}`;
    },
    handlePanMove(event) {
      if (!this.drawing) {
        return;
      }
      this.x = event.detail.x;
      this.y = event.detail.y;
      this.minX = Math.min(this.minX, this.x);
      this.maxX = Math.max(this.maxX, this.x);
      this.minY = Math.min(this.minY, this.y);
      this.maxY = Math.max(this.maxY, this.y);
      this.paths.push(["L", this.x, this.y]);
      this.path += `L${this.x},${this.y}`;
    },
    handlePanEnd() {
      this.drawing = false;
    },
    onFinish() {
      if (!this.paths.length) return;
      const dx = -(this.minX - 10);
      const dy = -(this.minY - 10);
      const width = this.maxX - this.minX + 20;
      const height = this.maxY - this.minY + 20;
      this.$emit("onFinish", {
        originWidth: width,
        originHeight: height,
        path: this.paths.reduce((acc, cur) => {
          return acc + cur[0] + (cur[1] + dx) + "," + (cur[2] + dy);
        }, "")
      });
    },
    onClose() {
      this.$emit("onCancel");
    }
  }
}
</script>

<style scoped>

</style>
