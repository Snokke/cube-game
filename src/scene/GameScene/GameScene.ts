import * as THREE from 'three';
import Cube from './Cube/Cube';
import { LevelsConfig, LevelsQueue } from '../Configs/LevelsConfig';
import { ILevelConfig } from '../Interfaces/ILevelConfig';
import PlayerCharacter from './PlayerCharacter/PlayerCharacter';
import { RotateDirection, TurnDirection } from '../Enums/RotateDirection';
import { KeyboardController } from './KeyboardController';
import { ButtonType } from '../Enums/ButtonType';
import { MoveDirection } from '../Enums/MoveDirection';
import { CubeSide } from '../Enums/CubeSide';
import { CubeRotationDirection } from '../Enums/CubeRotationDirection';
import { MovementDirectionByButtonConfig, MovementDirectionByCubeRotationConfig, MovementDirectionConfig } from '../Configs/PlayerCharacterConfig';
import { CubeState } from '../Enums/CubeState';
import { PlayerCharacterState } from '../Enums/PlayerCharacterState';
import CubeHelper from '../Helpers/CubeHelper';
import { LevelType } from '../Enums/LevelType';
import { ICubeSideAxisConfig } from '../Interfaces/ICubeConfig';
import { CubeSideAxisConfig } from '../Configs/SideConfig';
import { CellType } from '../Enums/CellType';
import EndLevelObject from './EndLevelObject/EndLevelObject';
import MapController from './MapController';
import { CameraController } from './CameraController';
import EnemiesController from './Enemies/EnemiesController';
import { CellsWithBody } from '../Configs/Cells/CellsConfig';
import { IWallSpikeConfig } from '../Interfaces/IEnemyConfig';

export default class GameScene extends THREE.Group {
  private cube: Cube;
  private playerCharacter: PlayerCharacter;
  private endGameObject: EndLevelObject;
  private keyboardController: KeyboardController;
  private mapController: MapController;
  private cameraController: CameraController;
  private enemiesController: EnemiesController;

  private camera: THREE.PerspectiveCamera;

  private levelConfig: ILevelConfig;
  private levelIndex: number = 0;
  private nextCubeRotationDirection: RotateDirection = null;
  private currentMoveDirection: MoveDirection = null;
  private waitingForCubeRotation: boolean = false;
  private waitingForEndLevel: boolean = false;
  private nextMoveDirection: MoveDirection = null;
  private wallSpikeOnTargetPosition: string = '';

  constructor(camera: THREE.PerspectiveCamera) {
    super();

    this.camera = camera;

    this.init();
  }

  public update(dt: number): void {
    this.cube.update(dt);
    this.playerCharacter.update(dt);
    this.cameraController.update(dt);
  }

  public startGame(): void {
    const currentLevelType: LevelType = LevelsQueue[this.levelIndex];
    this.startLevel(currentLevelType);
  }

  public startLevel(levelType: LevelType): void {
    const levelConfig: ILevelConfig = this.levelConfig = LevelsConfig[levelType];

    this.mapController.init(levelConfig);
    this.cube.init(levelConfig);
    this.playerCharacter.init(levelConfig);
    this.endGameObject.init(levelConfig);
    this.enemiesController.init(levelConfig);
  }

  public rotateCube(rotateDirection: RotateDirection): void {
    this.cube.rotateToDirection(rotateDirection);
  }

  public turnCube(turnDirection: TurnDirection): void {
    this.cube.turn(turnDirection);
  }

  private moveCharacter(moveDirection: MoveDirection): void {
    this.currentMoveDirection = moveDirection;
    const currentRotationDirection: CubeRotationDirection = this.cube.getCurrentRotationDirection();
    const movingDirection: MoveDirection = MovementDirectionByCubeRotationConfig[moveDirection][currentRotationDirection].direction;
    const playerCharacterGridPosition: THREE.Vector2 = this.playerCharacter.getGridPosition();
    const activeAxis: string = MovementDirectionConfig[movingDirection].activeAxis;
    const sign: number = MovementDirectionConfig[movingDirection].vector[activeAxis];
    const startPoint: number = playerCharacterGridPosition[activeAxis];

    const cubeSide: CubeSide = this.cube.getCurrentSide();
    const cubeSideAxisConfig: ICubeSideAxisConfig = CubeSideAxisConfig[cubeSide];
    const gridSize: number = activeAxis === 'x' ? this.levelConfig.size[cubeSideAxisConfig.xAxis] : this.levelConfig.size[cubeSideAxisConfig.yAxis];

    if (this.checkOnEdgeMovingBack(startPoint, sign, gridSize)) {
      this.waitingForCubeRotation = true;
      this.nextCubeRotationDirection = MovementDirectionByCubeRotationConfig[movingDirection][currentRotationDirection].cubeRotationDirection;
      this.rotateCube(this.nextCubeRotationDirection);

      return;
    }

    const targetGridPosition: THREE.Vector2 = this.getMovingTargetGridPosition(startPoint, sign, gridSize, movingDirection);

    if (!CubeHelper.isGridCellsEqual(playerCharacterGridPosition, targetGridPosition)) {
      this.playerCharacter.setMovingDirection(movingDirection);
      this.playerCharacter.moveToGridCell(targetGridPosition.x, targetGridPosition.y);

      if (this.isCellOnEdge(targetGridPosition.x, targetGridPosition.y)) {
        this.waitingForCubeRotation = true;
        this.nextCubeRotationDirection = MovementDirectionByCubeRotationConfig[movingDirection][currentRotationDirection].cubeRotationDirection;
      }
    }

    this.playerCharacter.setRotationByDirection(movingDirection);
  }

