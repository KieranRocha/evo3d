// components/STLThumbnail.jsx
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

export default function STLThumbnail({ url, backgroundColor = "#f5f5f5" }) {
  const canvasRef = useRef(null);
  const [modelInfo, setModelInfo] = useState({
    dimensions: { width: 0, height: 0, depth: 0 },
    triangles: 0,
    volume: 0,
    surfaceArea: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url || !canvasRef.current) return;

    let renderer, scene, camera;
    setIsLoading(true);
    setError(null);

    // Função para gerar a imagem estática
    const generateThumbnail = async () => {
      try {
        // Configuração básica
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        // Cria a cena
        scene = new THREE.Scene();
        // Usa a cor de fundo customizada
        scene.background = new THREE.Color(backgroundColor);

        // Cria a câmera
        camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);

        // Cria o renderer
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          preserveDrawingBuffer: true, // Importante para poder salvar a imagem
        });
        renderer.setSize(width, height);

        // Adiciona iluminação
        const ambientLight = new THREE.AmbientLight(0x888888);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-1, -1, -1);
        scene.add(directionalLight2);

        // Carrega o modelo STL
        const loader = new STLLoader();

        // Promisify o carregamento
        const geometry = await new Promise((resolve, reject) => {
          loader.load(
            url,
            (geometry) => resolve(geometry),
            undefined,
            (error) => reject(error)
          );
        });

        // Calcula informações do modelo
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

        // Centraliza a geometria
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Cria o material
        const material = new THREE.MeshPhongMaterial({
          color: 0x3f8,

          shininess: 100,
        });

        // Cria a mesh e adiciona à cena
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Ajusta a câmera para enquadrar o modelo
        const maxDim = Math.max(
          dimensions.width,
          dimensions.height,
          dimensions.depth
        );
        const dist = maxDim * 2;

        // Posiciona a câmera em um ângulo isométrico (mais agradável)
        camera.position.set(dist * 0.7, dist * 0.5, dist * 0.7);
        camera.lookAt(0, 0, 0);

        // Renderiza a cena
        renderer.render(scene, camera);

        // Calcula volume e área
        const volume = Math.abs(calculateVolume(geometry)) / 1000; // cm³
        const surfaceArea = calculateSurfaceArea(geometry);

        // Atualiza informações do modelo
        setModelInfo({
          dimensions,
          triangles,
          volume: volume.toFixed(2),
          surfaceArea: surfaceArea.toFixed(2),
        });

        setIsLoading(false);

        // Cleanup
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (mesh && mesh.geometry) mesh.geometry.dispose();
        if (mesh && mesh.material) mesh.material.dispose();
      } catch (err) {
        console.error("Erro ao processar STL:", err);
        setError("Não foi possível gerar a visualização do modelo");
        setIsLoading(false);
      } finally {
        // Cleanup final
        if (renderer) renderer.dispose();
      }
    };

    // Calcula volume aproximado
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

    // Calcula área de superfície aproximada
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

    // Gera a imagem estática
    generateThumbnail();

    // Cleanup
    return () => {
      if (renderer) renderer.dispose();
      if (scene) {
        scene.traverse((object) => {
          if (!object.isMesh) return;
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [url, backgroundColor]);

  return (
    <div className="space-y-4 ">
      <div className="relative w-full ">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md">
            <div className="text-gray-500">Gerando visualização...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-md">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={65}
          height={65}
          className="w-full  bg-gray-100 rounded-md "
        />
      </div>
    </div>
  );
}
