

const CODE_LENGTH = 6;
const modernBrowser = true; // removed detection dependenncy

export default {
  name: "CodeInput",
  template: `

  <div
    ref="wrap"
    :class="modernBrowser ? 'justify-space' : 'justify-center'"
    class="input-wrap"
  >
    <template v-if="modernBrowser">
      <template v-for="(char, index) in valueParts">
        <input
          :key="index"
          :autofocus="index === 0"
          v-bind="\$attrs"
          v-on="listeners"
          v-model="valueParts[index]"
          @keydown="handleEnterKey(\$event); handleKeyDown(\$event, index)"
          @input="handleInput(\$event, index)"
          @paste="onPaste"
          type="text"
          onkeypress="if(this.value.length===1) return false;"
          class="box"
          size="lg"
          maxlength="1"
        />
        <span
          v-if="index === delimiter"
          :key="index + '_span'"
        >-</span>
      </template>
    </template>
    <input
      v-else
      @keydown="handleEnterKey(\$event)"
      v-bind="\$attrs"
      :value="value"
      v-on="listeners"
      type="text"
      :maxlength="CODE_LENGTH"
      :onkeypress="'if(this.value.length===' + CODE_LENGTH + ') return false;'"
      class="fallback"
      size="lg"
    />
  </div>
  
  `,
  inheritAttrs: modernBrowser,
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      modernBrowser,
      CODE_LENGTH,
      valueParts: _fill([], "", CODE_LENGTH),
      delimiter: CODE_LENGTH / 2 - 1,
      protect: false, // multipress protection
    };
  },
  computed: {
    listeners() {
      return {
        ...this.$listeners,
      };
    },
  },
  watch: {
    valueParts() {
        this.emitInput();
    },
  },
  mounted() {
    if (this.$el.attributes.autofocus) {
      this.focus(0);
    }
  },
  methods: {
    focus(index) {
      if (index > this.delimiter) {
        index++;
      }
      const inp = this.$refs.wrap.children[index];
      if (inp) {
        inp.focus();
      }
    },
    handleEnterKey(event) {
      // handle Enter key submit since "onKeyPress="if(this.value.length" prevents thisdefault action
      if (event.key === 'Enter') {
        this.$emit('enter');
        event.stopPropagation();
      }
    },
    handleKeyDown(event, index) {
      // handle "Unindentified" as undefined
      const key = _sanitizeEventKey(event.key);
      if (!key) {
        return;
      } else if (key === "Backspace") {
        if (this.valueParts[index]) {
          return (this.valueParts[index] = "");
        }
        this.focus(index - 1);
      } else if (
        !event.shiftKey &&
        (key === "ArrowRight" || key === "Right")
      ) {
        this.focus(index + 1);
      } else if (
        !event.shiftKey &&
        (key === "ArrowLeft" || key === "Left")
      ) {
        this.focus(index - 1);
      } else if (key.length === 1 && this.valueParts[index]) {
        this.valueParts[index] = key;
        this.$forceUpdate();
        this.focus(index + 1);
        this.emitInput();
      }
    },
    handleInput(event, index) {
      const value = this.valueParts[index];

      if (value) {
        if (value.length > 1) {
          this.valueParts[index] = value[value.length -1];
        }
        this.focus(index + 1);
      }

      this.emitInput();
    },
    onPaste(event) {
      const clipboardData =
        event.clipboardData || window.clipboardData;
      if (!clipboardData) {
        return;
      }
      // IE fix
      event.preventDefault();
      const code =
        clipboardData.getData("Text") || clipboardData.getData("text/plain");
      this.fillCode(code);
    },
    fillCode(code) {
      code = code.trim();
      code = code.slice(0, CODE_LENGTH);
      const parts = code.split("");
      parts.length = CODE_LENGTH;
      this.valueParts = parts;

      const last = code.length - 1;
      setTimeout(() => {
        // cut out extra chars from last input
        this.valueParts[last] =
          this.valueParts[last] && this.valueParts[last].slice(0, 1); // apply just first char
        this.$forceUpdate();
        this.focus(last);
      }, 0);
    },
    emitInput() {
      const result = this.valueParts.join("").slice(0, CODE_LENGTH);
      this.$emit("input", result);
    },
  },
};

function _fill(arr, val, l) {
  arr.length = l;
  arr.fill(val, 0, l);
  return arr;
}

function _sanitizeEventKey(key) {
  return key === "Unidentified" ? undefined : key;
}