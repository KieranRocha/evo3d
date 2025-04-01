// components/STLThumbnailConverter.js
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

/**
 * Converte um arquivo STL em uma imagem thumbnail base64
 * @param {File} file - O arquivo STL
 * @param {object} options - Opções de configuração
 * @returns {Promise<string>} - Promise que resolve para a string base64 da imagem
 */
export const convertSTLToThumbnail = async (file, options = {}) => {
  const {
    width = 200,
    height = 200,
    backgroundColor = "#f5f5f5",
    modelColor = "#3f8cff",
  } = options;

  return new Promise((resolve, reject) => {
    // Cria o renderizador, cena e câmera
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true,
    });

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);

    // Adiciona iluminação
    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Cria um FileReader para ler o arquivo STL
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const stlLoader = new STLLoader();
        const geometry = stlLoader.parse(event.target.result);

        // Centraliza a geometria
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;

        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Dimensões
        const dimensions = {
          width: boundingBox.max.x - boundingBox.min.x,
          height: boundingBox.max.y - boundingBox.min.y,
          depth: boundingBox.max.z - boundingBox.min.z,
        };

        // Cria o material e mesh
        const material = new THREE.MeshPhongMaterial({
          color: modelColor,
          shininess: 100,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Posiciona a câmera para enquadrar o modelo
        const maxDim = Math.max(
          dimensions.width,
          dimensions.height,
          dimensions.depth
        );
        const dist = maxDim * 2;

        camera.position.set(dist * 0.7, dist * 0.5, dist * 0.7);
        camera.lookAt(0, 0, 0);

        // Renderiza a cena
        renderer.render(scene, camera);

        // Converte para base64
        const dataURL = canvas.toDataURL("image/png");

        // Limpa recursos
        geometry.dispose();
        material.dispose();
        renderer.dispose();

        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;

    // Lê o arquivo como ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
};

export default convertSTLToThumbnail;
