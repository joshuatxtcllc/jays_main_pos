import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Frame, MatColor } from '@shared/schema';

interface FrameVisualizer3DProps {
  frame: Frame | null;
  matColor: MatColor | null;
  matWidth: number;
  artworkWidth: number;
  artworkHeight: number;
  artworkImage: string | null;
}

const FrameVisualizer3D: React.FC<FrameVisualizer3DProps> = ({
  frame,
  matColor,
  matWidth,
  artworkWidth,
  artworkHeight,
  artworkImage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Setup the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      // Initialize scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      sceneRef.current = scene;
      
      // Initialize camera
      const camera = new THREE.PerspectiveCamera(
        45,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 50;
      cameraRef.current = camera;
      
      // Initialize renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controlsRef.current = controls;
      
      // Animate the scene
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Resize handler
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        
        cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        
        scene.clear();
      };
    } catch (err) {
      console.error('Error initializing 3D scene:', err);
      setError('Failed to initialize 3D visualization. Please try again.');
    }
  }, []);
  
  // Update the 3D model when frame or artwork changes
  useEffect(() => {
    if (!sceneRef.current || !frame || !matColor || !containerRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Clear existing frame model
      if (frameRef.current) {
        sceneRef.current.remove(frameRef.current);
      }
      
      // Create frame group
      const frameGroup = new THREE.Group();
      frameRef.current = frameGroup;
      
      // Create a placeholder for the artwork while it loads
      const placeholderGeometry = new THREE.PlaneGeometry(
        artworkWidth,
        artworkHeight
      );
      
      const placeholderMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide
      });
      
      const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
      frameGroup.add(placeholder);
      
      // Load the artwork texture if available
      if (artworkImage) {
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load(
          artworkImage,
          (texture) => {
            // Create artwork plane with the loaded texture
            const artworkGeometry = new THREE.PlaneGeometry(
              artworkWidth,
              artworkHeight
            );
            
            const artworkMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide
            });
            
            const artwork = new THREE.Mesh(artworkGeometry, artworkMaterial);
            
            // Replace the placeholder with the actual artwork
            frameGroup.remove(placeholder);
            frameGroup.add(artwork);
            
            // Create mat if needed
            if (matWidth > 0 && matColor) {
              const matOuterWidth = artworkWidth + (matWidth * 2);
              const matOuterHeight = artworkHeight + (matWidth * 2);
              
              // Create mat geometry
              const matGeometry = new THREE.PlaneGeometry(
                matOuterWidth,
                matOuterHeight
              );
              
              // Parse the color and convert to THREE.Color
              const color = matColor.color;
              const threeColor = new THREE.Color(color);
              
              const matMaterial = new THREE.MeshBasicMaterial({
                color: threeColor,
                side: THREE.DoubleSide
              });
              
              const mat = new THREE.Mesh(matGeometry, matMaterial);
              mat.position.z = -0.1; // Place behind artwork
              
              frameGroup.add(mat);
            }
            
            // Create frame
            if (frame) {
              // Load frame texture
              textureLoader.load(
                frame.catalogImage,
                (frameTexture) => {
                  const frameWidth = matWidth > 0 
                    ? artworkWidth + (matWidth * 2) + (frame.width * 2)
                    : artworkWidth + (frame.width * 2);
                    
                  const frameHeight = matWidth > 0
                    ? artworkHeight + (matWidth * 2) + (frame.width * 2)
                    : artworkHeight + (frame.width * 2);
                  
                  // Create frame material with the loaded texture
                  const frameMaterial = new THREE.MeshStandardMaterial({
                    map: frameTexture,
                    roughness: 0.5,
                    metalness: 0.2
                  });
                  
                  // Create the frame pieces
                  // Top bar
                  const topGeometry = new THREE.BoxGeometry(
                    frameWidth,
                    frame.width,
                    frame.depth
                  );
                  const topBar = new THREE.Mesh(topGeometry, frameMaterial);
                  topBar.position.y = (frameHeight - frame.width) / 2;
                  topBar.position.z = -frame.depth / 2 - 0.2;
                  
                  // Bottom bar
                  const bottomGeometry = new THREE.BoxGeometry(
                    frameWidth,
                    frame.width,
                    frame.depth
                  );
                  const bottomBar = new THREE.Mesh(bottomGeometry, frameMaterial);
                  bottomBar.position.y = -(frameHeight - frame.width) / 2;
                  bottomBar.position.z = -frame.depth / 2 - 0.2;
                  
                  // Left bar
                  const leftGeometry = new THREE.BoxGeometry(
                    frame.width,
                    frameHeight - (frame.width * 2),
                    frame.depth
                  );
                  const leftBar = new THREE.Mesh(leftGeometry, frameMaterial);
                  leftBar.position.x = -(frameWidth - frame.width) / 2;
                  leftBar.position.z = -frame.depth / 2 - 0.2;
                  
                  // Right bar
                  const rightGeometry = new THREE.BoxGeometry(
                    frame.width,
                    frameHeight - (frame.width * 2),
                    frame.depth
                  );
                  const rightBar = new THREE.Mesh(rightGeometry, frameMaterial);
                  rightBar.position.x = (frameWidth - frame.width) / 2;
                  rightBar.position.z = -frame.depth / 2 - 0.2;
                  
                  frameGroup.add(topBar, bottomBar, leftBar, rightBar);
                  
                  // Position the group to center
                  frameGroup.position.z = frame.depth / 2;
                  
                  // Add the frame group to the scene
                  sceneRef.current?.add(frameGroup);
                  
                  // Reset camera position to see the frame
                  if (cameraRef.current) {
                    const maxDimension = Math.max(frameWidth, frameHeight);
                    cameraRef.current.position.z = maxDimension * 1.5;
                    
                    if (controlsRef.current) {
                      controlsRef.current.target.set(0, 0, 0);
                      controlsRef.current.update();
                    }
                  }
                  
                  setIsLoading(false);
                },
                undefined,
                (error) => {
                  console.error('Error loading frame texture:', error);
                  setError('Failed to load frame texture');
                  setIsLoading(false);
                }
              );
            } else {
              sceneRef.current?.add(frameGroup);
              setIsLoading(false);
            }
          },
          undefined,
          (error) => {
            console.error('Error loading artwork texture:', error);
            // Still add the placeholder with the frame
            sceneRef.current?.add(frameGroup);
            setIsLoading(false);
          }
        );
      } else {
        // Just add the placeholder if no artwork is provided
        sceneRef.current?.add(frameGroup);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error updating 3D model:', err);
      setError('Failed to update 3D visualization');
      setIsLoading(false);
    }
  }, [frame, matColor, matWidth, artworkWidth, artworkHeight, artworkImage]);
  
  // Update the background color when dark mode changes
  useEffect(() => {
    if (sceneRef.current) {
      const isDarkMode = document.body.classList.contains('dark');
      sceneRef.current.background = new THREE.Color(isDarkMode ? 0x1a1a2e : 0xf5f5f5);
    }
  }, []);
  
  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className={`frame-visualizer-3d ${isLoading ? 'loading' : ''}`}
      ></div>
      
      {error && (
        <div className="frame-visualizer-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium mb-1">Visualization Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      <div className="controls-help">
        Drag to rotate, scroll to zoom
      </div>
    </div>
  );
};

export default FrameVisualizer3D;
