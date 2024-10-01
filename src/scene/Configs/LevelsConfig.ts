import * as THREE from 'three';
import { CubeEdge } from "../Enums/CubeEdge";
import { CubeSide } from "../Enums/CubeSide";
import { ILevelConfig } from "../Interfaces/ILevelConfig";

const LevelsConfig: ILevelConfig[] = [
  // Level 1
  {
    size: 6,
    map: {
      surfaces: {
        [CubeSide.Front]: [
          [0, 0, 0, 1, 0, 0],
          [0, 0, 1, 1, 0, 0],
          [0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0],
        ],
        [CubeSide.Left]: [
          [0, 0, 1, 1, 0, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0, 0],
          [0, 1, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 0],
        ],
        [CubeSide.Right]: [
          [0, 0, 1, 1, 0, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 0, 1, 1, 0, 0],
        ],
        [CubeSide.Top]: [
          [0, 0, 0, 1, 0, 0],
          [0, 0, 1, 1, 0, 0],
          [0, 1, 0, 1, 0, 0],
          [1, 1, 1, 1, 0, 0],
          [0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0],
        ],
        [CubeSide.Down]: [
          [0, 1, 1, 1, 1, 0],
          [0, 1, 0, 0, 0, 0],
          [0, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 0, 1, 1, 0, 0],
        ],
        [CubeSide.Back]: [
          [0, 0, 1, 1, 0, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0],
          [0, 1, 1, 1, 0, 0],
          [0, 1, 0, 0, 1, 0],
          [0, 0, 1, 1, 0, 0],
        ],
      },
      edges: {
        [CubeEdge.FrontTop]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.FrontDown]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.FrontLeft]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.FrontRight]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.TopLeft]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.TopRight]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.DownLeft]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.DownRight]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.BackTop]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.BackDown]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.BackLeft]: [1, 1, 1, 1, 1, 1],
        [CubeEdge.BackRight]: [1, 1, 1, 1, 1, 1],
      },
    },
    playCharacter: {
      position: new THREE.Vector2(1, 0),
      direction: 0,
      surface: CubeSide.Right,
    },
  },
]

export default LevelsConfig;