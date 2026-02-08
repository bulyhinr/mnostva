
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment } from '@react-three/drei';

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

const StylizedDiorama = () => {
  return (
    <Group rotation={[0, -Math.PI / 4, 0]}>
      {/* Floor / Base */}
      <Mesh receiveShadow position={[0, -0.5, 0]}>
        <BoxGeometry args={[4, 0.4, 4]} />
        <MeshStandardMaterial color="#c084fc" roughness={0.3} metalness={0.1} />
      </Mesh>

      {/* Stylized Wall */}
      <Mesh receiveShadow position={[-1.8, 1, 0]}>
        <BoxGeometry args={[0.4, 3, 4]} />
        <MeshStandardMaterial color="#f0abfc" />
      </Mesh>
      
      {/* Stylized Wall 2 */}
      <Mesh receiveShadow position={[0, 1, -1.8]}>
        <BoxGeometry args={[4, 3, 0.4]} />
        <MeshStandardMaterial color="#f472b6" />
      </Mesh>

      {/* Bed / Platform */}
      <Mesh castShadow position={[-0.5, 0, -0.5]}>
        <BoxGeometry args={[2, 0.8, 1.2]} />
        <MeshStandardMaterial color="white" />
      </Mesh>

      {/* Colorful Pillows/Shapes */}
      <Mesh castShadow position={[-1.2, 0.5, -0.5]}>
        <SphereGeometry args={[0.3, 32, 32]} />
        <MeshStandardMaterial color="#fb7185" />
      </Mesh>

      {/* Floating Magic Orb */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Mesh castShadow position={[1, 1.5, 1]}>
          <OctahedronGeometry args={[0.5, 0]} />
          <MeshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
        </Mesh>
      </Float>

      {/* Table */}
      <Mesh castShadow position={[1, 0, -1]}>
        <BoxGeometry args={[0.8, 0.6, 0.8]} />
        <MeshStandardMaterial color="#fcd34d" />
      </Mesh>
    </Group>
  );
};

const ModelViewer: React.FC = () => {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      {/* Set gl={{ alpha: true }} to ensure background is transparent */}
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 35 }} gl={{ alpha: true, antialias: true }}>
        {/* Removed the solid background color to allow page gradient to show through */}
        <Fog attach="fog" args={['#fdf2f8', 12, 30]} />
        
        <AmbientLight intensity={0.8} />
        <PointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <SpotLight position={[-5, 10, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <Suspense fallback={null}>
          <StylizedDiorama />
          <ContactShadows position={[0, -0.7, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
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
