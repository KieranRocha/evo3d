"use client";

// components/STLPreview.jsx
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function STLPreview({ url }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const meshRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [modelInfo, setModelInfo] = useState({
    dimensions: { width: 0, height: 0, depth: 0 },
    triangles: 0,
    volume: 0,
    surfaceArea: 0,
  });

  // Função para limpar a cena e renderer
  const cleanupResources = () => {
    // Cancelar o animation frame se existir
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Remover a mesh se existir
    if (meshRef.current && sceneRef.current) {
      sceneRef.current.remove(meshRef.current);
      if (meshRef.current.geometry) meshRef.current.geometry.dispose();
      if (meshRef.current.material) meshRef.current.material.dispose();
      meshRef.current = null;
    }

    // Descartar controles
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }

    // Remover e limpar o renderer
    if (rendererRef.current) {
      // Verificamos se containerRef ainda existe e tem o elemento filho
      if (
        containerRef.current &&
        containerRef.current.contains(rendererRef.current.domElement)
      ) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
  };

  useEffect(() => {
    // Verificar se temos um contêiner e URL
    if (!containerRef.current || !url) return;

    // Inicialização da cena e renderizador
    const initScene = () => {
      // Limpeza prévia
      cleanupResources();

      // Setup da cena
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0xf0f0f0);

      // Configuração do container e tamanhos
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight || 250; // Altura mínima

      // Configuração da câmera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      cameraRef.current = camera;
      camera.position.set(0, 0, 5);

      // Configuração do renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current = renderer;
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Anexar o renderer ao DOM
      container.appendChild(renderer.domElement);

      // Adicionar luzes
      const ambientLight = new THREE.AmbientLight(0x888888);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);

      // Adicionar controles para orbitar
      const controls = new OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;

      // Adicionar grid como referência
      const gridHelper = new THREE.GridHelper(10, 10);
      scene.add(gridHelper);

      // Função de animação
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && camera && scene) renderer.render(scene, camera);
      };

      // Iniciar animação
      animate();
    };

    // Inicializar cena
    initScene();

    // Carregar o STL
    const loadSTL = () => {
      if (!sceneRef.current || !cameraRef.current) return;

      const loader = new STLLoader();
      loader.load(
        url,
        (geometry) => {
          try {
            // Calcular informações do modelo
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;

            // Dimensões
            const dimensions = {
              width: boundingBox.max.x - boundingBox.min.x,
              height: boundingBox.max.y - boundingBox.min.y,
              depth: boundingBox.max.z - boundingBox.min.z,
            };

            // Número de triângulos
            const triangles = geometry.attributes.position.count / 3;

            // Centralizar geometria
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            // Calcular volume e área de superfície (estimativa)
            let volume = 0;
            let surfaceArea = 0;

            // Criar material e malha
            const material = new THREE.MeshPhongMaterial({
              color: 0x3f88f6,
              specular: 0x111111,
              shininess: 100,
            });

            // Remover malha anterior se existir
            if (meshRef.current && sceneRef.current) {
              sceneRef.current.remove(meshRef.current);
              if (meshRef.current.geometry) meshRef.current.geometry.dispose();
              if (meshRef.current.material) meshRef.current.material.dispose();
            }

            // Criar nova malha
            const mesh = new THREE.Mesh(geometry, material);
            meshRef.current = mesh;
            sceneRef.current.add(mesh);

            // Ajustar câmera com base no tamanho do modelo
            const maxDim = Math.max(
              dimensions.width,
              dimensions.height,
              dimensions.depth
            );
            const dist = maxDim * 2;
            cameraRef.current.position.set(0, 0, dist);
            cameraRef.current.lookAt(0, 0, 0);

            // Estimar volume e área
            volume = Math.abs(calculateVolume(geometry)) / 1000; // cm³
            surfaceArea = calculateSurfaceArea(geometry);

            // Atualizar informações do modelo
            setModelInfo({
              dimensions,
              triangles,
              volume: volume.toFixed(2),
              surfaceArea: surfaceArea.toFixed(2),
            });
          } catch (err) {
            console.error("Erro ao processar geometria STL:", err);
          }
        },
        undefined,
        (error) => {
          console.error("Erro ao carregar o arquivo STL:", error);
        }
      );
    };

    // Calcular volume aproximado
    const calculateVolume = (geometry) => {
      let volume = 0;
      const pos = geometry.attributes.position;
      const faces = pos.count / 3;

      for (let i = 0; i < faces; i++) {
        const idx = i * 3;
        const p1 = new THREE.Vector3(
          pos.getX(idx),
          pos.getY(idx),
          pos.getZ(idx)
        );
        const p2 = new THREE.Vector3(
          pos.getX(idx + 1),
          pos.getY(idx + 1),
          pos.getZ(idx + 1)
        );
        const p3 = new THREE.Vector3(
          pos.getX(idx + 2),
          pos.getY(idx + 2),
          pos.getZ(idx + 2)
        );

        // Calcular contribuição ao volume
        const tetraVol = p1.dot(p2.clone().cross(p3)) / 6;
        volume += tetraVol;
      }

      return volume;
    };

    // Calcular área de superfície aproximada
    const calculateSurfaceArea = (geometry) => {
      let area = 0;
      const pos = geometry.attributes.position;
      const faces = pos.count / 3;

      for (let i = 0; i < faces; i++) {
        const idx = i * 3;
        const p1 = new THREE.Vector3(
          pos.getX(idx),
          pos.getY(idx),
          pos.getZ(idx)
        );
        const p2 = new THREE.Vector3(
          pos.getX(idx + 1),
          pos.getY(idx + 1),
          pos.getZ(idx + 1)
        );
        const p3 = new THREE.Vector3(
          pos.getX(idx + 2),
          pos.getY(idx + 2),
          pos.getZ(idx + 2)
        );

        // Calcular área do triângulo
        const side1 = new THREE.Vector3().subVectors(p2, p1);
        const side2 = new THREE.Vector3().subVectors(p3, p1);
        const cross = new THREE.Vector3().crossVectors(side1, side2);
        const triangleArea = cross.length() / 2;

        area += triangleArea;
      }

      return area;
    };

    // Função de redimensionamento
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight || 250;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // Registrar handler de redimensionamento
    window.addEventListener("resize", handleResize);

    // Carregar o STL
    loadSTL();

    // Limpeza
    return () => {
      window.removeEventListener("resize", handleResize);
      cleanupResources();
    };
  }, [url]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="w-full h-64 bg-gray-100 rounded-md"
      ></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Dimensões</h3>
          <div className="text-sm">
            <div>Largura: {modelInfo.dimensions.width.toFixed(2)} mm</div>
            <div>Altura: {modelInfo.dimensions.height.toFixed(2)} mm</div>
            <div>Profundidade: {modelInfo.dimensions.depth.toFixed(2)} mm</div>
          </div>
        </div>
        <div className="border rounded p-3 bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Informações</h3>
          <div className="text-sm">
            <div>Triângulos: {modelInfo.triangles.toLocaleString()}</div>
            <div>Volume: {modelInfo.volume} cm³</div>
            <div>Área: {modelInfo.surfaceArea} mm²</div>
          </div>
        </div>
      </div>
    </div>
  );
}
