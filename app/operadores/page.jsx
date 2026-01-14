"use client"
import { useEffect, useState, useTransition } from "react"
import logo from "@/assets/logo2.png"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Edit, Plus, Save, X } from "lucide-react"
import Modal from "@/app/components/modal";

export default function OperadoresPage() {
    const [operadores, setOperadores] = useState([])
    const [editando, setEditando] = useState(false)

    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const [nome, setNome] = useState("")
    const [nomeBusca, setNomeBusca] = useState("")

    const [status, setStatus] = useState("Ativo")
    const [statusBusca, setStatusBusca] = useState("")

    const [usuarioLogado, setUsuarioLogado] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const [notification, setNotification] = useState({ text: '', type: '' })
    const [isModalOpen, setIsModalOpen] = useState(false)

    const showNotification = (text, type, duration = 2000) => {
        setNotification({ text, type });
        if (type !== 'isLoading') {
            setTimeout(() => {
                setNotification({ text: '', type: 'info' })
            }, duration)
        }
    }

    const handleFecharModal = () => {
        setIsModalOpen(false)
        setUsuario('')
        setSenha('')
        setNome('')

        setStatus('Ativo')
    }

    const limparCamposBusca = () => {
        setNomeBusca('')

        setStatusBusca('')
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

        const fetchData = async () => {
            setIsLoading(true)
            await Promise.all([buscarOperadores()])
            setIsLoading(false)
        }
        fetchData()
    }, [router])

    const buscarOperadores = async () => {
        const params = new URLSearchParams()

        if (nomeBusca) {
            params.append("nome", nomeBusca)
        }
        if (statusBusca) {
            params.append("status", statusBusca)
        }


        const url = params.toString()
            ? `api/operadores?${params.toString()}`
            : 'api/operadores'

        const res = await fetch(url)
        const data = await res.json()
        setOperadores(data)
    }

    useEffect(() => {
        buscarOperadores()
    }, [nomeBusca, statusBusca])

    const salvarOperador = async (e) => {
        e.preventDefault()

        let url = "/api/operadores"
        let method = editando ? "PUT" : "POST"

        const body = editando
            ? { id: editando, usuario, senha, nome, status }
            : { usuario, senha, nome, status }

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok || data.error) {
                showNotification("Erro: " + (data.error || "Falha ao salvar operador."), "error")
                return
            }

            showNotification(
                editando ? "Operador atualizado com sucesso!" : "Operador cadastrado com sucesso!",
                "success"
            )

            buscarOperadores()
            handleFecharModal()

        } catch (err) {
            showNotification("Erro inesperado ao salvar operador.", "error")
            // console.error("Erro ao salvar operador:", err)
        }
    }

    const editarOperador = (op) => {
        setIsModalOpen(true)
        setEditando(op.id)
        setUsuario(op.usuario)
        setNome(op.nome)

        setSenha("")
        setStatus(op.status)
    }

    console.log('TIPO DE OPERADORES:', typeof operadores);
    console.log('VALOR DE OPERADORES:', operadores);


    if (isLoading || isPending || !usuarioLogado) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
                <Image src={logo} alt="Logo" className="w-[80px] h-[80px] mb-4 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="min-h-screen text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">

                {notification.text && (
                    <div
                        className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-[9999]
                    ${notification.type === 'success' ? 'bg-green-600' : ''}
                    ${notification.type === 'error' ? 'bg-red-600' : ''}`}>

                        {notification.text}
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleFecharModal}
                    title={editando ? 'Editar Operador' : 'Adicionar novo Operador'}>

                    <form onSubmit={salvarOperador} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="nome"
                                    className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                                <input
                                    id="nome"
                                    type="text"
                                    placeholder="Nome Completo"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full p-2 bg-slate-700 border-slate-600 text-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-300"
                                />
                            </div>

                            <div>
                                <label htmlFor="usuario"
                                    className="block text-sm font-medium text-gray-300 mb-1">Usuário</label>
                                <input
                                    id="usuario"
                                    type="text"
                                    placeholder="Nome do Usuário"
                                    value={usuario.toLowerCase()}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    className="w-full p-2 bg-slate-700 border-slate-600 text-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-300"
                                />
                            </div>

                            <div>
                                <label htmlFor="senha"
                                    className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                                <input
                                    id="senha"
                                    type="password"
                                    placeholder={editando ? "Alterar senha (Deixar em branco para não alterar)" : "Senha forte"}
                                    value={senha.toLowerCase()}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full p-2 bg-slate-700 border-slate-600 text-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-300"
                                />
                            </div>

                            <div>
                                <label htmlFor="status"
                                    className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full p-2.5 bg-slate-700 border-slate-600 text-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 cursor-pointer">

                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>
                            </div>


                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleFecharModal}
                                className="bg-slate-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-500">Cancelar
                            </button>

                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 cursor-pointer">
                                {editando ? (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Salvar Alterações
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Adicionar Operador
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>

                <div className="flex items-center space-x-4 logo">
                    <Image src={logo} alt="Logo" className="w-[60px] h-[60px]" />
                    <span className="text-xl font-bold text-white hidden sm:block">Gerenciar Operadores</span>
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="bg-slate-700 text-gray-200 px-8 rounded-lg font-semibold hover:bg-slate-600 transition-colors h-12 cursor-pointer">
                    Voltar
                </button>

            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-slate-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-6">Buscar Operador</h3>

                <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome:</label>
                    <input
                        type="text"
                        value={nomeBusca}
                        placeholder="Buscar por nome:"
                        onChange={(e) => setNomeBusca(e.target.value)}
                        className="w-[400] p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm placeholder-slate-400 mr-2"
                    />

                    <label className="block text-sm font-medium text-gray-300 mb-1">Status:</label>
                    <select
                        id="status"
                        value={statusBusca}
                        onChange={(e) => setStatusBusca(e.target.value)}
                        className=" mr-2 w-[150] p-2.5 bg-slate-700 border-slate-600 text-gray-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 cursor-pointer">

                        <option value="">Todos</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </select>



                    <button type="button" onClick={() => limparCamposBusca()}
                        className="text-red-800 hover:text-red-900 cursor-pointer">
                        <X />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

                    <div className="md:col-span-3 flex justify-end pt-4">
                        <button onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700">
                            <Plus className="w-5 h-5" /> Cadastrar Operador
                        </button>
                    </div>
                </div>

            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">

                <div className=" flex justify-items-start gap-9 p-6">
                    <h3 className="text-lg font-semibold text-gray-200">Operadores</h3>
                </div>

                <table className="w-full text-left">

                    <thead className="bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase">Nome</th>
                            <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase">Usuário</th>

                            <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-700">
                        {operadores.map((op) => (
                            <tr key={op.id} className="hover:bg-slate-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-white">{op.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{op.usuario}</td>


                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`p-2 text-xs font-semibold rounded-xl ${op.status === "Ativo"
                                            ? "bg-green-500/20 text-green-300"
                                            : "bg-red-500/20 text-red-300"
                                            }`}>

                                        {op.status.toUpperCase()}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => editarOperador(op)}
                                        className="text-blue-400 hover:text-blue-300 mr-4 cursor-pointer">
                                        <Edit />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
