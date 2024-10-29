import * as THREE from 'three';
import { ILevelConfig } from '../../Interfaces/ILevelConfig';
import { CubeSide } from '../../Enums/CubeSide';
import GameplayConfig from '../../Configs/Main/GameplayConfig';
import { CellDirectionConfig, CubeSideAxisConfig, ObjectsRotationBySideConfig } from '../../Configs/SideConfig';
import { PlayerCharacterState } from '../../Enums/PlayerCharacterState';
import TWEEN from 'three/addons/libs/tween.module.js';
import CubeHelper from '../../Helpers/CubeHelper';
import { ICubePosition, ICubeSideAxisConfig } from '../../Interfaces/ICubeConfig';
import mitt, { Emitter } from 'mitt';
import { CellType } from '../../Enums/CellType';
import ThreeJSHelper from '../../Helpers/ThreeJSHelper';
import Loader from '../../../core/loader';
import { MoveDirection } from '../../Enums/MoveDirection';
import { Direction } from '../../Enums/Direction';
import { MoveDirectionToDirectionConfig } from '../../Configs/DirectionConfig';
import { TiltAxisConfig } from '../../Configs/PlayerCharacterConfig';
import { PlayerCharacterGeneralConfig } from '../../Configs/PlayerCharacterGeneralConfig';
import { OBB } from 'three/addons/math/OBB.js';
import Materials from '../../../core/Materials';
import { MaterialType } from '../../Enums/MaterialType';
import DebugConfig from '../../Configs/Main/DebugConfig';

type Events = {
  onMovingEnd: string;
  onDeathAnimationEnd: string;
};

export default class PlayerCharacter extends THREE.Group {
  private view: THREE.Mesh;
  private body: THREE.Mesh;
  private viewGroup: THREE.Group;
  private levelConfig: ILevelConfig;
  private activeSide: CubeSide;
  private gridPosition: THREE.Vector2 = new THREE.Vector2();
  private sidePosition: THREE.Vector2 = new THREE.Vector2();
  private state: PlayerCharacterState = PlayerCharacterState.Idle;

  private startMovingPosition: THREE.Vector2 = new THREE.Vector2();
  private targetMovingPosition: THREE.Vector2 = new THREE.Vector2();
  private targetMovingGridPosition: THREE.Vector2 = new THREE.Vector2();
  private movingElapsedTime: number = 0;
  private movingDuration: number = 0;
  private currentMoveDirection: MoveDirection;

  private idleElapsedTime: number = 0;
  private idleRotationElapsedTime: number = 0;
  private idleStartRotation: number = 0;
  private idlePositionSign: number = 1;
  private idleRotationSign: number = 1;
  private enableIdleRotationAnimation: boolean = true;

  private startTiltTween;
  private stopTiltTween

  private isActive: boolean = false;

  public emitter: Emitter<Events> = mitt<Events>();

  constructor() {
    super();

    this.initView();
    this.initBody();
    this.hide();
  }

  public update(dt: number) {
    if (this.state === PlayerCharacterState.Moving) {
      this.updateMovingState(dt);
    }

    if (this.state === PlayerCharacterState.Idle) {
      this.updateIdleState(dt);
    }

    this.updateBody();
  }

  public getBody(): THREE.Mesh {
    return this.body;
  }

  private updateBody(): void {
    this.body.userData.obb.copy(this.body.geometry.userData.obb);
    this.body.userData.obb.applyMatrix4(this.body.matrixWorld);
  }

  public init(levelConfig: ILevelConfig): void {
    this.levelConfig = levelConfig;

    this.setStartPosition();
  }

  public setActiveSide(side: CubeSide): void {
    this.activeSide = side;
  }

  public setPositionOnActiveSide(x: number, y: number): void {
    this.setPosition(this.activeSide, x, y);
  }

  public setGridPositionOnActiveSide(gridX: number, gridY: number): void {
    this.setGridPosition(this.activeSide, gridX, gridY);
  }

