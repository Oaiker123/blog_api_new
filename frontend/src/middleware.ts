import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // Nếu truy cập /admin mà không có localStorage thì thôi kệ (để client xử lý)
  // => Không redirect ở đây
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // chỉ áp dụng cho route admin
};
