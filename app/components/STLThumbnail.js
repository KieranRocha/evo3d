"use client";
// app/components/STLThumbnail.js
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";

/**
 * Componente leve para exibir thumbnails de STL
 * @param {Object} props - Propriedades do componente
 * @param {string} props.fileId - ID do arquivo no Redux (opcional)
 * @param {string} props.dataUrl - Data URL da thumbnail (opcional)
 * @param {File} props.file - Arquivo STL para gerar thumbnail (opcional)
 */
export default function STLThumbnail({
  fileId,
  dataUrl,
  file,
  className = "w-full h-full",
  width = 64,
  height = 64,
  alt = "STL Preview",
}) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localThumbnail, setLocalThumbnail] = useState(null);

  // Buscar do Redux store
  const storedFile = useSelector((state) =>
    fileId ? state.fileStorage.files[fileId] : null
  );

  // Thumbnail do Redux
  const storedThumbnail = useSelector((state) => {
    // Primeiro verificamos se existe no fileStorage
    if (fileId && state.fileStorage.files[fileId]?.thumbnailDataUrl) {
      return state.fileStorage.files[fileId].thumbnailDataUrl;
    }
    // Depois verificamos no thumbnailSlice tradicional
    if (fileId && state.thumbnails?.cachedThumbnails?.[fileId]) {
      return state.thumbnails.cachedThumbnails[fileId];
    }
    return null;
  });

  // Escolhe a melhor fonte disponível para a thumbnail
  const thumbnailSource = dataUrl || storedThumbnail || localThumbnail;

  // Gerar thumbnail se tiver arquivo e não tiver thumbnail
  useEffect(() => {
    // Se já temos uma thumbnail, não precisamos gerar
    if (thumbnailSource || !file) return;

    const generateThumbnail = async () => {
      setLoading(true);
      setError(null);
      try {
        // Importar de forma dinâmica para reduzir o impacto no bundle
        const { generateSTLThumbnail } = await import(
          "../utils/thumbnailUtils"
        );
        const thumbnail = await generateSTLThumbnail(file, { width, height });
        setLocalThumbnail(thumbnail);
      } catch (err) {
        console.error("Erro ao gerar thumbnail:", err);
        setError("Falha ao gerar preview");
      } finally {
        setLoading(false);
      }
    };

    generateThumbnail();
  }, [file, thumbnailSource, width, height]);

  // Se temos erro, mostramos uma mensagem
  if (error) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-red-50 text-red-500 text-xs p-1 text-center`}
      >
        {error}
      </div>
    );
  }

  // Se estamos carregando, mostramos um indicador
  if (loading) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100`}
      >
        <div className="animate-pulse bg-gray-200 w-3/4 h-3/4 rounded" />
      </div>
    );
  }

  // Se temos uma thumbnail, mostramos ela
  if (thumbnailSource) {
    return (
      <div className={className}>
        <img
          src={thumbnailSource}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Fallback quando não temos nada
  return (
    <div
      className={`${className} flex items-center justify-center bg-gray-100 text-gray-400 text-xs`}
    >
      STL
    </div>
  );
}
