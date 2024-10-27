import * as THREE from 'three';
import { IFloorSpikeConfig } from './IEnemyConfig';

export interface IFloorSpikeInstanceConfig {
  mapConfig: IFloorSpikeConfig;
  instanceId: number;
  isActive: boolean;
  startPosition: THREE.Vector3;
}

