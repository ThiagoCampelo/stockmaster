"use client"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import logo from "@/assets/logo2.png"
import Image from "next/image"
import { KeyRound, LogOutIcon } from "lucide-react"
import Modal from "./components/modal"

export default function HomePage() {
    const router = useRouter()

    const [usuarioLogado, setUsuarioLogado] = useState(null)
    const [senha, setSenha] = useState("")

    const [isLoading, setIsLoading] = useState(false);
    const [modalAberto, setModalAberto] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [notification, setNotification] = useState({ text: '', type: '' })

    const showNotification = (text, type, duration = 2000) => {
        setNotification({ text, type });
        if (type !== 'isLoading') {
            setTimeout(() => {
                setNotification({ text: '', type: 'info' })
            }, duration)
        }
    }

    useEffect(() => {
        const userData = localStorage.getItem("usuarioLogado")
        if (userData) {
            setUsuarioLogado(JSON.parse(userData))
        } else {
            startTransition(() => {
                router.push("/login")
            })
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogado")
        document.cookie = "usuarioLogado=; Max-Age=0; path=/"
        startTransition(() => {
            router.push("/login")
        })
    }

    const handleNavigate = (path) => {
        startTransition(() => {
            router.push(path)
        })
    }

    const abrirModal = (usuarioLogado) => {
        setUsuarioLogado(usuarioLogado)
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        setIsLoading(false)
        setSenha("")
    }

    const handleSalvarSenha = async (e) => {
        e.preventDefault()

        if (!senha) {
            showNotification("Por favor, digite uma nova senha.", "error")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/operadores/",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: usuarioLogado.id, senha }),
                })

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Erro ao atualizar senha.")
            }

            showNotification("Senha alterada com sucesso!", "success");
            fecharModal()

        } catch (error) {
            showNotification(`Erro ao alterar a senha:, ${error}`, "error")
        } finally {
            setIsLoading(false)
        }
    }

    if (!usuarioLogado || isPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Image src={logo} alt="Logo" className="w-[80px] h-[80px] mb-4 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen p-5 flex flex-col text-gray-200">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Image src={logo} alt="Logo" width={60} height={60} />
                    <span className="text-xl font-bold text-gray-300">StockMaster</span>
                </div>
                <h1 className="text-xl font-bold text-gray-300">
                    Bem-vindo, <span className="text-blue-500">{usuarioLogado.nome || usuarioLogado.usuario}</span>
                </h1>
            </div>

            {notification.text && (
                <div
                    className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-[9999]
                    ${notification.type === 'success' ? 'bg-green-600' : ''}
                    ${notification.type === 'error' ? 'bg-red-600' : ''}`}>

                    {notification.text}
                </div>
            )}

            <div className="flex-grow flex items-center justify-center">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                    <div
                        onClick={() => handleNavigate("/produtos")}
                        className="cursor-pointer flex flex-col items-center justify-center p-8 bg-slate-700 border border-slate-600 rounded-lg shadow-md aspect-square hover:bg-slate-600 transition-colors duration-300 text-center">
                        <h2 className="text-2xl font-semibold text-white">Gerenciar Produtos</h2>
                        <p className="text-gray-300 mt-2 text-sm">Adicione, edite e visualize produtos.</p>
                    </div>

                    <div
                        onClick={() => handleNavigate("/movimentos")}
                        className="cursor-pointer flex flex-col items-center justify-center p-8 bg-slate-700 border border-slate-600 rounded-lg shadow-md aspect-square hover:bg-slate-600 transition-colors duration-300 text-center">
                        <h2 className="text-2xl font-semibold text-white">Entradas / Saídas</h2>
                        <p className="text-gray-300 mt-2 text-sm">Registre e acompanhe movimentos.</p>
                    </div>

                    <div
                        onClick={() => handleNavigate("/sugestaocompras")}
                        className="cursor-pointer flex flex-col items-center justify-center p-8 bg-slate-700 border border-slate-600 rounded-lg shadow-md aspect-square hover:bg-slate-600 transition-colors duration-300 text-center">
                        <h2 className="text-2xl font-semibold text-white">Sugestão de Compras</h2>
                        <p className="text-gray-300 mt-2 text-sm">Análise e sugestão de compras de produtos.</p>
                    </div>

                    <div
                        onClick={() => handleNavigate("/operadores")}
                        className="cursor-pointer flex flex-col items-center justify-center p-8 bg-slate-700 border border-slate-600 rounded-lg shadow-md aspect-square hover:bg-slate-600 transition-colors duration-300 text-center">
                        <h2 className="text-2xl font-semibold text-white">Gerenciar Operadores</h2>
                        <p className="text-gray-300 mt-2 text-sm">Adicione ou remova usuários.</p>
                    </div>
                </div>
            </div>

            <div className="w-full flex justify-center mt-8 gap-3">
                <button
                    onClick={handleLogout}
                    className="bg-slate-700 text-white rounded-lg px-8 font-semibold shadow-lg hover:bg-slate-600 transition-colors duration-300 h-12 w-[300] items-center justify-center flex cursor-pointer gap-2">
                    <LogOutIcon />
                </button>

                <button
                    onClick={() => abrirModal(usuarioLogado)}
                    className="bg-slate-700 text-white rounded-lg px-4 font-semibold shadow-lg hover:bg-slate-600 transition-colors duration-300 h-12 w-16 items-center justify-center flex cursor-pointer">
                    <KeyRound />
                </button>
            </div>

            <Modal
                isOpen={modalAberto}
                onClose={fecharModal}
                title={`Alterar senha de ${usuarioLogado?.nome || ''}`}>

                <form onSubmit={handleSalvarSenha}>
                    <div>
                        <input
                            type="password"
                            value={senha.toLowerCase()}
                            placeholder="Digite sua nova senha"
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full p-2 text-white bg-slate-800 border border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={() => fecharModal()}
                            disabled={isLoading}
                            className="px-4 py-2 font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 cursor-pointer">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'Salvando...' : 'Salvar Senha'}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    )
}