<template>
  <!--  <div-->
  <!--      class="absolute left-0 top-0 select-none"-->
  <!--      :style="{width: `${width + dw}px`,height: `${(height + dh)}px`,transform: `translate(${x + dx}px, ${y + dy}px)`}">-->
  <div
      class="absolute left-0 top-0 select-none"
      :style="{width: `${width + dw}px`,height: `${(width + dw)/ ratio}px`,transform: `translate(${x + dx}px, ${y + dy}px)`}">
    <div
        @mousedown="handlePanStart"
        @touchstart="handlePanStart"
        class="absolute w-full h-full cursor-grab"
        :class="[operation === 'move' ? 'cursor-grabbing':'', operation? 'operation':'']"
    >
      <!--      <div-->
      <!--          data-direction="left"-->
      <!--          class="absolute border-dashed border-gray-600 h-full w-1 left-0 top-0 border-l cursor-ew-resize"/>-->
      <!--      <div-->
      <!--          data-direction="top"-->
      <!--          class="absolute border-dashed border-gray-600 w-full h-1 left-0 top-0 border-t cursor-ns-resize"/>-->
      <!--      <div-->
      <!--          data-direction="bottom"-->
      <!--          class="absolute border-dashed border-gray-600 w-full h-1 left-0 bottom-0 border-b cursor-ns-resize"/>-->
      <!--      <div-->
      <!--          data-direction="right"-->
      <!--          class="absolute border-dashed border-gray-600 h-full w-1 right-0 top-0 border-r cursor-ew-resize"/>-->
      <div
          data-direction="left-top"
          class="absolute w-10 h-10 bg-blue-300 rounded-full left-0 top-0 cursor-nwse-resize transform
      -translate-x-1/2 -translate-y-1/2 md:scale-25"/>
      <div
          data-direction="right-top"
          class="absolute w-10 h-10 bg-blue-300 rounded-full right-0 top-0 cursor-nesw-resize transform
      translate-x-1/2 -translate-y-1/2 md:scale-25"/>
      <div
          data-direction="left-bottom"
          class="absolute w-10 h-10 bg-blue-300 rounded-full left-0 bottom-0 cursor-nesw-resize transform
      -translate-x-1/2 translate-y-1/2 md:scale-25"/>
      <div
          data-direction="right-bottom"
          class="absolute w-10 h-10 bg-blue-300 rounded-full right-0 bottom-0 cursor-nwse-resize transform
      translate-x-1/2 translate-y-1/2 md:scale-25"/>
    </div>
    <div
        @click="onDelete"
        class="absolute left-0 top-0 right-0 w-12 h-12 m-auto rounded-full bg-white
    cursor-pointer transform -translate-y-1/2 md:scale-25">
      <img class="w-full h-full" src="/delete.svg" alt="delete object"/>
    </div>
    <canvas class="w-full h-full" ref="canvas"/>
  </div>
</template>

<script>
import itemEventsMixin from "@/components/ItemEventsMixin";

export default {
  name: "ImageComponent",
  mixins: [itemEventsMixin],
  props: ['payload', 'file', 'width', 'height', 'originWidth', 'originHeight', 'x', 'y', 'pageScale'],
  data() {
    return {
      startX: null,
      startY: null,
      canvas: null,
      operation: "",
      directions: [],
      dx: 0,
      dy: 0,
      dw: 0,
      dh: 0,
    }
  },
  computed: {
    ratio() {
      return this.originWidth / this.originHeight
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.render()
  },
  created() {
  },
  watch: {},
  methods: {
    async render() {
      // use canvas to prevent img tag's auto resize
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.getContext("2d").drawImage(this.payload, 0, 0);
      let scale = 1;
      const limit = 500;
      if (this.width > limit) {
        scale = limit / this.width;
      }
      if (this.height > limit) {
        scale = Math.min(scale, limit / this.height);
      }
      this.$emit("onUpdate", {
        width: this.width * scale,
        height: this.height * scale
      });
      if (!["image/jpeg", "image/png"].includes(this.file.type)) {
        this.canvas.toBlob(blob => {
          this.$emit("onUpdate", {
            file: blob
          });
        });
      }
    },
    handlePanMove(event) {
      let coordinate;
      if (event.type === 'mousemove') {
        coordinate = this.handleMousemove(event)
      }
      if (event.type === 'touchmove') {
        coordinate = this.handleTouchmove(event)
      }
      if (!coordinate) return console.log('ERROR');

      const _dx = (coordinate.detail.x - this.startX) / this.pageScale;
      const _dy = (coordinate.detail.y - this.startY) / this.pageScale;
      if (this.operation === "move") {
        this.dx = _dx;
        this.dy = _dy;
      } else if (this.operation === "scale") {
        if (this.directions.includes("left")) {
          this.dx = _dx;
          this.dw = -_dx;
        }
        if (this.directions.includes("top")) {
          this.dy = _dy;
          this.dh = -_dy;
        }
        if (this.directions.includes("right")) {
          this.dw = _dx;
        }
        if (this.directions.includes("bottom")) {
          this.dh = _dy;
        }
      }
    },

    handlePanEnd(event) {
      let coordinate;
      if (event.type === 'mouseup') {
        coordinate = this.handleMouseup(event)
      }
      if (event.type === 'touchend') {
        coordinate = this.handleTouchend(event)
      }
      if (!coordinate) return console.log('ERROR');
      if (this.operation === "move") {
        this.$emit("onUpdate", {
          x: this.x + this.dx,
          y: this.y + this.dy
        });
        this.dx = 0;
        this.dy = 0;
      } else if (this.operation === "scale") {
        this.$emit("onUpdate", {
          x: this.x + this.dx,
          y: this.y + this.dy,
          width: this.width + this.dw,
          height: this.height + this.dh
        });
        this.dx = 0;
        this.dy = 0;
        this.dw = 0;
        this.dh = 0;
        this.directions = [];
      }
      this.operation = "";
    },
    handlePanStart(event) {
      let coordinate;
      if (event.type === 'mousedown') {
        coordinate = this.handleMousedown(event)
      }
      if (event.type === 'touchstart') {
        coordinate = this.handleTouchStart(event)
      }
      if (!coordinate) return console.log('ERROR');

      this.startX = coordinate.detail.x;
      this.startY = coordinate.detail.y;
      if (coordinate.detail.target === event.currentTarget) {
        return (this.operation = "move");
      }
      this.operation = "scale";
      this.directions = coordinate.detail.target.dataset.direction.split("-");
    },
    onDelete() {
      this.$emit("onDelete");
    }
  }
}
</script>

<style scoped>
.operation {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