  public moveToGridCell(gridX: number, gridY: number): void {
    this.setState(PlayerCharacterState.Moving);
    this.disableIdleRotationAnimation();

    this.targetMovingPosition.set(gridX * GameplayConfig.grid.size, gridY * GameplayConfig.grid.size);
    this.startMovingPosition.set(this.sidePosition.x, this.sidePosition.y);
    this.targetMovingGridPosition.set(gridX, gridY);

    const distance: number = CubeHelper.calculateGridLineDistance(this.gridPosition.x, this.gridPosition.y, gridX, gridY);
    this.movingDuration = distance * (1 / PlayerCharacterGeneralConfig.movingSpeed);

    this.startTilt();
  }

  public setMovingDirection(moveDirection: MoveDirection): void {
    this.currentMoveDirection = moveDirection;
  }

  public setPosition(cubeSide: CubeSide, x: number, y: number): void {
    const newPosition: THREE.Vector3 = CubeHelper.getPositionByGridAndSide(this.levelConfig.size, cubeSide, x, y, false);

    this.position.set(newPosition.x, newPosition.y, newPosition.z);
    this.sidePosition.set(x, y);

    const gridPosition: THREE.Vector2 = CubeHelper.calculateGridPositionByCoordinates(x, y);
    this.gridPosition.set(gridPosition.x, gridPosition.y);
  }

  public setRotationBySide(cubeSide: CubeSide): void {
    const rotation: THREE.Euler = ObjectsRotationBySideConfig[cubeSide];
    this.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  public setRotationByDirection(moveDirection: MoveDirection, instant: boolean = false): void {
    this.disableIdleRotationAnimation();
    const direction: Direction = MoveDirectionToDirectionConfig[moveDirection];
    const finalRotationAngle: number = CellDirectionConfig[direction].rotation.z;

    if (instant) {
      this.viewGroup.rotation.z = finalRotationAngle;
      return;
    }

    const currentRotation: number = this.viewGroup.rotation.z;
    let deltaRotation: number = finalRotationAngle - currentRotation;

    if (deltaRotation > Math.PI) {
      deltaRotation -= 2 * Math.PI;
    } else if (deltaRotation < -Math.PI) {
      deltaRotation += 2 * Math.PI;
    }

    new TWEEN.Tween(this.viewGroup.rotation)
      .to({ z: currentRotation + deltaRotation }, PlayerCharacterGeneralConfig.rotateDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this.viewGroup.rotation.z = finalRotationAngle;
        this.idleStartRotation = finalRotationAngle;
        this.enableIdleRotationAnimation = true;
      });
  }

  public setGridPosition(cubeSide: CubeSide, gridX: number, gridY: number): void {
    const newPosition: THREE.Vector3 = CubeHelper.getPositionByGridAndSide(this.levelConfig.size, cubeSide, gridX, gridY);

    this.position.set(newPosition.x, newPosition.y, newPosition.z);
    this.gridPosition.set(gridX, gridY);
    this.sidePosition.set(gridX * GameplayConfig.grid.size, gridY * GameplayConfig.grid.size);
  }

  public updatePositionOnRealPosition(): void {
    const gridPosition: THREE.Vector2 = this.getGridPositionFromRealPosition();
    this.setGridPositionOnActiveSide(gridPosition.x, gridPosition.y);
  }

