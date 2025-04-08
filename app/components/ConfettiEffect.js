"use client";

import React, { useEffect, useRef } from "react";

/**
 * Componente que cria um efeito de confete na tela
 * Utiliza canvas para desenhar partículas coloridas que caem
 */
const ConfettiEffect = ({ duration = 3000 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajusta o tamanho do canvas para preencher a tela
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Cria as partículas do confete
    const confettiCount = Math.floor(canvas.width / 15); // Número de confetes baseado na largura da tela
    const confetti = [];

    const colors = [
      "#00c3ff", // Azul claro
      "#2979ff", // Azul
      "#5e35b1", // Roxo
      "#43a047", // Verde
      "#fdd835", // Amarelo
      "#ff9800", // Laranja
      "#f44336", // Vermelho
      "#e91e63", // Rosa
    ];

    // Inicializa as partículas de confete
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * canvas.width, // Posição X aleatória
        y: Math.random() * canvas.height * -1, // Começa acima da área visível
        size: Math.random() * 8 + 6, // Tamanho entre 6 e 14px
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, // Rotação inicial
        rotationSpeed: (Math.random() - 0.5) * 5, // Velocidade de rotação
        speedY: Math.random() * 3 + 2, // Velocidade de queda
        speedX: (Math.random() - 0.5) * 2, // Movimento lateral
        shape: Math.random() > 0.5 ? "rect" : "circle", // Forma da partícula
      });
    }

    // Função de animação
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((particle) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);

        ctx.fillStyle = particle.color;

        if (particle.shape === "rect") {
          ctx.fillRect(
            -particle.size / 2,
            -particle.size / 4,
            particle.size,
            particle.size / 2
          );
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Atualiza a posição
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        particle.rotation += particle.rotationSpeed;

        // Pequeno efeito de oscilação
        particle.speedX += (Math.random() - 0.5) * 0.2;

        // Reseta quando sai da tela
        if (particle.y > canvas.height) {
          particle.y = Math.random() * canvas.height * -0.2 - 50;
          particle.x = Math.random() * canvas.width;
          particle.speedX = (Math.random() - 0.5) * 2;
        }

        // Mantém dentro da tela horizontalmente
        if (particle.x > canvas.width || particle.x < 0) {
          particle.speedX *= -0.8; // Inverte e reduz a velocidade
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Inicia a animação
    animate();

    // Finaliza após a duração especificada
    const timer = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }, duration);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 0.7 }}
    />
  );
};

export default ConfettiEffect;
