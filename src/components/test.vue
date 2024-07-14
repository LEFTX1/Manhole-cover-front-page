<template>
    <div class="map-container">
      <h1>百度地图 POI 控制测试</h1>
      <div class="control-panel">
        <el-button :disabled="poiTextVisible" @click="showText">显示POI文字</el-button>
        <el-button :disabled="!poiTextVisible" @click="hideText">隐藏POI文字</el-button>
        <el-button :disabled="poiIconVisible" @click="showIcon">显示POI图标</el-button>
        <el-button :disabled="!poiIconVisible" @click="hideIcon">隐藏POI图标</el-button>
      </div>
      <baidu-map
        class="map"
        :center="center"
        :zoom="zoom"
        :scroll-wheel-zoom="true"
        @ready="onMapReady"
      >
        <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT" />
        <bm-scale anchor="BMAP_ANCHOR_BOTTOM_LEFT" />
        <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']"></bm-map-type>
      </baidu-map>
      <el-dialog
        v-model="errorDialogVisible"
        title="错误"
        width="30%"
      >
        <span>{{ errorMessage }}</span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'MapView',
    setup() {
      const center = ref({ lng: 116.404, lat: 39.915 });
      const zoom = ref(12);
      let mapInstance = null;
      const poiTextVisible = ref(true);
      const poiIconVisible = ref(true);
      const errorDialogVisible = ref(false);
      const errorMessage = ref('');
  
      const mapStyle = {
        styleJson: [
          {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": {
              "visibility": "on"
            }
          },
          {
            "featureType": "poi",
            "elementType": "labels.icon",
            "stylers": {
              "visibility": "on"
            }
          }
        ]
      };
  
      const onMapReady = ({ BMap, map }) => {
        mapInstance = map;
        map.enableScrollWheelZoom(true);
        map.setMapStyle(mapStyle);
        console.log('地图实例已初始化');
      };
  
      const showError = (message) => {
        errorMessage.value = message;
        errorDialogVisible.value = true;
      };
  
      const updateMapStyle = () => {
        if (mapInstance) {
          mapInstance.setMapStyle(mapStyle);
        }
      };
  
      const showText = () => {
        if (mapInstance) {
          mapStyle.styleJson[0].stylers.visibility = "on";
          updateMapStyle();
          poiTextVisible.value = true;
          console.log('显示POI文字');
        } else {
          showError('地图实例未初始化');
        }
      };
  
      const hideText = () => {
        if (mapInstance) {
          mapStyle.styleJson[0].stylers.visibility = "off";
          updateMapStyle();
          poiTextVisible.value = false;
          console.log('隐藏POI文字');
        } else {
          showError('地图实例未初始化');
        }
      };
  
      const showIcon = () => {
        if (mapInstance) {
          mapStyle.styleJson[1].stylers.visibility = "on";
          updateMapStyle();
          poiIconVisible.value = true;
          console.log('显示POI图标');
        } else {
          showError('地图实例未初始化');
        }
      };
  
      const hideIcon = () => {
        if (mapInstance) {
          mapStyle.styleJson[1].stylers.visibility = "off";
          updateMapStyle();
          poiIconVisible.value = false;
          console.log('隐藏POI图标');
        } else {
          showError('地图实例未初始化');
        }
      };
  
      return {
        center,
        zoom,
        showText,
        hideText,
        showIcon,
        hideIcon,
        onMapReady,
        poiTextVisible,
        poiIconVisible,
        errorDialogVisible,
        errorMessage
      };
    }
  };
  </script>
  
  <style scoped>
  .map-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  .control-panel {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 600px;
    margin-bottom: 20px;
  }
  
  .map {
    width: 100%;
    height: 600px;
    border: 1px solid #ccc;
  }
  </style>