<template>
  <div/>
</template>

<script>
export default {
  name: "PannableAreaMixin",
  props: [],
  data() {
    return {
      x: null,
      y: null,
    }
  },
  mounted() {
    console.log("-> this.$refs.canvasElement", this.$refs.canvasElement);
    this.$refs.canvasElement.addEventListener('mousedown', this.handleMousedown);
    this.$refs.canvasElement.addEventListener('touchstart', this.handleTouchStart);
  },
  destroyed() {
    this.$refs.canvasElement.removeEventListener('mousedown', this.handleMousedown);
    this.$refs.canvasElement.removeEventListener('touchstart', this.handleTouchStart);
  },
  created() {
  },
  methods: {
    handleMousedown(event) {
      this.x = event.clientX;
      this.y = event.clientY;
      const target = event.target;

      this.$emit('panstart', {
        detail: {x: this.x, y: this.y, target},
      });

      this.$refs.canvasElement.addEventListener('mousemove', this.handleMousemove);
      this.$refs.canvasElement.addEventListener('mouseup', this.handleMouseup);
    },

    handleMousemove(event) {
      const dx = event.clientX - this.x;
      const dy = event.clientY - this.y;
      this.x = event.clientX;
      this.y = event.clientY;

      this.$emit('panmove', {
            detail: {x: this.x, y: this.y, dx, dy},
          });
    },

    handleMouseup(event) {
      this.x = event.clientX;
      this.y = event.clientY;

      this.$emit('panend', {
            detail: {x: this.x, y: this.y},
          });
      this.$refs.canvasElement.removeEventListener('mousemove', this.handleMousemove);
      this.$refs.canvasElement.removeEventListener('mouseup', this.handleMouseup);
    },
    handleTouchStart(event) {
      if (event.touches.length > 1) return;
      const touch = event.touches[0];
      this.x = touch.clientX;
      this.y = touch.clientY;
      const target = touch.target;

      this.$emit('panstart', {
            detail: {x: this.x, y: this.y, target},
          });

      this.$refs.canvasElement.addEventListener('touchmove', this.handleTouchmove, {passive: false});
      this.$refs.canvasElement.addEventListener('touchend', this.handleTouchend);
    },
    handleTouchmove(event) {
      event.preventDefault();
      if (event.touches.length > 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX - this.x;
      const dy = touch.clientY - this.y;
      this.x = touch.clientX;
      this.y = touch.clientY;

      this.$emit('panmove', {
            detail: {x: this.x, y: this.y, dx, dy},
          });
    },
    handleTouchend(event) {
      const touch = event.changedTouches[0];
      this.x = touch.clientX;
      this.y = touch.clientY;

      this.$emit('panend', {
            detail: {x: this.x, y: this.y},
          });
      this.$refs.canvasElement.removeEventListener('touchmove', this.handleTouchmove);
      this.$refs.canvasElement.removeEventListener('touchend', this.handleTouchend);
    }
  }
}
</script>

<style scoped>

</style>
