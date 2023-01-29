import { Vue } from "./vue";

const data =  {
  name: "Hello world",
  desc: "Sample",
  counter: 0,
};

const methods = {
  count() {
    data.counter += 1;
  }
};

new Vue({
  el: "#app",
  data,
  methods,
});
