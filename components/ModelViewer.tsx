
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment, useGLTF } from '@react-three/drei';
// @ts-ignore
import roomUrl from '../content/Room_1.glb?url';

// Fix for JSX intrinsic element errors: aliasing lowercase three.js elements to capitalized components
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const SphereGeometry = 'sphereGeometry' as any;
const OctahedronGeometry = 'octahedronGeometry' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const SpotLight = 'spotLight' as any;
const Fog = 'fog' as any;
const Primitive = 'primitive' as any;

const RoomModel = () => {
  const { scene } = useGLTF(roomUrl);
  return (
    <Primitive
      object={scene}
      scale={0.5}
      position={[0, -1, 0]}
      rotation={[0, -Math.PI / 4, 0]}
    />
  );
};

const ModelViewer: React.FC = () => {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      {/* Set gl={{ alpha: true }} to ensure background is transparent */}
      <Canvas shadows camera={{ position: [4, 4, 4], fov: 35 }} gl={{ alpha: true, antialias: true }}>
        {/* Removed the solid background color to allow page gradient to show through */}
        <Fog attach="fog" args={['#fdf2f8', 12, 30]} />

        <AmbientLight intensity={0.8} />
        <PointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <SpotLight position={[-5, 10, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />

        <Suspense fallback={null}>
          <RoomModel />
          <ContactShadows position={[0, -0.7, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.1}
          makeDefault
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default ModelViewer;
