import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "POST");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "PATCH");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, "DELETE");
}

async function proxyRequest(
  request: NextRequest,
  { path }: { path: string[] },
  method: string
) {
  const pathStr = path.join("/");
  // Backend tem GET /health na raiz, não em /api
  let url =
    pathStr === "health"
      ? `${BACKEND_URL}/health`
      : `${BACKEND_URL}/api/${pathStr}`;
  
  // Inclui query parameters na URL
  const searchParams = request.nextUrl.searchParams.toString();
  if (searchParams) {
    url += `?${searchParams}`;
  }
  
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  
  // Garante que Content-Type está definido para requisições com body
  if (method !== "GET" && method !== "DELETE") {
    if (!headers.get("content-type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  try {
    const body = method !== "GET" && method !== "DELETE" ? await request.text() : undefined;
    const res = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });
    
    // Respostas 204 (No Content) não têm corpo
    if (res.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }
    
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isRefused =
      typeof (err as NodeJS.ErrnoException)?.code === "string" &&
      ((err as NodeJS.ErrnoException).code === "ECONNREFUSED" ||
        errorMessage.includes("ECONNREFUSED"));
    if (!isRefused) {
      console.error("Proxy error:", err);
      console.error("Backend URL:", BACKEND_URL, "Request URL:", url);
    }
    const message =
      "Backend offline. Na raiz do projeto execute: npm run backend";
    return NextResponse.json(
      { error: message, backendUrl: BACKEND_URL, code: "BACKEND_UNREACHABLE" },
      { status: 502 }
    );
  }
}
