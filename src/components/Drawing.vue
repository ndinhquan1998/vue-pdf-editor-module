<template>
  <div
      class="absolute left-0 top-0 select-none"
      :style="{width: `${width + dw}px`,height: `${(width + dw)/ ratio}px`,transform: `translate(${x + dx}px, ${y + dy}px)`}"
  >
    <div
        @mousedown="handlePanStart(handleMousedown($event),$event)"
        @mousemove="handlePanMove(handleMousemove($event))"
        @mouseup="handlePanEnd(handleMouseup($event))"
        class="absolute w-full h-full cursor-grab border border-gray-400
    border-dashed"
        :class="[operation === 'move' ? 'cursor-grabbing':'',operation? 'operation':'']"
    >
      <div
          data-direction="left-top"
          class="absolute left-0 top-0 w-10 h-10 bg-green-400 rounded-full
      cursor-nwse-resize transform -translate-x-1/2 -translate-y-1/2 md:scale-25"/>
      <div
          data-direction="right-bottom"
          class="absolute right-0 bottom-0 w-10 h-10 bg-green-400 rounded-full
      cursor-nwse-resize transform translate-x-1/2 translate-y-1/2 md:scale-25"/>
    </div>
    <div
        @click="onDelete"
        class="absolute left-0 top-0 right-0 w-12 h-12 m-auto rounded-full bg-white
    cursor-pointer transform -translate-y-1/2 md:scale-25">
      <img class="w-full h-full" src="/delete.svg" alt="delete object"/>
    </div>
    <svg ref="svg" width="100%" height="100%">
      <path
          stroke-width="5"
          stroke-linejoin="round"
          stroke-linecap="round"
          stroke="black"
          fill="none"
          :d="path"/>
    </svg>
  </div>
</template>

<script>
import itemEventsMixin from "@/components/ItemEventsMixin";

export default {
  name: "DrawingComponent",
  mixins: [itemEventsMixin],
  props: ['originWidth', 'originHeight', 'width', 'height', 'x', 'y', 'pageScale', 'path'],
  data() {
    return {
      startX: null,
      startY: null,
      // svg: null,
      operation: "",
      dx: 0,
      dy: 0,
      dw: 0,
      direction: "",
      // ratio: this.originWidth / this.originHeight,
    }
  },
  watch: {},
  computed: {
    ratio() {
      return this.originWidth / this.originHeight
    }
  },
  mounted() {
    this.render();
  },
  created() {
  },
  methods: {
    async render() {
      this.$refs.svg.setAttribute("viewBox", `0 0 ${this.originWidth} ${this.originHeight}`);
    },
    handlePanMove(cor) {
      const _dx = (cor.detail.x - this.startX) / this.pageScale;
      const _dy = (cor.detail.y - this.startY) / this.pageScale;
      if (this.operation === "move") {
        this.dx = _dx;
        this.dy = _dy;
      } else if (this.operation === "scale") {
        if (this.direction === "left-top") {
          let d = Infinity;
          d = Math.min(_dx, _dy * this.ratio);
          this.dx = d;
          this.dw = -d;
          this.dy = d / this.ratio;
        }
        if (this.direction === "right-bottom") {
          let d = -Infinity;
          d = Math.max(_dx, _dy * this.ratio);
          this.dw = d;
        }
      }
    },

    handlePanEnd() {
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
          scale: (this.width + this.dw) / this.originWidth
        });
        this.dx = 0;
        this.dy = 0;
        this.dw = 0;
        this.direction = "";
      }
      this.operation = "";
    },
    handlePanStart(cor, event) {
      this.startX = cor.detail.x;
      this.startY = cor.detail.y;
      if (cor.detail.target === event.currentTarget) {
        return (this.operation = "move");
      }
      this.operation = "scale";
      this.direction = cor.detail.target.dataset.direction;
    },
    onDelete() {
      this.$emit("onDelete");
    }
  }
}
</script>

<style scoped>
.operation {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
