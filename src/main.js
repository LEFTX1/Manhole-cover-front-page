import { createApp } from 'vue';
import App from './App.vue';
import BaiduMap from 'vue-baidu-map-3x';
import axios from 'axios';
import router from './router';
import { createPinia } from 'pinia';



const app = createApp(App);
const pinia = createPinia();

app.config.globalProperties.$axios = axios;

app.use(router);
app.use(pinia);
app.use(BaiduMap, {
  ak: 's8uv7rdDC1uLWRWj7IEtlsk4N6v8gU0s'  // 替换为你的百度地图API密钥
});



app.mount('#app');