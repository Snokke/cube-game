import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import MainScene from '../main-scene';
import SCENE_CONFIG from './configs/scene-config';
import Loader from './loader';
import Scene3DDebugMenu from './helpers/gui-helper/scene-3d-debug-menu';
import LoadingOverlay from './loading-overlay';

export default class BaseScene {
  private scene: any;
  private renderer: any;
  private camera: any;
  private loadingOverlay: any;
  private mainScene: any;
  private scene3DDebugMenu: any;
  private orbitControls: any;
  private pixiApp: any;

  private windowSizes: any;
  private isAssetsLoaded: boolean;

  constructor() {
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.loadingOverlay = null;
    this.mainScene = null;
    this.scene3DDebugMenu = null;
    this.orbitControls = null;
    this.pixiApp = null;

    this.windowSizes = {};
    this.isAssetsLoaded = false;

    this._init();
  }

  createGameScene() {
    const data = {
      scene: this.scene,
      camera: this.camera,
      pixiApp: this.pixiApp,
    };

    this.mainScene = new MainScene(data);

    this._initMainSceneSignals();
  }

  afterAssetsLoaded() {
    this.isAssetsLoaded = true;

    this.loadingOverlay.hide();
    this.scene3DDebugMenu.showAfterAssetsLoad();
    this.mainScene.afterAssetsLoad();
    this._setupBackgroundColor();
  }

  _initMainSceneSignals() {
    // this._mainScene.events.on('fpsMeterChanged', () => this._scene3DDebugMenu.onFpsMeterClick());
  }

  async _init() {
    await this._initPixiJS();
    this._initThreeJS();
    this._initUpdate();
  }

  async _initPixiJS() {
    const canvas = document.querySelector('.pixi-canvas') as HTMLCanvasElement;
    const pixiApp = this.pixiApp = new PIXI.Application();
    
    await pixiApp.init({
      canvas: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      backgroundAlpha: 0,
    });

    PIXI.Ticker.shared.autoStart = false;
    PIXI.Ticker.shared.stop();
  }

  _initThreeJS() {
    this._initLoader();
    this._initScene();
    this._initRenderer();
    this._initCamera();
    this._initLights();
    this._initLoadingOverlay();
    this.initAxesHelper();
    this._initOnResize();

    this._initScene3DDebugMenu();
  }

  _initLoader() {
    new Loader();
  }

  _initScene() {
    this.scene = new THREE.Scene();
  }

  _initRenderer() {
    this.windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const canvas = document.querySelector('.threejs-canvas');

    const renderer = this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: SCENE_CONFIG.antialias,
    });

    renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio));
  }

  _initCamera() {
    const camera = this.camera = new THREE.PerspectiveCamera(50, this.windowSizes.width / this.windowSizes.height, 0.5, 70);
    this.scene.add(camera);

    camera.position.set(0, 0, 15);
  }

  _initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 5, 5);
    this.scene.add(directionalLight);
  }

  _initLoadingOverlay() {
    const loadingOverlay = this.loadingOverlay = new LoadingOverlay();
    this.scene.add(loadingOverlay);
  }

  initAxesHelper() {
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  _initOnResize() {
    window.addEventListener('resize', () => this._onResize());
  }

  _onResize() {
    this.windowSizes.width = window.innerWidth;
    this.windowSizes.height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);

    this.camera.aspect = this.windowSizes.width / this.windowSizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    this.renderer.setPixelRatio(pixelRatio);

    if (this.mainScene) {
      this.mainScene.onResize();
    }
  }

  _setupBackgroundColor() {
    this.scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
  }

  _initScene3DDebugMenu() {
    this.scene3DDebugMenu = new Scene3DDebugMenu(this.scene, this.camera, this.renderer, this.pixiApp);
    this.orbitControls = this.scene3DDebugMenu.getOrbitControls();
  }

  _initUpdate() {
    const clock = new THREE.Clock(true);

    const update = () => {
      this.scene3DDebugMenu.preUpdate();

      const deltaTime = clock.getDelta();

      if (this.isAssetsLoaded) {
        TWEEN.update();
        this.scene3DDebugMenu.update();

        if (this.mainScene) {
          this.mainScene.update(deltaTime);
        }

        PIXI.Ticker.shared.update(performance.now());
        this.renderer.render(this.scene, this.camera);
      }

      this.scene3DDebugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
