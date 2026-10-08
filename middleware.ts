import { NextRequest, NextResponse } from "next/server";

// Proteksi sederhana: jika DASHBOARD_PASSWORD diisi, browser akan meminta
// kata sandi (nama pengguna bebas). Kosongkan variabel untuk menonaktifkan.
export function middleware(req: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return NextResponse.next();

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const given = decoded.slice(decoded.indexOf(":") + 1);
      if (given === password) return NextResponse.next();
    } catch {
      // abaikan, minta login ulang
    }
  }

  return new NextResponse("Autentikasi diperlukan", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Dashboard Monitoring"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
