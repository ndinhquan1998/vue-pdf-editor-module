<template>
  <div class="content"><canvas id="pdf-container" /></div>
</template>

<script>
export default {
  name: "PDFPage",
  props:['page'],
  data() {
    return{
      canvas:null,
      width:null,
      height:null,
      clientWidth:null,
    }
  },
  mounted() {
    this.render();
  },
  methods: {
    measure() {
      this.$emit("onMeasure", {
        scale: this.canvas.clientWidth / this.width});
    },
    async render() {
      const _page = await this.page;
      this.canvas = document.getElementById("pdf-container");
      const context = this.canvas.getContext("2d");
      const viewport = _page.getViewport({ scale: 1, rotation: 0 });
      this.width = viewport.width;
      this.height = viewport.height;
      await _page.render({
        canvasContext: context,
        viewport
      }).promise;
      this.measure()
      window.addEventListener("resize", this.measure);
    }
  }
}
</script>

<style scoped>

</style>
