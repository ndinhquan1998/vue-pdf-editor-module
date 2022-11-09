<!--<template>-->
<!--  <div-->
<!--      ref="canvasElement"-->
<!--      @mousedown="handleMousedown"-->
<!--      @mousemove="handleMousemove"-->
<!--      @mouseup="handleMouseup"-->
<!--  >-->
<!--    <svg class="relative w-full h-full pointer-events-none">-->
<!--      <path-->
<!--          stroke-width="5"-->
<!--          stroke-linejoin="round"-->
<!--          stroke-linecap="round"-->
<!--          :d="path"-->
<!--          stroke="black"-->
<!--          fill="none"/>-->
<!--    </svg>-->
<!--  </div>-->
<!--</template>-->

<script>
export default {
  name: "PannableAreaMixin",
  // props: ['path'],
  data() {
    return {
      x_mixin: null,
      y_mixin: null,
    }
  },
  mounted() {
    // this.$refs.canvasElement.addEventListener('mousedown', this.handleMousedown);
    // this.$refs.canvasElement.addEventListener('touchstart', this.handleTouchStart);
  },
  beforeDestroy() {
    // this.$refs.canvasElement.removeEventListener('mousedown', this.handleMousedown);
    // this.$refs.canvasElement.removeEventListener('touchstart', this.handleTouchStart);
  },
  created() {
  },
  methods: {
    handleMousedown(event) {
      this.x_mixin = event.clientX;
      this.y_mixin = event.clientY;
      const target = event.target;
      window.addEventListener('mousemove', this.handlePanMove, false);
      window.addEventListener('mouseup', this.handlePanEnd, false);
      return {
        detail: {x: this.x_mixin, y: this.y_mixin, target},
      }
    },

    handleMousemove(event) {
      const dx = event.clientX - this.x_mixin;
      const dy = event.clientY - this.y_mixin;
      this.x_mixin = event.clientX;
      this.y_mixin = event.clientY;

      return {
        detail: {x: this.x_mixin, y: this.y_mixin, dx, dy},
      }
    },

    handleMouseup(event) {
      this.x_mixin = event.clientX;
      this.y_mixin = event.clientY;
      window.removeEventListener('mousemove', this.handlePanMove);
      window.removeEventListener('mouseup', this.handlePanEnd);
      return {
        detail: {x: this.x_mixin, y: this.y_mixin},
      }
    },
    handleTouchStart(event) {
      if (event.touches.length > 1) return;
      const touch = event.touches[0];
      this.x_mixin = touch.clientX;
      this.y_mixin = touch.clientY;
      const target = touch.target;

      window.addEventListener('touchmove', this.handlePanMove, {passive: false});
      window.addEventListener('touchend', this.handlePanEnd);
      return {
        detail: {x: this.x_mixin, y: this.y_mixin, target},
      };
    },
    handleTouchmove(event) {
      if (event.touches.length > 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX - this.x_mixin;
      const dy = touch.clientY - this.y_mixin;
      this.x_mixin = touch.clientX;
      this.y_mixin = touch.clientY;

      return {
        detail: {x: this.x_mixin, y: this.y_mixin, dx, dy},
      }
    },
    handleTouchend(event) {
      const touch = event.changedTouches[0];
      this.x_mixin = touch.clientX;
      this.y_mixin = touch.clientY;

      window.removeEventListener('touchmove', this.handlePanMove);
      window.removeEventListener('touchend', this.handlePanEnd);
      return {
        detail: {x: this.x_mixin, y: this.y_mixin},
      };
    }
  }
}
</script>

<style scoped>

</style>
