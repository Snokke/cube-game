import * as THREE from 'three';
import { CubeEdge } from "../../Enums/CubeEdge";
import { CubeSide } from "../../Enums/CubeSide";
import { ILevelConfig } from "../../Interfaces/ILevelConfig";

const Level01: ILevelConfig = {
  size: new THREE.Vector3(7, 7, 7),
  map: {
    surfaces: {
      [CubeSide.Front]: [
        [0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1],
      ],
      [CubeSide.Left]: [
        [0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      [CubeSide.Right]: [
        [0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      [CubeSide.Top]: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      [CubeSide.Bottom]: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      [CubeSide.Back]: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
    },
    edges: {
      [CubeEdge.FrontTop]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.FrontDown]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.FrontLeft]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.FrontRight]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.TopLeft]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.TopRight]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.DownLeft]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.DownRight]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.BackTop]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.BackDown]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.BackLeft]: [0, 1, 1, 1, 1, 1, 1],
      [CubeEdge.BackRight]: [0, 1, 1, 1, 1, 1, 1],
    },
  },
  playerCharacter: {
    gridPosition: new THREE.Vector2(0, 0),
    direction: 0,
    side: CubeSide.Front,
  },
};

export default Level01;