  private checkOnEdgeMovingBack(startPoint: number, sign: number, gridSize: number): boolean {
    const playerCharacterGridPosition: THREE.Vector2 = this.playerCharacter.getGridPosition();

    if (this.isCellOnEdge(playerCharacterGridPosition.x, playerCharacterGridPosition.y)) {
      for (let i = startPoint + sign; i >= startPoint - 1 && i < startPoint + sign + 1; i += sign) {
        if (i === -2 || i === gridSize + 1) {
          return true;
        }
      }
    }

    return false;
  }

  private getMovingTargetGridPosition(startPoint: number, sign: number, gridSize: number, newMovingDirection: MoveDirection): THREE.Vector2 {
    const playerCharacterGridPosition: THREE.Vector2 = this.playerCharacter.getGridPosition();
    const targetGridPosition: THREE.Vector2 = new THREE.Vector2(playerCharacterGridPosition.x, playerCharacterGridPosition.y);
    const nextCellPosition: THREE.Vector2 = new THREE.Vector2();

    const activeAxis: string = MovementDirectionConfig[newMovingDirection].activeAxis;
    const inactiveAxis: string = activeAxis === 'x' ? 'y' : 'x';
    const cubeSide: CubeSide = this.cube.getCurrentSide();

    for (let i = startPoint + sign; i >= -1 && i < gridSize + 1; i += sign) {
      nextCellPosition[activeAxis] = i;
      nextCellPosition[inactiveAxis] = playerCharacterGridPosition[inactiveAxis];
      const nextCellSymbol: string = this.mapController.getCellSymbol(cubeSide, nextCellPosition.x + 1, nextCellPosition.y + 1);
      const nextCellType: CellType = CubeHelper.getCellTypeBySymbol(nextCellSymbol);

      switch (nextCellType) {
        case CellType.Finish:
          targetGridPosition[activeAxis] = i;
          this.waitingForEndLevel = true;
          break;

        case CellType.WallSpike:
          this.wallSpikeOnTargetPosition = nextCellSymbol;
          break;

        case CellType.Empty:
          targetGridPosition[activeAxis] = i;
          continue;
      }

      if (CellsWithBody.includes(nextCellType)) {
        break;
      }
    }

    return targetGridPosition;
  }

  private isCellOnEdge(cellX: number, cellY: number): boolean {
    const cubeSide: CubeSide = this.cube.getCurrentSide();
    const mapSize: THREE.Vector2 = this.mapController.getMapSize(cubeSide);

    return cellX === -1 || cellY === -1 || cellX === mapSize.x - 2 || cellY === mapSize.y - 2;
  }

  private init(): void {
    this.initMapController();
    
    this.initCube();
    this.initPlayerCharacter();
    this.initEndLevelObject();
    this.initEnemiesController();
    
    this.initKeyboardController();
    this.initCameraController();

    this.initSignals();
  }

  private initCube(): void {
    const cube = this.cube = new Cube();
    this.add(cube);
  }

  private initPlayerCharacter(): void {
    const playerCharacter = this.playerCharacter = new PlayerCharacter();
    this.cube.add(playerCharacter);
  }

  private initEndLevelObject(): void {
    const endGameObject = this.endGameObject = new EndLevelObject();
    this.cube.add(endGameObject);
  }

  private initMapController(): void {
    this.mapController = new MapController();
  }

  private initEnemiesController(): void {
    const enemiesController = this.enemiesController = new EnemiesController();
    this.cube.add(enemiesController);
  }

  private initCameraController(): void {
    this.cameraController = new CameraController(this.camera);
    this.cameraController.setPlayerCharacter(this.playerCharacter);
    this.cameraController.setCube(this.cube);
  }

