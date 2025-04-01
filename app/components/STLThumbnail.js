// components/STLThumbnail.js
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

export default function STLThumbnail({
  url,
  fileId,
  file,
  dataUrl,
  backgroundColor = "#f5f5f5",
}) {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let renderer, scene, camera;
    setIsLoading(true);
    setError(null);

    // Função para gerar a imagem estática
    const generateThumbnail = async () => {
      try {
        // Se já temos um dataUrl (thumbnail base64), renderize-o diretamente
        if (dataUrl) {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setIsLoading(false);
          };
          img.onerror = (err) => {
            console.error("Erro ao carregar a thumbnail:", err);
            // Fallback para renderização 3D se a imagem falhar
            renderSTLFromUrl();
          };
          img.src = dataUrl;
          return;
        }

        // Caso contrário, renderize o STL como antes
        renderSTLFromUrl();
      } catch (err) {
        console.error("Erro ao processar STL:", err);
        setError("Não foi possível gerar a visualização do modelo");
        setIsLoading(false);
      }
    };

    // Função para renderizar o STL a partir da URL ou arquivo
    const renderSTLFromUrl = async () => {
      try {
        // Configuração básica
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        // Cria a cena
        scene = new THREE.Scene();
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
        let geometry;

        // Usar diferentes abordagens para carregar o STL dependendo do que está disponível
        if (url) {
          // Carregar a partir da URL
          geometry = await new Promise((resolve, reject) => {
            loader.load(
              url,
              (geometry) => resolve(geometry),
              undefined,
              (error) => reject(error)
            );
          });
        } else if (file) {
          // Carregar a partir do objeto File
          const reader = new FileReader();
          geometry = await new Promise((resolve, reject) => {
            reader.onload = (event) => {
              try {
                const geometry = loader.parse(event.target.result);
                resolve(geometry);
              } catch (e) {
                reject(e);
              }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          });
        } else {
          throw new Error("Nenhum arquivo ou URL fornecido");
        }

        // Centraliza a geometria
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;

        // Dimensões
        const dimensions = {
          width: boundingBox.max.x - boundingBox.min.x,
          height: boundingBox.max.y - boundingBox.min.y,
          depth: boundingBox.max.z - boundingBox.min.z,
        };

        // Centraliza a geometria
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Cria o material
        const material = new THREE.MeshPhongMaterial({
          color: 0x3f8cff,
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
      }
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
  }, [url, backgroundColor, dataUrl, file]);

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
          className="w-full bg-gray-100 rounded-md"
        />
      </div>
    </div>
  );
}
