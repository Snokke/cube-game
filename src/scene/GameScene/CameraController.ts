import * as THREE from 'three';
import PlayerCharacter from './PlayerCharacter/PlayerCharacter';
import Cube from './Cube/Cube';
import { CubeState } from '../Enums/CubeState';
import ThreeJSHelper from '../Helpers/ThreeJSHelper';
import CameraConfig from '../Configs/Main/CameraConfig';

export class CameraController extends THREE.Group {
  private camera: THREE.PerspectiveCamera;
  private playerCharacter: PlayerCharacter;
  private cube: Cube;
  private playerCharacterWorldPosition: THREE.Vector3 = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    super();

    this.camera = camera;
  }

  public update(dt: number): void {
    if (CameraConfig.followPlayer.enabled) {
      this.followPlayerCharacter(dt);
    }
  }

  public setPlayerCharacter(playerCharacter: PlayerCharacter): void {
    this.playerCharacter = playerCharacter;
  }

  public setCube(cube: Cube): void {
    this.cube = cube;
  }

  private followPlayerCharacter(dt: number): void {
    if (this.playerCharacter.isActivated()) {
      let lerpFactor = CameraConfig.followPlayer.lerpFactor * 60;

      if (this.cube.getState() === CubeState.Rotating) {
        lerpFactor = CameraConfig.followPlayer.lerpFactorCubeRotating * 60;
      }

      this.playerCharacter.getWorldPosition(this.playerCharacterWorldPosition);

      this.camera.position.x = ThreeJSHelper.lerp(this.camera.position.x, this.playerCharacterWorldPosition.x, lerpFactor * dt);
      this.camera.position.y = ThreeJSHelper.lerp(this.camera.position.y, this.playerCharacterWorldPosition.y, lerpFactor * dt);

      this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
    }
  }
}
