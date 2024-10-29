const SCENE_CONFIG = {
  backgroundColor: 0x666666, // 0x201919
  antialias: true,
  fxaaPass: false,
  maxPixelRatio: 2,
  fog: {
    enabled: false,
    desktop: { near: 18, far: 24 },
    mobile: { 
      portrait: { near: 21, far: 25.5 },
      landscape: { near: 16, far: 20 },
    },
  }
};

export default SCENE_CONFIG;
