import { Canvas, useFrame } from "react-three-fiber";
import { OrbitControls, Stars } from "drei";
import "./App.css";
import { useState } from "react";

export function MediumLight() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 1, 1]} />
    </>
  );
}

function KeyLight({ brightness, color }) {
  return (
    <rectAreaLight
      width={3}
      height={3}
      color={color}
      intensity={brightness}
      position={[-2, 10, 5]}
      lookAt={[0, 0, 0]}
      penumbra={1}
      castShadow
    />
  );
}

function FillLight({ brightness, color }) {
  return (
    <rectAreaLight
      width={3}
      height={3}
      intensity={brightness}
      color={color}
      position={[2, 1, 4]}
      lookAt={[0, 0, 0]}
      penumbra={2}
      castShadow
    />
  );
}

function RimLigth({ brightness, color }) {
  return (
    <rectAreaLight
      width={2}
      height={2}
      intensity={brightness}
      color={color}
      position={[1, 4, -2]}
      rotation={[0, 180, 0]}
      castShadow
    />
  );
}

// Geometry
function GroundPlane() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeBufferGeometry attach="geometry" args={[50000, 50000]} />
      <meshStandardMaterial attach="material" color="white" />
    </mesh>
  );
}

function Backdrop() {
  return (
    <mesh receiveShadow position={[0, -1, -5]}>
      <planeBufferGeometry attach="geometry" args={[500, 500]} />
      <meshStandardMaterial attach="material" color="white" />
    </mesh>
  );
}

function Box() {
  const [rotation, setRotation] = useState([0, 0, 0]);

  useFrame(() => {
    let [x, y, z] = rotation;

    setRotation([x, (y += 0.01), z]);
  });

  return (
    <mesh receiveShadow position={[5, 0, 0]} rotation={rotation} castShadow>
      <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial
        transparent
        roughness={0.1}
        metalness={0.1}
        attach="material"
        color={"white"}
      />
    </mesh>
  );
}

function Sphere({ color }) {
  const [position, setPosition] = useState([0, 1, 0]);
  const [direction, setDirection] = useState(true);

  const [rotation, setRotation] = useState([1, 1.2, 0]);

  useFrame(() => {
    let [x, y, z] = rotation;
    setRotation([x, (y += 0.1), z + 0.1]);
  });
  useFrame(() => {
    let [x, y, z] = position;

    if (y >= 1) {
      setDirection(false);
    }

    if (y <= 0) {
      setDirection(true);
    }

    setPosition([x, direction ? y + 0.1 : y - 0.1, z]);
  });

  return (
    <mesh
      visible
      userData={{
        test: "Hello"
      }}
      position={position}
      rotation={rotation}
      castShadow
    >
      <sphereGeometry attach="geometry" args={[1, 32, 32]} />
      <meshStandardMaterial
        transparent
        roughness={0.1}
        metalness={0.1}
        attach="material"
        color={color || "white"}
      />
    </mesh>
  );
}

function App() {
  return (
    <div className="App-header">
      <Canvas
        style={{
          flex: 1
        }}
        camera={{
          position: [25, 13, 10]
        }}
      >
        <Stars />
        <OrbitControls enableDamping dampingFactor={0.25} enableZoom />
        <KeyLight brightness={5.6} color="#ffbdf4" />
        <FillLight brightness={2.6} color="#bdefff" />
        <RimLigth brightness={54} color="white" />
        <Sphere />
        <Box />
        <Backdrop />
        <GroundPlane />
      </Canvas>
    </div>
  );
}

export default App;
