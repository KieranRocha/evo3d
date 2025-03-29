// app/utils/thumbnailUtils.js
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

/**
 * Gera uma thumbnail de um arquivo STL usando Three.js
 * @param {File} file - O arquivo STL
 * @param {Object} options - Opções para a geração da thumbnail
 * @returns {Promise<string>} Data URL da thumbnail como PNG
 */
export async function generateSTLThumbnail(file, options = {}) {
  const {
    width = 256,
    height = 256,
    backgroundColor = "#f5f5f5",
    modelColor = "#3f88f6",
    rotation = { x: 0.5, y: 0.5, z: 0 },
  } = options;

  return new Promise((resolve, reject) => {
    // Verificar tipo de arquivo
    if (
      !file ||
      (!file.name?.toLowerCase().endsWith(".stl") && file.type !== "model/stl")
    ) {
      return reject(new Error("Arquivo não é um STL válido"));
    }

    try {
      // Criar canvas para renderização
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // Configurar Three.js
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);

      // Adicionar luzes
      const ambientLight = new THREE.AmbientLight(0x888888);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);

      // Configurar câmera
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);

      // Configurar renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);

      // Carregar o STL
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const loader = new STLLoader();
          const geometry = loader.parse(event.target.result);

          // Centralizar geometria
          geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          geometry.boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);

          // Calcular escala para o modelo caber na cena
          const size = new THREE.Vector3();
          geometry.boundingBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);

          // Criar material
          const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(modelColor),
            specular: 0x111111,
            shininess: 100,
          });

          // Criar mesh e adicionar à cena
          const mesh = new THREE.Mesh(geometry, material);

          // Aplicar rotação para visualização isométrica
          mesh.rotation.x = Math.PI * rotation.x;
          mesh.rotation.y = Math.PI * rotation.y;
          mesh.rotation.z = Math.PI * rotation.z;

          scene.add(mesh);

          // Posicionar câmera
          const dist = maxDim * 2;
          camera.position.set(dist, dist, dist);
          camera.lookAt(0, 0, 0);

          // Renderizar cena
          renderer.render(scene, camera);

          // Obter Data URL
          const dataUrl = canvas.toDataURL("image/png");

          // Limpar recursos
          geometry.dispose();
          material.dispose();
          renderer.dispose();

          resolve(dataUrl);
        } catch (error) {
          console.error("Erro ao processar STL:", error);
          reject(error);
        }
      };

      reader.onerror = function (error) {
        console.error("Erro ao ler arquivo:", error);
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Erro ao gerar thumbnail:", error);
      reject(error);
    }
  });
}

/**
 * Calcula informações sobre o modelo STL (volume, área de superfície, etc.)
 * @param {File} file - O arquivo STL
 * @returns {Promise<Object>} Informações sobre o modelo
 */
export async function getSTLInfo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const loader = new STLLoader();
        const geometry = loader.parse(event.target.result);

        // Calcular dimensões
        geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);

        // Calcular número de triângulos
        const triangleCount = geometry.attributes.position.count / 3;

        // Calcular volume aproximado (mm³)
        const volume = calculateVolume(geometry);

        // Calcular área de superfície (mm²)
        const surfaceArea = calculateSurfaceArea(geometry);

        // Limpar recursos
        geometry.dispose();

        resolve({
          dimensions: {
            width: size.x.toFixed(2),
            height: size.y.toFixed(2),
            depth: size.z.toFixed(2),
          },
          triangles: triangleCount,
          volume: (volume / 1000).toFixed(2), // Converter para cm³
          surfaceArea: surfaceArea.toFixed(2),
          estimatedWeight: {
            // Densidades aproximadas em g/cm³
            PLA: ((volume / 1000) * 1.24).toFixed(2),
            ABS: ((volume / 1000) * 1.04).toFixed(2),
            PETG: ((volume / 1000) * 1.27).toFixed(2),
            TPU: ((volume / 1000) * 1.21).toFixed(2),
            Nylon: ((volume / 1000) * 1.14).toFixed(2),
          },
        });
      } catch (error) {
        console.error("Erro ao analisar STL:", error);
        reject(error);
      }
    };

    reader.onerror = function (error) {
      console.error("Erro ao ler arquivo:", error);
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

// Função auxiliar para calcular volume
function calculateVolume(geometry) {
  let volume = 0;
  const positions = geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 9) {
    const v1 = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    );
    const v2 = new THREE.Vector3(
      positions[i + 3],
      positions[i + 4],
      positions[i + 5]
    );
    const v3 = new THREE.Vector3(
      positions[i + 6],
      positions[i + 7],
      positions[i + 8]
    );

    // Fórmula do volume do tetraedro
    const tetraVolume = v1.dot(new THREE.Vector3().crossVectors(v2, v3)) / 6.0;
    volume += Math.abs(tetraVolume);
  }

  return volume;
}

// Função auxiliar para calcular área de superfície
function calculateSurfaceArea(geometry) {
  let area = 0;
  const positions = geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 9) {
    const v1 = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    );
    const v2 = new THREE.Vector3(
      positions[i + 3],
      positions[i + 4],
      positions[i + 5]
    );
    const v3 = new THREE.Vector3(
      positions[i + 6],
      positions[i + 7],
      positions[i + 8]
    );

    // Calcular vetor área do triângulo
    const side1 = new THREE.Vector3().subVectors(v2, v1);
    const side2 = new THREE.Vector3().subVectors(v3, v1);
    const triangleArea =
      new THREE.Vector3().crossVectors(side1, side2).length() / 2;

    area += triangleArea;
  }

  return area;
}