  public death(): void {
    this.setState(PlayerCharacterState.Death);
    this.isActive = false;

    this.viewGroup.position.z = 0;
    this.viewGroup.rotation.set(0, 0, 0);

    if (this.startTiltTween) {
      this.startTiltTween.stop();
    }

    if (this.stopTiltTween) {
      this.stopTiltTween.stop();
    }

    const duration: number = 800;
    this.view.castShadow = false;

    new TWEEN.Tween(this.viewGroup.rotation)
      .to({ z: Math.PI * 2 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(this.view.material)
      .to({ opacity: 0 }, duration * 0.9)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    new TWEEN.Tween(this.viewGroup.position)
      .to({ z: 2.5 }, duration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this.hide();
        (<THREE.Material>this.view.material).opacity = 1;
        this.view.castShadow = true;
        this.emitter.emit('onDeathAnimationEnd');
      });
  }

  public hideAnimation(): void {
    new TWEEN.Tween(this.scale)
      .to({ x: 0, y: 0, z: 0 }, 300)
      .easing(TWEEN.Easing.Back.In)
      .start()
      .onComplete(() => {
        this.hide();
      });
  }

  public showAnimation(): void {
    this.show();
    this.scale.set(0, 0, 0);

    new TWEEN.Tween(this.scale)
      .to({ x: 1, y: 1, z: 1 }, 300)
      .easing(TWEEN.Easing.Back.Out)
      .start()
      .onComplete(() => {
        this.isActive = true;
      });
  }

  public respawn(): void {
    this.reset();
    this.setStartPosition();
    this.show();

    this.scale.set(0, 0, 0);

    new TWEEN.Tween(this.scale)
      .to({ x: 1, y: 1, z: 1 }, 300)
      .easing(TWEEN.Easing.Back.Out)
      .start()
      .onComplete(() => {
        this.isActive = true;
      });
  }

  public stopMoving(): void {
    this.setState(PlayerCharacterState.Idle);
    this.movingElapsedTime = 0;
    this.idleElapsedTime = 0;
    this.startMovingPosition.set(0, 0);
    this.targetMovingPosition.set(0, 0);
    this.setGridPositionOnActiveSide(this.targetMovingGridPosition.x, this.targetMovingGridPosition.y);
    this.stopTilt();

    this.emitter.emit('onMovingEnd');
  }

  public reset(): void {
    this.isActive = false;
    this.setState(PlayerCharacterState.Idle);
    this.movingElapsedTime = 0;
    this.idleElapsedTime = 0;
    this.gridPosition = new THREE.Vector2();
    this.sidePosition = new THREE.Vector2();
    this.currentMoveDirection = null;
    this.disableIdleRotationAnimation();
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public setActiveState(isActive: boolean): void {
    this.isActive = isActive;
  }

  public isActivated(): boolean {
    return this.isActive;
  }

  public getState(): PlayerCharacterState {
    return this.state;
  }

  public getGridPosition(): THREE.Vector2 {
    return this.gridPosition;
  }

  public getSidePosition(): THREE.Vector2 {
    return this.sidePosition;
  }

  private updateMovingState(dt: number): void {
    this.movingElapsedTime += dt;

    const t: number = Math.min(this.movingElapsedTime / this.movingDuration, 1);
    const easeT: number = TWEEN.Easing.Sinusoidal.Out(t);

    const targetX: number = this.startMovingPosition.x + (this.targetMovingPosition.x - this.startMovingPosition.x) * easeT;
    const targetY: number = this.startMovingPosition.y + (this.targetMovingPosition.y - this.startMovingPosition.y) * easeT;

    this.setPositionOnActiveSide(targetX, targetY);
    this.resetViewZPosition();

    if (t >= 1) {
      this.stopMoving();
    }
  }

  private updateIdleState(dt: number): void {
    this.idleElapsedTime += dt;
    this.idleRotationElapsedTime += dt;
    const idleAnimation = PlayerCharacterGeneralConfig.idleAnimation;

    this.viewGroup.position.z = Math.sin(this.idleElapsedTime * idleAnimation.bounceFrequency) * idleAnimation.bounceAmplitude * this.idlePositionSign;

    if (this.enableIdleRotationAnimation) {
      this.viewGroup.rotation.z = this.idleStartRotation + Math.sin(this.idleRotationElapsedTime * idleAnimation.rotationFrequency) * idleAnimation.rotationAmplitude * this.idleRotationSign;
    }
  }

  private resetViewZPosition(): void {
    if (this.viewGroup.position.z !== 0 && Math.abs(this.view.position.z) > 0.01) {
      this.viewGroup.position.z += -this.view.position.z * 0.25;
    } else {
      this.viewGroup.position.z = 0;
    }
  }

  private setState(state: PlayerCharacterState): void {
    this.state = state;

    if (state === PlayerCharacterState.Idle) {
      this.idleStartRotation = this.viewGroup.rotation.z;
      this.idlePositionSign = Math.random() > 0.5 ? 1 : -1;
      this.idleRotationSign = Math.random() > 0.5 ? 1 : -1;
    }
  }

  private startTilt(): void {
    const tiltConfig = PlayerCharacterGeneralConfig.tilt;
    const tiltAxisConfig = TiltAxisConfig[this.currentMoveDirection];
    const angleRadians: number = tiltConfig.angle * Math.PI / 180;

    this.startTiltTween = new TWEEN.Tween(this.viewGroup.rotation)
      .to({ [tiltAxisConfig.axis]: angleRadians * tiltAxisConfig.sign }, tiltConfig.startDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  private stopTilt(): void {
    const tiltAxisConfig = TiltAxisConfig[this.currentMoveDirection];

    this.stopTiltTween = new TWEEN.Tween(this.viewGroup.rotation)
      .to({ [tiltAxisConfig.axis]: 0 }, PlayerCharacterGeneralConfig.tilt.endDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  private setStartPosition(): boolean {
    const itemPositions: ICubePosition[] = CubeHelper.getItemPositions(this.levelConfig.map.sides, CellType.Start);

    if (itemPositions.length > 0) {
      const startPosition: ICubePosition = itemPositions[0];
      this.setActiveSide(startPosition.side);
      this.setGridPositionOnActiveSide(startPosition.gridPosition.x, startPosition.gridPosition.y);
      this.setRotationBySide(this.activeSide);
      return true;
    } else {
      console.warn('Start position not found');
      return false;
    }
  }

  private getGridPositionFromRealPosition(): THREE.Vector2 {
    const cubeSideAxisConfig: ICubeSideAxisConfig = CubeSideAxisConfig[this.activeSide];

    const sideX: number = this.position[cubeSideAxisConfig.xAxis];
    const sideY: number = this.position[cubeSideAxisConfig.yAxis];

    const startOffsetX: number = (this.levelConfig.size[cubeSideAxisConfig.xAxis] - 1) * 0.5;
    const startOffsetY: number = (this.levelConfig.size[cubeSideAxisConfig.yAxis] - 1) * 0.5;

    const gridX: number = sideX / GameplayConfig.grid.size * cubeSideAxisConfig.xFactor + startOffsetX;
    const gridY: number = sideY / GameplayConfig.grid.size * cubeSideAxisConfig.yFactor + startOffsetY;

    return new THREE.Vector2(gridX, gridY);
  }

  private disableIdleRotationAnimation(): void {
    this.enableIdleRotationAnimation = false;
    this.idleRotationElapsedTime = 0;
  }

  private initView(): void {
    this.viewGroup = new THREE.Group();
    this.add(this.viewGroup);

    const geometry: THREE.BufferGeometry = ThreeJSHelper.getGeometryFromModel('ghost');
    ThreeJSHelper.setGeometryRotation(geometry, new THREE.Euler(Math.PI * 0.5, Math.PI, 0));

    const texture = Loader.assets['Ghost_BaseColor'];
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      // emissive: 0xffffff,
      // emissiveMap: texture,
      // emissiveIntensity: 1.5,
    });

    const normalMap = Loader.assets['Ghost_Normal'];
    normalMap.flipY = false;
    material.normalMap = normalMap;

    const view = this.view = new THREE.Mesh(geometry, material);
    this.viewGroup.add(view);

    view.castShadow = true;
    view.receiveShadow = true;

    const viewScale: number = PlayerCharacterGeneralConfig.scale;
    view.scale.set(GameplayConfig.grid.scale * viewScale, GameplayConfig.grid.scale * viewScale, GameplayConfig.grid.scale * viewScale);

    // const light = new THREE.PointLight(0xffffff, 5, 10, 2);
    // light.position.set(0, 0, 0.3);
    // this.viewGroup.add(light);

    // light.castShadow = true;
    // light.shadow.mapSize.width = 128;
    // light.shadow.mapSize.height = 128;
    // light.shadow.camera.near = 0.1;
    // light.shadow.camera.far = 5;

    // light.shadow.bias = -0.001;
  }

  private initBody(): void {
    const material: THREE.Material = Materials.getInstance().materials[MaterialType.DebugBody];

    const boundingBox: THREE.Box3 = new THREE.Box3().setFromObject(this.view);
    const size: THREE.Vector3 = boundingBox.getSize(new THREE.Vector3());

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    const body = this.body = new THREE.Mesh(geometry, material);
    this.viewGroup.add(body);

    body.geometry.computeBoundingBox();

    body.geometry.userData.obb = new OBB().fromBox3(body.geometry.boundingBox);
    body.userData.obb = new OBB();

    body.visible = false;

    if (DebugConfig.gameplay.physicalBody) {
      body.visible = true;
    }
  }
}
