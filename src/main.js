import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import * as echarts from 'echarts';

const app = createApp(App);
app.use(ElementPlus);
app.config.globalProperties.echarts = echarts;
app.mount('#app');
