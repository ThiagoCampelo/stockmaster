import { NextResponse } from "next/server"

export function middleware(req) {
    const { pathname } = req.nextUrl

    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/login") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.next()
    }

    const usuarioCookie = req.cookies.get("usuarioLogado")
    if (!usuarioCookie) {
        const url = req.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    let usuario = null
    try {
        usuario = JSON.parse(decodeURIComponent(usuarioCookie.value))
    } catch {
        const url = req.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    if (
        pathname.startsWith("/operadores") ||
        pathname.startsWith("/api/operadores")
    ) {
        if (usuario.role !== "Administradores") {
            const url = req.nextUrl.clone()
            url.pathname = "/"
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
}
