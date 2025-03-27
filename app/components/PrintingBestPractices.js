// components/PrintingBestPractices.jsx
import React, { useState } from "react";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
  FileText,
  Layers,
  Ruler,
  PenToolIcon,
} from "lucide-react";

const PrintingBestPractices = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setExpandedSection(null);
  };

  const bestPracticesSections = [
    {
      id: "wall-thickness",
      icon: <Layers size={20} />,
      title: "Espessura de paredes adequada",
      content: (
        <div>
          <p className="mb-3">
            Paredes muito finas podem quebrar durante ou após a impressão.
            Recomendamos:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>PLA/PETG: mínimo de 1.2mm de espessura</li>
            <li>ABS: mínimo de 1.5mm de espessura</li>
            <li>TPU/Flexível: mínimo de 2mm de espessura</li>
          </ul>
          <div className="mt-3 bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Para peças funcionais que precisam suportar
              peso ou tensão, considere espessuras entre 2mm e 3mm.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "overhangs",
      icon: <Maximize size={20} />,
      title: "Ângulos e balanços (overhangs)",
      content: (
        <div>
          <p className="mb-3">
            Ângulos muito pronunciados podem necessitar de suportes, o que pode
            afetar o acabamento da superfície.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ângulos até 45° geralmente imprimem bem sem suportes</li>
            <li>Entre 45° e 60° podem apresentar qualidade reduzida</li>
            <li>Acima de 60° geralmente necessitam de suportes</li>
          </ul>
          <div className="mt-3 bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Se possível, projete seu modelo para
              minimizar áreas em balanço ou posicione-o de forma a minimizar a
              necessidade de suportes.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "tolerances",
      icon: <Ruler size={20} />,
      title: "Tolerâncias para peças encaixáveis",
      content: (
        <div>
          <p className="mb-3">
            Ao projetar peças que devem encaixar umas nas outras, considere as
            tolerâncias:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Encaixe justo: folga de 0.1mm a 0.2mm</li>
            <li>Encaixe médio: folga de 0.3mm a 0.4mm</li>
            <li>Encaixe livre: folga de 0.5mm ou mais</li>
          </ul>
          <div className="mt-3 bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Para primeiras impressões, use tolerâncias
              maiores e ajuste conforme necessário em iterações posteriores.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "model-integrity",
      icon: <FileText size={20} />,
      title: "Integridade do modelo 3D",
      content: (
        <div>
          <p className="mb-3">
            Modelos 3D devem ser &quot;watertight&quot; (herméticos) para
            imprimir corretamente:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verifique se o modelo não tem buracos não intencionais</li>
            <li>Certifique-se que todas as faces têm normais consistentes</li>
            <li>Corrija mesh não-manifold antes de enviar para impressão</li>
          </ul>
          <div className="mt-3 flex items-start space-x-2">
            <CheckCircle
              size={20}
              className="text-green-600 mt-0.5 flex-shrink-0"
            />
            <p className="text-sm text-green-800">
              Nossa ferramenta de verificação automática ajudará a identificar
              problemas de integridade no seu modelo.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "post-processing",
      icon: <PenToolIcon size={20} />,
      title: "Considerações para pós-processamento",
      content: (
        <div>
          <p className="mb-3">
            Se você planeja lixar, pintar ou fazer outros acabamentos:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Adicione 0.2mm a 0.5mm a dimensões críticas para compensar
              material removido no lixamento
            </li>
            <li>
              Para modelos que serão pintados, preenchimento maior que 20% é
              recomendado para resistir à pressão de lixamento
            </li>
            <li>
              Considere orientação das camadas para obter o melhor acabamento
              nas superfícies visíveis
            </li>
          </ul>
          <div className="mt-3 bg-yellow-50 p-3 rounded-md">
            <p className="text-sm text-yellow-800 flex items-start">
              <AlertTriangle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>
                Peças que serão coladas devem ter superfícies de contato planas
                e área suficiente para uma junção forte.
              </span>
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center">
          <Info size={20} className="mr-2" />
          <h3 className="font-medium">Boas Práticas para Impressão 3D</h3>
        </div>
        <button
          onClick={toggleCollapse}
          className="p-1 hover:bg-white/20 rounded"
          aria-label={isCollapsed ? "Expandir" : "Minimizar"}
        >
          {isCollapsed ? <Maximize size={18} /> : <Minimize size={18} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Seguir estas diretrizes ajudará a garantir que seu modelo seja
            impresso com a melhor qualidade possível. Expanda cada seção para
            mais detalhes.
          </p>

          <div className="space-y-2">
            {bestPracticesSections.map((section) => (
              <div
                key={section.id}
                className="border rounded-md overflow-hidden"
              >
                <button
                  className={`w-full px-4 py-3 flex items-center justify-between text-left ${
                    expandedSection === section.id ? "bg-gray-50" : "bg-white"
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-blue-600">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </button>

                {expandedSection === section.id && (
                  <div className="px-4 py-3 bg-white border-t">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 bg-blue-50 rounded-md p-4 flex items-start">
            <Info
              size={20}
              className="text-blue-600 mr-3 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-blue-800 font-medium">
                Precisa de ajuda com seu modelo?
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Nossa equipe de especialistas pode revisar seu arquivo e sugerir
                melhorias para garantir uma impressão perfeita.
              </p>
              <button className="mt-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded text-sm font-medium">
                Solicitar revisão técnica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintingBestPractices;
