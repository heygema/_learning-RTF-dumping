import { Canvas, useFrame } from "react-three-fiber";
import { OrbitControls, Stars, useGLTF } from "drei";
import "./App.css";
import { Suspense, useRef, useState } from "react";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import {
  enemyPositionState,
  laserPositionState,
  scoreState,
  shipPositionState
} from "./gameState";
import { TextureLoader } from "three";

// helpers
function distance(p1, p2) {
  const x = p2.x - p1.x;
  const y = p2.y - p1.y;
  const z = p2.z - p1.z;
  return Math.sqrt(x * x + y * y + z * z);
}

// Game settings
const LASER_RANGE = 100;
const LASER_Z_VELOCITY = 1;
const ENEMY_SPEED = 0.1;
const GROUND_HEIGHT = -50;

function GameTimer() {
  const [enemies, setEnemies] = useRecoilState(enemyPositionState);
  const [lasers, setLaserPositions] = useRecoilState(laserPositionState);
  const [score, setScore] = useRecoilState(scoreState);

  useFrame(() => {
    const hitEnemies = enemies
      ? enemies.map(
          (enemy) =>
            lasers.filter((laser) => distance(laser, enemy) < 3).length > 0
        )
      : [];

    console.log("hit enemies ?", hitEnemies);

    if (hitEnemies.includes(true) && enemies.length > 0) {
      setScore(score + hitEnemies.filter((hit) => hit).length);
      console.log("hit detected");
    }

    setEnemies(
      enemies
        .map((enemy) => ({
          x: enemy.x,
          y: enemy.y,
          z: enemy.z + ENEMY_SPEED
        }))
        .filter((enemy, idx) => !hitEnemies[idx] && enemy.z < 0)
    );

    setLaserPositions(
      lasers
        .map((laser) => ({
          ...laser,
          id: laser.id,
          x: laser.x + laser.velocity[0],
          y: laser.y + laser.velocity[1],
          z: laser.z - LASER_Z_VELOCITY
        }))
        .filter((laser) => laser.z > -LASER_RANGE && laser.y > GROUND_HEIGHT)
    );
  });

  return null;
}

// A Ground plane that moves relative to the player. The player stays at 0,0
function Terrain() {
  const terrain = useRef();

  useFrame(() => {
    if (terrain.current.position.z >= 210) {
      terrain.current.position.z = 0;
    }
    terrain.current.position.z += 0.9;
  });

  return (
    <mesh
      visible
      position={[0, GROUND_HEIGHT, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      ref={terrain}
    >
      <planeBufferGeometry attach="geometry" args={[5000, 5000, 128, 128]} />
      <meshStandardMaterial
        attach="material"
        color="red"
        roughness={1}
        metalness={0}
        wireframe
      />
    </mesh>
  );
}

function LaserController() {
  const shipPosition = useRecoilValue(shipPositionState);
  const [lasers, setLasers] = useRecoilState(laserPositionState);

  return (
    <mesh
      position={[0, 0, -8]}
      onClick={() =>
        setLasers([
          ...lasers,
          {
            id: Math.random(),
            x: 0,
            y: 0,
            z: 0,
            velocity: [shipPosition.rotation.x * 6, shipPosition.rotation.y * 5]
          }
        ])
      }
    >
      <planeBufferGeometry attach="geometry" args={[100, 100]} />
      <meshStandardMaterial
        attach="material"
        color="orange"
        emissive="ff0860"
        visible={false}
      />
    </mesh>
  );
}

function Lasers() {
  const lasers = useRecoilValue(laserPositionState);

  return (
    <group>
      {lasers.map((laser) => (
        <mesh position={[laser.x, laser.y, laser.z]} key={`${laser.id}`}>
          <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
          <meshStandardMaterial attach="material" color="red" wireframe />
        </mesh>
      ))}
    </group>
  );
}

function Enemies() {
  const enemies = useRecoilValue(enemyPositionState);

  return (
    <group>
      {enemies.map((enemy) => (
        <mesh position={[enemy.x, enemy.y, enemy.z]} key={`${enemy.x}`}>
          <sphereBufferGeometry attach="geometry" args={[2, 8, 8]} />
          <meshStandardMaterial attach="material" color="white" wireframe />
        </mesh>
      ))}
    </group>
  );
}

export function Model({ url, ...props }) {
  const gltf = useGLTF(url, true);
  return <primitive {...props} object={gltf.scene} dispose={null} />;
}

export function MediumLight() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1} />
    </>
  );
}

function Starfield() {
  const star = useRef();
  useFrame(() => {
    star.current.rotation.y += 0.0005;
    star.current.rotation.z += 0.0005;
    star.current.rotation.x += 0.0005;
  });

  return <Stars ref={star} />;
}

export function Tie2() {
  // const { } = useLoader(GLTFLoader, "/star_wars_tie_fighter/scene.gltf");
  //
  const ship = useRef();
  useFrame(() => {
    ship.current.rotation.y += 0.01;
  });

  return (
    <group ref={ship}>
      <mesh visible>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          attach="material"
          color="white"
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

export function Target() {
  const rearTarget = useRef();
  const frontTarget = useRef();

  const loader = new TextureLoader();

  const texture = loader.load("/target.png");

  useFrame(({ mouse }) => {
    rearTarget.current.position.y = -mouse.y * 10;
    rearTarget.current.position.x = -mouse.x * 30;

    frontTarget.current.position.y = -mouse.y * 20;
    frontTarget.current.position.x = -mouse.x * 60;
  });

  return (
    <group>
      <sprite position={[0, 0, -8]} ref={rearTarget}>
        <spriteMaterial attach="material" map={texture} opacity={0.5} />
      </sprite>
      <sprite position={[0, 0, -16]} ref={frontTarget} opacity={0.5}>
        <spriteMaterial attach="material" map={texture} />
      </sprite>
    </group>
  );
}

function TieFighter() {
  const [shipPos, setShipPos] = useRecoilState(shipPositionState);

  const ship = useRef();

  useFrame(({ mouse }) => {
    setShipPos({
      position: { x: mouse.x * 6, y: mouse.y * 2 },
      rotation: {
        z: -mouse.x * 0.5,
        x: -mouse.x * 0.5,
        y: -mouse.y * 0.2
      }
    });
  });

  useFrame(() => {
    ship.current.rotation.z = shipPos.rotation.z;
    ship.current.rotation.y = shipPos.rotation.x;
    ship.current.rotation.x = shipPos.rotation.y;
    ship.current.position.x = shipPos.position.x;
    ship.current.position.y = shipPos.position.y;
  });

  return (
    <group ref={ship}>
      <Model
        position={[0, -3, -15]}
        url={"/star_wars_tie_fighter/scene.gltf"}
      />
    </group>
  );
}

function Shooter() {
  return (
    <div className="App-header">
      <Canvas style={{ flex: 1 }}>
        <RecoilRoot>
          <Starfield />
          <MediumLight />
          <Suspense fallback={null}>
            <TieFighter />
            <Terrain />
          </Suspense>
          <Target />
          <Enemies />
          <Lasers />
          <LaserController />
          <GameTimer />
        </RecoilRoot>
      </Canvas>
    </div>
  );
}

export default Shooter;
