import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const NeuralBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Configuration ---
    const config = {
      nodes: 120,
      connectionDistance: 150,
      nodeSpeed: 0.3,
      pulseSpeed: 0.05,
      bloomIntensity: 1.5,
      bloomThreshold: 0.1,
      bloomRadius: 0.8
    };

    const colorPalettes = [
      [new THREE.Color('#667eea'), new THREE.Color('#764ba2'), new THREE.Color('#6B8DD6')],
      [new THREE.Color('#00f2fe'), new THREE.Color('#4facfe'), new THREE.Color('#00c6ff')],
      [new THREE.Color('#f093fb'), new THREE.Color('#f5576c'), new THREE.Color('#ff0844')]
    ];

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050510');
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- Post Processing ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      config.bloomIntensity,
      config.bloomRadius,
      config.bloomThreshold
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // --- Neural Network Logic ---
    const generateNeuralNetwork = () => {
      const group = new THREE.Group();
      const nodes = [];
      const levels = 5;
      const palette = colorPalettes[0];

      // Create Nodes
      for (let i = 0; i < config.nodes; i++) {
        const level = Math.floor(Math.random() * levels);
        const radius = 1.5 + Math.random() * 2;
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const color = palette[level % palette.length].clone();
        
        const material = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Random spherical distribution
        const r = 200 + Math.random() * 150;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        mesh.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );

        mesh.userData = {
          originalPos: mesh.position.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * config.nodeSpeed,
            (Math.random() - 0.5) * config.nodeSpeed,
            (Math.random() - 0.5) * config.nodeSpeed
          ),
          level,
          pulse: Math.random() * Math.PI
        };

        nodes.push(mesh);
        group.add(mesh);
      }

      // Create Connections (Lines)
      const lineMaterial = new THREE.LineBasicMaterial({
        color: palette[0],
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });

      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(config.nodes * config.nodes * 2 * 3);
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(linesMesh);

      return { group, nodes, linesMesh };
    };

    const nn = generateNeuralNetwork();
    scene.add(nn.group);

    // --- Animation ---
    const animate = () => {
      const requestID = requestAnimationFrame(animate);

      nn.nodes.forEach((node, i) => {
        // Move nodes
        node.position.add(node.userData.velocity);
        
        // Boundaries
        if (node.position.length() > 400) {
          node.userData.velocity.negate();
        }

        // Pulse effect
        node.userData.pulse += config.pulseSpeed;
        const s = 1 + Math.sin(node.userData.pulse) * 0.2;
        node.scale.set(s, s, s);
      });

      // Update lines
      const positions = nn.linesMesh.geometry.attributes.position.array;
      let counter = 0;

      for (let i = 0; i < nn.nodes.length; i++) {
        for (let j = i + 1; j < nn.nodes.length; j++) {
          const dist = nn.nodes[i].position.distanceTo(nn.nodes[j].position);
          if (dist < config.connectionDistance) {
            positions[counter++] = nn.nodes[i].position.x;
            positions[counter++] = nn.nodes[i].position.y;
            positions[counter++] = nn.nodes[i].position.z;
            positions[counter++] = nn.nodes[j].position.x;
            positions[counter++] = nn.nodes[j].position.y;
            positions[counter++] = nn.nodes[j].position.z;
          }
        }
      }
      nn.linesMesh.geometry.attributes.position.needsUpdate = true;
      nn.linesMesh.geometry.setDrawRange(0, counter / 3);

      // Rotate network
      nn.group.rotation.y += 0.001;
      nn.group.rotation.x += 0.0005;

      composer.render();
    };

    animate();

    // --- Cleanup ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1,
        pointerEvents: 'none',
        background: '#050510'
      }} 
    />
  );
};

export default NeuralBackground;
