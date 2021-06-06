<template>
  <el-container>
    <el-aside style="width: 250px">
      <!-- 显卡选择 -->
      <div class="title">显卡类型</div>
      <el-select
        v-model="gpuChoose"
        placeholder="请选择显卡类型"
        @change="chooseGpu"
      >
        <el-option
          v-for="(item, gpuIndex) in gpuList"
          :key="gpuIndex"
          :label="item.name"
          :value="gpuIndex"
        >
        </el-option>
      </el-select>
      <!-- 购入价 -->
      <div class="title">购入价</div>
      <el-input-number
        v-model="gpuPrice"
        :step="100"
        :min="1"
      ></el-input-number>
      <!-- 算力 -->
      <div class="title">算力</div>
      <el-input-number v-model="gpuCpow" :step="10" :min="1"></el-input-number>
      <!-- 功耗 -->
      <div class="title">功耗(瓦)</div>
      <el-input-number v-model="gpuPow" :step="10" :min="1"></el-input-number>
      <!-- 电费 -->
      <div class="title">电费</div>
      <el-input-number
        v-model="ePrice"
        :precision="2"
        :step="0.1"
        :min="0.01"
      ></el-input-number>
      <!-- 币价 -->
      <div class="title">币价</div>
      <el-input-number
        v-model="coinPrice"
        :step="100"
        :min="1"
      ></el-input-number>
      <!-- 每100M算力日收益 -->
      <div class="title">每100M算力日收益</div>
      <el-input-number
        v-model="gpuPerPowIncome"
        :precision="5"
        :step="0.01"
        :min="0.00001"
      ></el-input-number>
      <!-- 每日递减收益（百分比） -->
      <div class="title">实验功能：每日递减收益（%）</div>
      <el-input-number
        v-model="disPer"
        :precision="2"
        :step="0.01"
        :min="0"
        :max="0.1"
      ></el-input-number>
      <div class="title">提醒：币价不变、收益不变的情况下的回本时间计算，仅供参考，实际收益会不断变动</div>
      <div class="margin-top">
        <el-button @click="calcIncome">开始计算</el-button>
      </div>
    </el-aside>
    <el-main>
      <div id="mycharts" ref="myRef" class="chart-box" />
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted } from "vue";

export default defineComponent({
  name: "echarts",
  setup() {
    const { ctx } = getCurrentInstance();

    let frontTitle = ""
    let gpuChoose = ref(0);
    let gpuPow = ref(200);
    let gpuCpow = ref(60);
    let gpuPrice = ref(8000);
    let gpuPerPowIncome = ref(0.0025);
    let ePrice = ref(0.89);
    let coinPrice = ref(17000);
    let paybackDays = ref(0);
    let disPer = ref(0);
    let gpuList = ref([
      {
        name: "3060ti",
        pow: 140,
        cpow: 60,
      },
      {
        name: "3070",
        pow: 140,
        cpow: 60,
      },
      {
        name: "3080",
        pow: 250,
        cpow: 90,
      },
      {
        name: "3090",
        pow: 300,
        cpow: 120,
      },
      {
        name: "Other",
        pow: 200,
        cpow: 60,
      },
    ]);
    let tempOption = {
      title: {
        text: "显卡回本周期",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["累计支出（包含电费）", "累计收入"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "累计支出（包含电费）",
          type: "line",
          data: [],
        },
        {
          name: "累计收入",
          type: "line",
          data: [],
        },
      ],
    };

    let myChart = null;

    const initT = () => {
      myChart = ctx.echarts.init(document.getElementById("mycharts"));
      console.log(myChart);
      myChart.setOption({
        title: {
          text: "显卡回本周期",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["累计支出（包含电费）", "累计收入"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "累计支出（包含电费）",
            type: "line",
            data: [],
          },
          {
            name: "累计收入",
            type: "line",
            data: [],
          },
        ],
      });
    };

    function chooseGpu(e) {
      gpuPow.value = gpuList.value[e].pow;
      gpuCpow.value = gpuList.value[e].cpow;
    }
    function calcIncome() {
      tempOption.series[0].data = [];
      tempOption.series[1].data = [];
      tempOption.xAxis.data = [];
      tempOption.title.text = "显卡回本周期"
      paybackDays.value = 0;
      let lastIncome = 0;
      let lastCost = 0;
      let lastDisPer = 1;
      let days = 0;
      lastCost = lastCost + gpuPrice.value;
      while (lastIncome < lastCost) {
        lastDisPer = lastDisPer * ((100 - disPer.value) / 100)
        // console.log(lastDisPer);
        lastIncome =
          lastIncome +
          (gpuCpow.value / 100) * gpuPerPowIncome.value * coinPrice.value * lastDisPer;
        // console.log(lastIncome);
        lastCost = lastCost + gpuPow.value * 24 * ePrice.value / 1000;
        // console.log(lastCost);
        days = days + 1;
        tempOption.series[0].data.push(lastCost);
        tempOption.series[1].data.push(lastIncome);
        tempOption.xAxis.data.push(days);
      }
      frontTitle = gpuPrice.value + "元" + gpuList.value[gpuChoose.value].name
      tempOption.title.text = frontTitle + tempOption.title.text + " - " + days + "天"
      // console.log(tempOption);
      myChart.setOption(tempOption)
    }

    onMounted(() => {
      initT();
    });
    return {
      gpuChoose,
      gpuPow,
      gpuCpow,
      gpuPrice,
      gpuPerPowIncome,
      ePrice,
      coinPrice,
      paybackDays,
      disPer,
      gpuList,
      chooseGpu,
      calcIncome,
    };
  },
});
</script>

<style>
body {
  margin: 0;
}
.title {
  font-size: 10px;
  color: white;
  margin-bottom: 5px;
  margin-top: 20px;
}
.el-aside {
  height: 100vh;
  padding: 20px;
  text-align: center;
  background-color: darkslategrey;
}
.el-main {
  padding: 0;
}
.margin-top {
  margin-top: 20px;
}
.chart-box {
  width: 100%;
  height: 500px;
}
</style>
