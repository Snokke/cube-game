import * as THREE from 'three';
import { CubeEdge } from "../../Enums/CubeEdge";
import { CubeSide } from "../../Enums/CubeSide";
import { ILevelConfig } from "../../Interfaces/ILevelConfig";
import { SceneType } from '../../Enums/SceneType';

// Empty = ' ', '  '
// Wall = 'W', 'WW'
// Start = 'S', 'ST'
// Finish = 'F', 'FI'
// WallSpike = 'X{id}'
// FloorSpike = 'I{id}'
// Coin = 'C', 'CC'

const Level08: ILevelConfig = {
  size: new THREE.Vector3(6, 6, 6),
  sceneType: SceneType.Light,
  map: {
    sides: {
      [CubeSide.Front]: [
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', 'ST', 'FI', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
      ],
      [CubeSide.Left]: [
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
      ],
      [CubeSide.Right]: [
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
      ],
      [CubeSide.Top]: [
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
      ],
      [CubeSide.Bottom]: [
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
      ],
      [CubeSide.Back]: [
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
        ['  ', '  ', '  ', '  ', '  ', '  '],
      ],
    },
    edges: {
      [CubeEdge.FrontTop]:   ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.FrontDown]:  ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.FrontLeft]:  ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.FrontRight]: ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.TopLeft]:    ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.TopRight]:   ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.DownLeft]:   ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.DownRight]:  ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.BackTop]:    ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.BackDown]:   ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.BackLeft]:   ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
      [CubeEdge.BackRight]:  ['WW', 'WW', 'WW', 'WW', 'WW', 'WW'],
    },
  },
};

export default Level08;
