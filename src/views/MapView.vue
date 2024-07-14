<template>
    <el-card class="map-card" shadow="hover" v-loading="loading" element-loading-text="加载中...">
      <div slot="header" class="clearfix">
        <span>地图展示</span>
      </div>
      <div class="map-controls">
        <el-select
          v-model="mapType"
          placeholder="选择地图类型"
          @change="changeMapType"
          class="map-select"
          ref="mapTypeSelect"
        >
          <el-option label="常规地图" value="BMAP_NORMAL_MAP"></el-option>
          <el-option label="卫星地图" value="BMAP_SATELLITE_MAP"></el-option>
        </el-select>
      </div>
      <div v-if="mapType === 'BMAP_NORMAL_MAP'" class="poi-controls">
        <el-button size="small" @click="togglePOIText(true)">显示POI文字</el-button>
        <el-button size="small" @click="togglePOIText(false)">隐藏POI文字</el-button>
        <el-button size="small" @click="togglePOIIcon(true)">显示POI图标</el-button>
        <el-button size="small" @click="togglePOIIcon(false)">隐藏POI图标</el-button>
      </div>
      <div v-if="mapType === 'BMAP_SATELLITE_MAP'" class="road-controls">
        <el-button size="small" @click="toggleRoadNet(true)">显示路网</el-button>
        <el-button size="small" @click="toggleRoadNet(false)">隐藏路网</el-button>
      </div>
      <div class="map-container" ref="mapContainer">
        <baidu-map
          class="map"
          :center="center"
          :zoom="zoom"
          :mapType="mapType"
          @ready="onMapReady"
          :scroll-wheel-zoom="true"
          @click="onMapClick"
        >
          <bm-navigation anchor="BMAP_ANCHOR_TOP_LEFT" :offset="navigationOffset" />
          <bm-scale anchor="BMAP_ANCHOR_BOTTOM_LEFT" :offset="scaleOffset" />
          <bm-overview-map anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :isOpen="true" />
          <bm-city-list anchor="BMAP_ANCHOR_TOP_LEFT" :offset="cityListOffset" />
  
          <bm-marker
            v-for="city in cities"
            :key="city.name"
            :position="{lng: city.lng, lat: city.lat}"
            @click="onMarkerClick(city)"
          >
            <bm-info-window :position="{lng: city.lng, lat: city.lat}">
              <div>
                <p>{{ city.name }}</p>
              </div>
            </bm-info-window>
          </bm-marker>
        </baidu-map>
        <div v-if="poiLoading" class="map-loading-overlay" v-loading="true" element-loading-text="更新中..."></div>
      </div>
    </el-card>
  </template>
  
  <script>
  import { ref, onMounted, nextTick, watch } from 'vue';
  import { cities } from '../userjs/mapjs/cities';
  import axios from 'axios';
  
  export default {
    name: 'MapView',
    setup() {
      const center = ref({ lng: 104.114129, lat: 37.550339 });
      const zoom = ref(5);
      const mapType = ref('BMAP_NORMAL_MAP');
      const covers = ref([]);
      const citiesList = cities;
      const navigationOffset = ref({ width: 0, height: 200 });
      const scaleOffset = ref({ width: 0, height: 50 });
      const cityListOffset = ref({ width: 50, height: 10 });
      let mapInstance = null;
      const loading = ref(true);
      const poiLoading = ref(false);
      const mapTypeSelect = ref(null);
      const isPOITextVisible = ref(true);
      const isPOIIconVisible = ref(true);
      const isRoadNetVisible = ref(true);
      const mapContainer = ref(null);
  
      const savedCity = localStorage.getItem('currentCity');
      if (savedCity) {
        const city = JSON.parse(savedCity);
        center.value = { lng: city.lng, lat: city.lat };
        zoom.value = 12;
      }
  
      const fetchCovers = () => {
        axios.get('/api/covers')
          .then(response => {
            covers.value = response.data;
            console.log('Covers fetched successfully:', covers.value);
          })
          .catch(error => {
            console.error('Error fetching covers:', error);
          });
      };
  
      const getMarkerIcon = (status) => {
        return status === '正常' ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      };
  
      const onMapReady = ({ BMap, map }) => {
        if (!map || typeof map.setMapType !== 'function') {
          console.error('地图实例未正确初始化');
          return;
        }
        window.baiduMapInstance = map;
        mapInstance = map;
        console.log('Map is ready:', BMap, map);
        updateMapStyle();
        loading.value = false;
        console.log('地图加载完成');
      };
  
      const onMarkerClick = (city) => {
        console.log('Marker clicked:', city);
        localStorage.setItem('currentCity', JSON.stringify(city));
        center.value = { lng: city.lng + 0.000001, lat: city.lat + 0.000001 };
        setTimeout(() => {
          center.value = { lng: city.lng, lat: city.lat };
          zoom.value = 12;
          console.log('地图中心和缩放级别已更新');
        }, 100);
      };
  
      const changeMapType = (type) => {
        console.log(`尝试切换地图类型为：${type}`);
        mapType.value = type;
        nextTick(() => {
          setTimeout(() => {
            if (mapInstance && mapInstance.setMapType) {
              try {
                mapInstance.setMapType(window[type]);
                updateMapStyle();
                // 切换到卫星地图时，隐藏 POI
                if (type === 'BMAP_SATELLITE_MAP') {
                  isPOITextVisible.value = false;
                  isPOIIconVisible.value = false;
                }
              } catch (error) {
                console.error('切换地图类型时发生错误:', error);
                reloadMap();
              }
            } else {
              console.error('地图实例未正确初始化');
              reloadMap();
            }
            if (mapTypeSelect.value) {
              mapTypeSelect.value.blur();
            }
          }, 100);
        });
      };
  
      const onMapClick = ({ point }) => {
        console.log('Map clicked at:', point);
      };
  
      const updateMapStyle = () => {
        if (!mapInstance) return;
  
        try {
          const style = {
            styleJson: [
              {
                "featureType": "poi",
                "elementType": "labels.text",
                "stylers": {
                  "visibility": isPOITextVisible.value && mapType.value === 'BMAP_NORMAL_MAP' ? "on" : "off"
                }
              },
              {
                "featureType": "poi",
                "elementType": "labels.icon",
                "stylers": {
                  "visibility": isPOIIconVisible.value && mapType.value === 'BMAP_NORMAL_MAP' ? "on" : "off"
                }
              },
              {
                "featureType": "road",
                "elementType": "all",
                "stylers": {
                  "visibility": "on"
                }
              },
              {
                "featureType": "water",
                "elementType": "labels",
                "stylers": {
                  "visibility": "on"
                }
              }
            ]
          };
  
          mapInstance.setMapStyleV2(style);
  
          if (mapType.value === 'BMAP_SATELLITE_MAP') {
            mapInstance.setMapType(isRoadNetVisible.value ? window.BMAP_HYBRID_MAP : window.BMAP_SATELLITE_MAP);
          }
        } catch (error) {
          console.error('更新地图样式时发生错误:', error);
        }
      };
  
      const togglePOIText = (show) => {
        console.log(`尝试${show ? '显示' : '隐藏'} POI文字`);
        poiLoading.value = true;
        isPOITextVisible.value = show;
        updateMapStyle();
        setTimeout(() => {
          poiLoading.value = false;
          console.log('POI文字更新完成');
        }, 500);
      };
  
      const togglePOIIcon = (show) => {
        console.log(`尝试${show ? '显示' : '隐藏'} POI图标`);
        poiLoading.value = true;
        isPOIIconVisible.value = show;
        updateMapStyle();
        setTimeout(() => {
          poiLoading.value = false;
          console.log('POI图标更新完成');
        }, 500);
      };
  
      const toggleRoadNet = (show) => {
        console.log(`尝试${show ? '显示' : '隐藏'}路网`);
        isRoadNetVisible.value = show;
        if (mapType.value === 'BMAP_SATELLITE_MAP') {
          mapInstance.setMapType(show ? window.BMAP_HYBRID_MAP : window.BMAP_SATELLITE_MAP);
        }
      };
  
      const reloadMap = () => {
        if (mapInstance) {
          mapInstance.destroy();
        }
        nextTick(() => {
          if (window.BMap && mapContainer.value) {
            const map = new window.BMap.Map(mapContainer.value);
            map.centerAndZoom(new window.BMap.Point(center.value.lng, center.value.lat), zoom.value);
            mapInstance = map;
            updateMapStyle();
          } else {
            console.error('无法重新加载地图，BMap 或 mapContainer 不可用');
          }
        });
      };
  
      watch(mapType, () => {
        if (mapInstance) {
          updateMapStyle();
        }
      });
  
      onMounted(() => {
        console.log('组件已挂载');
        fetchCovers();
      });
  
      return {
        center,
        zoom,
        mapType,
        covers,
        cities: citiesList,
        getMarkerIcon,
        onMapReady,
        onMarkerClick,
        changeMapType,
        onMapClick,
        navigationOffset,
        scaleOffset,
        cityListOffset,
        togglePOIText,
        togglePOIIcon,
        toggleRoadNet,
        loading,
        poiLoading,
        mapTypeSelect,
        mapContainer,
      };
    }
  };
  </script>
  
  <style>
  .map-card {
    margin: 20px;
    position: relative;
  }
  
  .map-container {
    position: relative;
    width: 100%;
    height: 500px;
  }
  
  .map {
    width: 100%;
    height: 100%;
  }
  
  .map-loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .map-controls, .poi-controls, .road-controls {
    margin-bottom: 10px;
  }
  
  .map-select {
    width: 120px;
  }
  
  .poi-controls, .road-controls {
    display: flex;
    justify-content: space-between;
  }
  
  .poi-controls .el-button, .road-controls .el-button {
    flex: 1;
    margin: 0 5px;
  }
  </style>