  private initKeyboardController(): void {
    this.keyboardController = new KeyboardController();

    this.keyboardController.emitter.on('onButtonPress', (buttonType: ButtonType) => {
      this.onButtonPress(buttonType);
    });
  }

  private onButtonPress(buttonType: ButtonType): void {
    if (!this.playerCharacter.isActivated()) {
      return;
    }

    const moveDirection: MoveDirection = MovementDirectionByButtonConfig[buttonType];

    if ((this.cube.getState() === CubeState.Rotating || this.playerCharacter.getState() === PlayerCharacterState.Moving) && this.nextMoveDirection === null) {
      this.nextMoveDirection = moveDirection;
    }

    if (this.cube.getState() === CubeState.Idle && this.playerCharacter.getState() === PlayerCharacterState.Idle) {
      this.moveCharacter(moveDirection);
    }
  }

  private initSignals(): void {
    this.playerCharacter.emitter.on('onMovingEnd', () => this.onPlayerCharacterMovingEnd());
    this.playerCharacter.emitter.on('onDeathAnimationEnd', () => this.resetLevelOnDeath());
    this.cube.emitter.on('endRotating', () => this.onCubeRotatingEnd());
    this.cube.emitter.on('endRotatingOnRespawn', () => this.respawnPlayerCharacter());
  }

  private onPlayerCharacterMovingEnd(): void {
    if (this.waitingForEndLevel) {
      this.waitingForEndLevel = false;
      this.onLevelEnd();
      return;
    }

    if (this.wallSpikeOnTargetPosition) {
      const wallSpikeConfig: IWallSpikeConfig = CubeHelper.getEnemyConfigBySymbol(this.levelConfig, this.wallSpikeOnTargetPosition) as unknown as IWallSpikeConfig;
      const dangerCells: THREE.Vector2[] = CubeHelper.getDangerCellsForWallSpike(wallSpikeConfig);
      const playerCharacterGridPosition: THREE.Vector2 = this.playerCharacter.getGridPosition();
      this.wallSpikeOnTargetPosition = '';

      if (dangerCells.some((dangerCell: THREE.Vector2) => CubeHelper.isGridCellsEqual(dangerCell, playerCharacterGridPosition))) {
        this.playerCharacter.death();
      
        return;
      }
    }

    if (this.waitingForCubeRotation) {
      this.rotateCube(this.nextCubeRotationDirection);
    }

    if (this.nextMoveDirection && !this.waitingForCubeRotation) {
      this.moveCharacter(this.nextMoveDirection);
      this.nextMoveDirection = null;
    }
  }

  private onCubeRotatingEnd(): void {
    if (this.waitingForCubeRotation) {
      this.waitingForCubeRotation = false;
      this.nextCubeRotationDirection = null;

      const cubeSide: CubeSide = this.cube.getCurrentSide();
      this.playerCharacter.setActiveSide(cubeSide);
      this.playerCharacter.updatePositionOnRealPosition();
      this.playerCharacter.setRotationBySide(cubeSide);

      if (this.nextMoveDirection) {
        this.moveCharacter(this.nextMoveDirection);
        this.nextMoveDirection = null;
      }

      const currentRotationDirection: CubeRotationDirection = this.cube.getCurrentRotationDirection();
      const movingDirection: MoveDirection = MovementDirectionByCubeRotationConfig[this.currentMoveDirection][currentRotationDirection].direction;
      this.playerCharacter.setRotationByDirection(movingDirection);
    }
  }

  private onLevelEnd(): void {
    this.reset();
    this.removeLevel();
    this.hideLevel();
    
    this.startNextLevel();
  }

  private reset(): void {
    this.waitingForCubeRotation = false;
    this.waitingForEndLevel = false;
    this.nextMoveDirection = null;
    this.nextCubeRotationDirection = null;
    this.wallSpikeOnTargetPosition = '';
    this.currentMoveDirection = null;
  }

  private removeLevel(): void {
    this.playerCharacter.reset();
    this.cube.reset();
    this.cube.removeCube();
    this.enemiesController.removeEnemies();
  }

  private hideLevel(): void {
    this.playerCharacter.hide();
    this.endGameObject.hide();
    this.cube.hide();
  }

  private startNextLevel(): void {
    this.levelIndex++;

    if (this.levelIndex < LevelsQueue.length) {
      const currentLevelType: LevelType = LevelsQueue[this.levelIndex];
      this.startLevel(currentLevelType);
    }
  }

  private resetLevelOnDeath(): void {
    this.reset();
    this.cube.rotateToStartSide();
  }

  private respawnPlayerCharacter(): void {
    this.playerCharacter.respawn();
  }
}
