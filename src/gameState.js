import { atom} from 'recoil';

export const shipPositionState = atom({
  key: 'shipPosition',
  default: {
    position: {},
    rotation: {}
  }
});

export const enemyPositionState = atom({
  key: "enemyPosition", // unique ID (with respect to other atoms/selectors)
  default: [
    { x: -10, y: 10, z: -80 },
    { x: 20, y: 0, z: -100 },
  ], // default value (aka initial value)
});

export const laserPositionState = atom({
  key: 'laserPosition',
  default: []
});

export const scoreState = atom({
  key: 'score',
  default: 0
});
