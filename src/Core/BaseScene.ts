import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import MainScene from '../Scene/MainScene';
import SceneConfig from '../Data/Configs/Scene/SceneConfig';
import Loader from './Loader/AssetsLoader';
import LoadingOverlay from './Loader/LoadingOverlay';
import { LightConfig } from '../Data/Configs/Scene/LightConfig';
import AudioController from '../Scene/GameScene/AudioController';
import CameraConfig from '../Data/Configs/Scene/CameraConfig';
import { DeviceState } from '../Data/Enums/DeviceState';
import ShadowConfig from '../Data/Configs/Scene/ShadowConfig';
import FogConfig from '../Data/Configs/Scene/FogConfig';
import { ILibrariesData, IWindowSizes } from '../Data/Interfaces/IBaseSceneData';
import DebugMenu from './DebugMenu/DebugMenu';

export default class BaseScene {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private loadingOverlay: LoadingOverlay;
  private mainScene: MainScene;
  private debugMenu: DebugMenu;
  private pixiApp: PIXI.Application;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

  private windowSizes: IWindowSizes;
  private isAssetsLoaded: boolean = false;

  constructor() {
    this.init();
  }

  public createGameScene(): void {
    const librariesData: ILibrariesData = {
      scene: this.scene,
      camera: this.camera,
      ambientLight: this.ambientLight,
      directionalLight: this.directionalLight,
      pixiApp: this.pixiApp,
    };

    this.mainScene = new MainScene(librariesData);
  }

  public afterAssetsLoaded(): void {
    this.isAssetsLoaded = true;

    this.initAudioAssets();
    this.loadingOverlay.hide();
    this.debugMenu.showAfterAssetsLoad();
    this.mainScene.afterAssetsLoad();
    this.setupBackgroundColor();
  }

  private initAudioAssets(): void {
    const audioController: AudioController = AudioController.getInstance();
    audioController.initSounds(['death', 'swoosh']);
    audioController.initCoinsSound();
    audioController.initMusic('music');
  }

  private async init(): Promise<void> {
    await this.initPixiJS();
    this.initThreeJS();
    this.initUpdate();
  }

  private async initPixiJS(): Promise<void> {
    const canvas = document.querySelector('.pixi-canvas') as HTMLCanvasElement;
    const pixiApp = this.pixiApp = new PIXI.Application();

    await pixiApp.init({
      canvas: canvas,
      autoDensity: true,
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      backgroundAlpha: 0,
    });

    PIXI.Ticker.shared.autoStart = false;
    PIXI.Ticker.shared.stop();
  }

  private initThreeJS(): void {
    this.initLoader();
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.initFog();
    this.initLoadingOverlay();
    this.initAudioController();
    this.initOnResize();

    this.initDebugMenu();
  }

  private initLoader(): void {
    new Loader();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
  }

  private initRenderer(): void {
    this.windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const canvas: Element = document.querySelector('.threejs-canvas');

    const renderer = this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: SceneConfig.antialias,
    });

    renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SceneConfig.maxPixelRatio));

    renderer.shadowMap.enabled = ShadowConfig.enabled;
    renderer.shadowMap.type = ShadowConfig.type;
  }

  private initCamera(): void {
    const settings = CameraConfig.settings;
    const camera = this.camera = new THREE.PerspectiveCamera(settings.fov, this.windowSizes.width / this.windowSizes.height, settings.near, settings.far);
    this.scene.add(camera);
  }

  private initLights(): void {
    const ambientLightConfig = LightConfig.ambientLight;
    const ambientLight = this.ambientLight = new THREE.AmbientLight(ambientLightConfig.color, ambientLightConfig.intensity);
    this.scene.add(ambientLight);

    const directionalLightConfig = LightConfig.directionalLight;
    const directionalLight = this.directionalLight = new THREE.DirectionalLight(directionalLightConfig.color, directionalLightConfig.intensity);
    this.scene.add(directionalLight);
  }

  private initFog(): void {
    if (FogConfig.enabled) {
      const near: number = FogConfig[DeviceState.Desktop].near;
      const far: number = FogConfig[DeviceState.Desktop].far;

      this.scene.fog = new THREE.Fog(SceneConfig.backgroundColor, near, far);
    }
  }

  private initLoadingOverlay(): void {
    const loadingOverlay = this.loadingOverlay = new LoadingOverlay();
    this.scene.add(loadingOverlay);
  }

  private initAudioController(): void {
    const audioController = AudioController.getInstance();
    audioController.initListener(this.camera);
  }

  private initOnResize(): void {
    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    this.windowSizes.width = window.innerWidth;
    this.windowSizes.height = window.innerHeight;
    const pixelRatio: number = Math.min(window.devicePixelRatio, SceneConfig.maxPixelRatio);

    this.camera.aspect = this.windowSizes.width / this.windowSizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.windowSizes.width, this.windowSizes.height);
    this.renderer.setPixelRatio(pixelRatio);

    if (this.mainScene) {
      this.mainScene.onResize();
    }
  }

  private setupBackgroundColor(): void {
    this.scene.background = new THREE.Color(SceneConfig.backgroundColor);
  }

  private initDebugMenu(): void {
    this.debugMenu = new DebugMenu(this.camera, this.renderer, this.pixiApp);
  }

  private initUpdate(): void {
    const clock = new THREE.Clock(true);

    const update = () => {
      this.debugMenu.preUpdate();

      const deltaTime = clock.getDelta();

      if (this.isAssetsLoaded) {
        TWEEN.update();
        this.debugMenu.update();

        if (this.mainScene) {
          this.mainScene.update(deltaTime);
        }

        PIXI.Ticker.shared.update(performance.now());
        this.renderer.render(this.scene, this.camera);
      }

      this.debugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}