"use client";

import React from "react";
import { Trash2, Plus, Minus, CheckCircle2 } from "lucide-react";
import STLThumbnail from "../components/STLThumbnail";

const FileList = ({
  files,
  selectedFileIndex,
  onSelectFile,
  onUpdateQuantity,
  onRemoveFile,
}) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">
        Seus modelos ({files.length})
      </h2>
      <div className="space-y-4">
        {[...files].reverse().map((fileData, reversedIndex) => {
          const originalIndex = files.length - 1 - reversedIndex;
          // Gerar um ID exclusivo para o cache da thumbnail
          const thumbnailId =
            fileData.firebaseId ||
            (fileData.file && fileData.file.name) ||
            `file-${originalIndex}`;

          return (
            <div
              key={originalIndex}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all
                ${
                  selectedFileIndex === originalIndex
                    ? "border-primary shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
              onClick={() => onSelectFile(originalIndex)}
            >
              <div className="flex items-start p-3">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-3 relative">
                  <STLThumbnail
                    url={fileData.url}
                    fileId={thumbnailId}
                    backgroundColor="#ffffff"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className="font-medium text-gray-800 truncate"
                      title={fileData.file.name}
                    >
                      {fileData.file.name}
                    </h3>
                    {fileData.isConfigured && (
                      <CheckCircle2
                        size={16}
                        className="text-green-500 ml-1 flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-1">Qtd:</span>
                      <div className="flex items-center border rounded">
                        <button
                          className="px-1 py-0.5 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(
                              originalIndex,
                              fileData.quantity - 1
                            );
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          className="w-8 text-center border-x py-0.5 text-xs"
                          value={fileData.quantity}
                          min="1"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onUpdateQuantity(
                              originalIndex,
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                        <button
                          className="px-1 py-0.5 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateQuantity(
                              originalIndex,
                              fileData.quantity + 1
                            );
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <button
                      className="ml-auto text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(originalIndex);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {fileData.isConfigured && (
                <div
                  className="px-3 pb-3 text-xs text-gray-600 grid items-center gap-2"
                  style={{ gridTemplateColumns: "30% 20% 25% 25%" }}
                >
                  <div className="">
                    <span className="font-medium block">Preenchimento:</span>
                    <span>{fileData.fill?.name}</span>
                  </div>
                  <div className="">
                    <span className="font-medium block">Material:</span>
                    <span>{fileData.material?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium block">Cor:</span>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-1 border border-gray-300"
                        style={{
                          backgroundColor: fileData.color?.value,
                        }}
                      ></div>
                      <span>{fileData.color?.name}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium block">Valor:</span>
                    <span>R$ {fileData.material?.calculatedPrice}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;
