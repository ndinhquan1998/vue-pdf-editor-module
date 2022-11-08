<template>
  <div>
    <div v-if="operation">
      <toolbar-component>
        <!--          use:tapout-->
        <div
            @tapout="onBlurTool"
            @mousedown="FocusTool"
            @touchstart="onFocusTool"
            class="h-full flex justify-center items-center bg-gray-300 border-b
      border-gray-400">
          <div class="mr-2 flex items-center">
            <img src="/line_height.svg" class="w-6 mr-2" alt="Line height"/>
            <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                class="h-6 w-12 text-center flex-shrink-0 rounded-sm"
                :value="_lineHeight"/>
          </div>
          <div class="mr-2 flex items-center">
            <img src="/text.svg" class="w-6 mr-2" alt="Font size"/>
            <input
                type="number"
                min="12"
                max="120"
                step="1"
                class="h-6 w-12 text-center flex-shrink-0 rounded-sm"
                :value="_size"/>
          </div>
          <div class="mr-2 flex items-center">
            <img src="/text-family.svg" class="w-4 mr-2" alt="Font family"/>
            <div class="relative w-32 md:w-40">
              <select
                  :value="_fontFamily"
                  @change="onChangeFont"
                  class="block appearance-none h-6 w-full bg-white pl-2 pr-8 rounded-sm leading-tight">
                <!--              {#each Families as family}-->
                <div v-for="(family,index) in Families" :key="index">
                  <option :value="family">{family}</option>
                </div>
                <!--              {/each}-->
              </select>
              <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex
            items-center px-2 text-gray-700">
                <svg
                    class="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20">
                  <path
                      d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757
                6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <div
              @click="onDelete"
              class="w-5 h-5 rounded-full bg-white cursor-pointer">
            <img class="w-full h-full" src="/delete.svg" alt="delete object"/>
          </div>
        </div>
      </toolbar-component>
    </div>
    <!--      use:tapout-->
    <div
        @tapout="onBlur"
        class="absolute left-0 top-0 select-none"
        :style="{transform: `translate(${x + dx}px, ${y + dy}px)`}"
    >
      <!--        use:pannable-->
      <div
          @panstart={handlePanStart}
          @panmove={handlePanMove}
          @panend={handlePanEnd}
          class="absolute w-full h-full cursor-grab border border-dotted
    border-gray-500"
          :class="[!operation ? 'cursor-grab':'',operation === 'move'?'cursor-grabbing':'',['edit', 'tool'].includes(operation)?'pointer-events-none border-gray-800 border-dashed':'']"
      />
      <div
          ref="editable"
          @focus="onFocus"
          @keydown="onKeydown"
          @paste|preventDefault="onPaste"
          contenteditable="true"
          spellcheck="false"
          class="outline-none whitespace-no-wrap"
          :style="{fontSize: `${_size}px`, fontFamily: `${_fontFamily}, serif`,lineHeight: `${_lineHeight}`}"
      />
    </div>
  </div>
</template>

<script>
import itemEventsMixin from "@/components/ItemEventsMixin";
import ToolbarComponent from "@/components/Toolbar";
import {Fonts} from "@/utils/prepareAssets.js";
import {timeout} from "@/utils/helper.js";

export default {
  name: "TextComponent",
  components: {ToolbarComponent},
  mixins: [itemEventsMixin],
  props: ['size', 'text', 'lineHeight', 'x', 'y', 'fontFamily', 'pageScale'],
  data() {
    return {
      Families: Object.keys(Fonts),
      startX: null,
      startY: null,
      editable: null,
      dx: 0,
      dy: 0,
      operation: "",
    }
  },
  computed: {
    _size() {
      return this.size;
    },
    _lineHeight() {
      return this.lineHeight
    },
    _fontFamily() {
      return this.fontFamily
    }
  },
  mounted() {
  },
  created() {
  },
  methods: {
    handlePanMove(event) {
      this.dx = (event.detail.x - this.startX) / this.pageScale;
      this.dy = (event.detail.y - this.startY) / this.pageScale;
    },

    handlePanEnd() {
      if (this.dx === 0 && this.dy === 0) {
        return this.editable.focus();
      }
      this.$emit("onUpdate", {
        x: this.x + this.dx,
        y: this.y + this.dy
      });
      this.dx = 0;
      this.dy = 0;
      this.operation = "";
    },
    handlePanStart(event) {
      this.startX = event.detail.x;
      this.startY = event.detail.y;
      this.operation = "move";
    },
    onFocus() {
      this.operation = "edit";
    },
    async onBlur() {
      if (this.operation !== "edit" || this.operation === "tool") return;
      this.editable.blur();
      this.sanitize();
      this.$emit("onUpdate", {
        lines: this.extractLines(),
        width: this.editable.clientWidth
      });
      this.operation = "";
    },
    async onPaste(e) {
      // get text only
      const pastedText = e.clipboardData.getData("text");
      document.execCommand("insertHTML", false, pastedText);
      // await tick() is not enough
      await timeout();
      this.sanitize();
    },
    onKeydown(e) {
      const childNodes = Array.from(this.editable.childNodes);
      if (e.keyCode === 13) {
        // prevent default adding div behavior
        e.preventDefault();
        const selection = window.getSelection();
        const focusNode = selection.focusNode;
        const focusOffset = selection.focusOffset;
        // the caret is at an empty line
        if (focusNode === this.editable) {
          this.editable.insertBefore(
              document.createElement("br"),
              childNodes[focusOffset]
          );
        } else if (focusNode instanceof HTMLBRElement) {
          this.editable.insertBefore(document.createElement("br"), focusNode);
        }
        // the caret is at a text line but not end
        else if (focusNode.textContent.length !== focusOffset) {
          document.execCommand("insertHTML", false, "<br>");
          // the carat is at the end of a text line
        } else {
          let br = focusNode.nextSibling;
          if (br) {
            this.editable.insertBefore(document.createElement("br"), br);
          } else {
            br = this.editable.appendChild(document.createElement("br"));
            br = this.editable.appendChild(document.createElement("br"));
          }
          // set selection to new line
          selection.collapse(br, 0);
        }
      }
    },
    onFocusTool() {
      this.operation = "tool";
    },
    async onBlurTool() {
      if (this.operation !== "tool" || this.operation === "edit") return;
      this.$emit("update", {
        lines: this.extractLines(),
        lineHeight: this._lineHeight,
        size: this._size,
        fontFamily: this._fontFamily
      });
      this.operation = "";
    },
    sanitize() {
      let weirdNode;
      while (
          (weirdNode = Array.from(this.editable.childNodes).find(
              node => !["#text", "BR"].includes(node.nodeName)
          ))
          ) {
        this.editable.removeChild(weirdNode);
      }
    },
    onChangeFont() {
      this.$emit("selectFont", {
        name: this._fontFamily
      });
    },
    render() {
      this.editable.innerHTML = this.text;
      this.editable.focus();
    },
    extractLines() {
      const nodes = this.editable.childNodes;
      const lines = [];
      let lineText = "";
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        if (node.nodeName === "BR") {
          lines.push(lineText);
          lineText = "";
        } else {
          lineText += node.textContent;
        }
      }
      lines.push(lineText);
      return lines;
    },
    onDelete() {
      this.$emit("onDelete");
    },
  }
}
</script>
<style scoped>

</style>
