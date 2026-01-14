"use client"
import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import logo from "@/assets/logo.png"
import logo2 from "@/assets/logo2.png"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [usuario, setUsuario] = useState('')
    const [senha, setSenha] = useState('')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        const savedUser = localStorage.getItem("usuarioLogado")
        if (savedUser) {
            startTransition(() => {
                router.push("/")
            })
        }
    }, [router])

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/login', {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ usuario, senha }),
            })

            const data = await res.json()

            if (data.error) {
                setError(data.error)
            } else {
                localStorage.setItem("usuarioLogado", JSON.stringify(data.user))
                document.cookie = `usuarioLogado=${encodeURIComponent(JSON.stringify(data.user))}; path=/`

                startTransition(() => {
                    router.push("/")
                })
            }
        } catch (err) {
            setError("Não foi possível conectar ao servidor. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading || isPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
                <Image src={logo2} alt="Logo" className="w-[80px] h-[80px] mb-4 animate-pulse" />
            </div>
        )
    }
    return (
        <>
            <main className='flex flex-col justify-center items-center min-h-[97vh]'>
                <a className='md:min-w-40 min-w-20' href='./'>
                    <Image src={logo} alt='Logo' className='logo w-[290] h-[270]' />
                </a>

                <div className='flex flex-col items-center justify-center md:min-h-2/5 min-h-60 p-[1em]'>

                    <form className='flex flex-col justify-center items-center gap-5' onSubmit={handleLogin}>
                        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                        <input
                            className='md:w-[580] w-[300] h-14 text-gray-300 text-xl p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500'
                            type="text"
                            name="name"
                            value={usuario.toLowerCase() || ""}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Digite seu nome de usuário"
                            required />

                        <div className="relative ">
                            <input
                                className='md:w-[580] w-[300] h-14 text-gray-300 text-xl p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={senha.toLowerCase() || ""}
                                onChange={(e) => setSenha(e.target.value.trim())}
                                placeholder="Digite sua senha"
                                required />

                            {senha.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
                                    {
                                        showPassword
                                            ? <EyeOff size={22} />
                                            : <Eye size={22} />
                                    }
                                </button>
                            )}
                        </div>

                        <button
                            className='bg-slate-700 text-white px-8 rounded-2xl font-semibold shadow-lg hover:hover:bg-slate-600 transition-colors duration-300 text-lg w-[300] h-12'
                            disabled={isLoading}>
                            Entrar
                        </button>
                    </form>

                </div>

            </main>
        </>
    )
}
