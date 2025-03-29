// app/api/proxy-file/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`Proxying file: ${fileUrl}`);

    // Fazer a requisição ao Firebase Storage
    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error(
        `Proxy error: Failed to fetch file, status: ${response.status}`
      );
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Obter o conteúdo do arquivo como array buffer
    const fileBuffer = await response.arrayBuffer();

    // Criar uma nova resposta com o conteúdo do arquivo
    const newResponse = new NextResponse(fileBuffer);

    // Copiar os headers de content-type da resposta original
    const contentType = response.headers.get("content-type");
    if (contentType) {
      newResponse.headers.set("content-type", contentType);
    }

    // Definir headers de cache para melhorar performance
    newResponse.headers.set("Cache-Control", "public, max-age=86400"); // Cache por 1 dia

    return newResponse;
  } catch (error) {
    console.error("Error proxying file:", error);
    return NextResponse.json(
      { error: "Failed to fetch the file", details: error.message },
      { status: 500 }
    );
  }
}
