<template>
  <div
      ref="canvasElement">
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
</template>

<script>
export default {
  name: "PannableAreaMixin",
  props: ['path'],
  data() {
    return {
      x_mixin: null,
      y_mixin: null,
    }
  },
  mounted() {
    this.$refs.canvasElement.addEventListener('mousedown', this.handleMousedown);
    this.$refs.canvasElement.addEventListener('touchstart', this.handleTouchStart);
  },
  beforeDestroy() {
    this.$refs.canvasElement.removeEventListener('mousedown', this.handleMousedown);
    this.$refs.canvasElement.removeEventListener('touchstart', this.handleTouchStart);
  },
  created() {
  },
  methods: {
    handleMousedown(event) {
      this.x_mixin = event.clientX;
      this.y_mixin = event.clientY;
      const target = event.target;

      this.$emit('panstart', {
        detail: {x: this.x_mixin, y: this.y_mixin, target},
      });

      this.$refs.canvasElement.addEventListener('mousemove', this.handleMousemove);
      this.$refs.canvasElement.addEventListener('mouseup', this.handleMouseup);
    },

    handleMousemove(event) {
      const dx = event.clientX - this.x_mixin;
      const dy = event.clientY - this.y_mixin;
      this.x_mixin = event.clientX;
      this.y_mixin = event.clientY;

      this.$emit('panmove', {
        detail: {x: this.x_mixin, y: this.y_mixin, dx, dy},
      });
    },

    handleMouseup(event) {
      this.x_mixin = event.clientX;
      this.y_mixin = event.clientY;

      this.$emit('panend', {
        detail: {x: this.x_mixin, y: this.y_mixin},
      });
      this.$refs.canvasElement.removeEventListener('mousemove', this.handleMousemove);
      this.$refs.canvasElement.removeEventListener('mouseup', this.handleMouseup);
    },
    handleTouchStart(event) {
      if (event.touches.length > 1) return;
      const touch = event.touches[0];
      this.x_mixin = touch.clientX;
      this.y_mixin = touch.clientY;
      const target = touch.target;

      this.$emit('panstart', {
        detail: {x: this.x_mixin, y: this.y_mixin, target},
      });

      this.$refs.canvasElement.addEventListener('touchmove', this.handleTouchmove, {passive: false});
      this.$refs.canvasElement.addEventListener('touchend', this.handleTouchend);
    },
    handleTouchmove(event) {
      event.preventDefault();
      if (event.touches.length > 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX - this.x_mixin;
      const dy = touch.clientY - this.y_mixin;
      this.x_mixin = touch.clientX;
      this.y_mixin = touch.clientY;

      this.$emit('panmove', {
        detail: {x: this.x_mixin, y: this.y_mixin, dx, dy},
      });
    },
    handleTouchend(event) {
      const touch = event.changedTouches[0];
      this.x_mixin = touch.clientX;
      this.y_mixin = touch.clientY;

      this.$emit('panend', {
        detail: {x: this.x_mixin, y: this.y_mixin},
      });
      this.$refs.canvasElement.removeEventListener('touchmove', this.handleTouchmove);
      this.$refs.canvasElement.removeEventListener('touchend', this.handleTouchend);
    }
  }
}
</script>

<style scoped>

</style>
