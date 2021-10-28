import Vue from 'vue'
import CodeInput from './code'

new Vue({
  el: '#app',
  components: {
    CodeInput
  },
  template: `
  <div>
    <h1>hello OTP code input</h1>
    <p>Input boxes for OTP codes</p>
    <code-input></code-input>
  </div>
  `
})
