import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: "#009688",
        secondary: "#009688",
        accent: "#009688",
        error: "#b71c1c",
        info: "#009688",
        success: "#009688",
        warning: "#009688",
      },
    },
  },
  icons: {
    iconfont: "mdi",
  },
});
