"use client"
import React, { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import logo from "@/assets/logo2.png"
import { ChevronDown, ChevronUp, Edit, Plus, Save, X } from "lucide-react"
import Modal from "../components/modal"

export default function ProdutoPage() {
    const [produtos, setProdutos] = useState([])
    const [editando, setEditando] = useState(null)

    const [nome, setNome] = useState("")
    const [nomeBusca, setNomeBusca] = useState("")
    const [tipo, setTipo] = useState("")
    const [tipoBusca, setTipoBusca] = useState("")
    const [quantidade, setQuantidade] = useState(0)
    const [quantidadeBusca, setQuantidadeBusca] = useState(true)

    const [usuarioLogado, setUsuarioLogado] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [expanded, setExpanded] = useState({})
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const [notification, setNotification] = useState({ text: '', type: '' })

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
        setNome("")
        setTipo("")
        setQuantidade(0)
        setEditando(null)
    }

    useEffect(() => {
        const userData = localStorage.getItem("usuarioLogado")
        if (userData) {
            setUsuarioLogado(JSON.parse(userData))
        } else {
            startTransition(() => {
                router.push("/login")
            });
        }

        const fetchData = async () => {
            setIsLoading(true);
            await buscarProdutos()
            setIsLoading(false)
        };
        fetchData()
    }, [router])

    const buscarProdutos = async () => {
        const params = new URLSearchParams()

        if (nomeBusca) {
            params.append("nome", nomeBusca)
        }
        if (tipoBusca) {
            params.append("tipo", tipoBusca)
        }
        if (quantidadeBusca) {
            params.append("quantidade", quantidadeBusca)
        }

        const url = params.toString()
            ? `/api/produtos?${params.toString()}`
            : "/api/produtos"

        const res = await fetch(url)
        const data = await res.json()
        setProdutos(data)
    }

    useEffect(() => {
        buscarProdutos()
    }, [nomeBusca, tipoBusca, quantidadeBusca])

    const produtosFiltrados = quantidadeBusca
        ? produtos.filter((s) => s.quantidade > 0)
        : produtos

    const toggleExpand = async (produto) => {
        setExpanded((prev) => {
            const isOpen = prev[produto.id]?.open
            if (isOpen) return { ...prev, [produto.id]: { open: false, movimentos: [] } }
            return { ...prev, [produto.id]: { open: true, movimentos: [] } }
        })

        if (!expanded[produto.id]?.open) {
            try {
                const res = await fetch(`/api/movimentos?produto_id=${produto.id}`)
                const data = await res.json()
                setExpanded((prev) => ({
                    ...prev,
                    [produto.id]: { open: true, movimentos: Array.isArray(data) ? data : [] },
                }))
            } catch {
                setExpanded((prev) => ({
                    ...prev,
                    [produto.id]: { open: true, movimentos: [] }
                }))
            }
        }
    }

    const salvarProduto = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        let url = "/api/produtos"
        let method = editando ? "PUT" : "POST"

        const body = editando
            ? { id: editando, nome, tipo, quantidade }
            : { nome, tipo, quantidade }

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok || data.error) {
                showNotification("Erro: " + (data.error || "Falha ao salvar produto."), "error")
                return
            }

            showNotification(
                editando ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!",
                "success"
            )

            buscarProdutos()

        } catch (err) {
            showNotification("Erro inesperado ao salvar produto.", "error")
            // console.error("Erro ao salvar produto:", err)
        } finally {
            setIsLoading(false);
        }
    }

    const editarProduto = (p) => {
        setIsModalOpen(true)
        setEditando(p.id)
        setNome(p.nome)
        setTipo(p.tipo)
        setQuantidade(p.quantidade)
    }

    const limparCamposBusca = () => {
        setNomeBusca("")
        setTipoBusca("")
    }

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
                    title={editando ? 'Editar Produto' : 'Adicionar novo Produto'}>

                    <form onSubmit={salvarProduto} className="space-y-4">
                        <div className="grid grid-cols-2 gap-6 text-gray-200">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                                <input
                                    type="text"
                                    value={nome}
                                    placeholder="Ex.: Toner de Impressora"
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm placeholder-slate-400"
                                />
                            </div>
                            {/*<div>*/}
                            {/*    <label className="block text-sm font-medium mb-1">Tipo</label>*/}
                            {/*    <input*/}
                            {/*        type="text"*/}
                            {/*        value={tipo}*/}
                            {/*        placeholder="Ex.: Toner"*/}
                            {/*        onChange={(e) => setTipo(e.target.value)}*/}
                            {/*        className="w-full p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm placeholder-slate-400"*/}
                            {/*    />*/}
                            {/*</div>*/}
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantidade</label>
                                <input
                                    disabled={editando}
                                    type="text"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(e.target.value)}
                                    className="w-full p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={handleFecharModal}
                                className="bg-slate-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-500">
                                Cancelar
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
                                        Adicionar Produto
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>

                <div className="flex items-center space-x-4 logo">
                    <Image src={logo} alt="Logo" className="w-[60px] h-[60px]" />
                    <h1 className="text-xl font-bold text-white hidden sm:block">
                        Cadastro de produtos
                    </h1>
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="bg-slate-700 text-gray-200 px-8 rounded-lg font-semibold hover:bg-slate-600 transition-colors h-12 cursor-pointer">
                    Voltar
                </button>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">

                <h2 className="text-xl font-bold text-slate-100 mb-6">
                    Buscar Produtos
                </h2>

                <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome:</label>
                    <input
                        type="text"
                        value={nomeBusca}
                        placeholder="Buscar por nome..."
                        onChange={(e) => setNomeBusca(e.target.value)}
                        className="w-[450] p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm placeholder-slate-400 mr-2"
                    />

                    {/*<label className="block text-sm font-medium text-gray-300 mb-1">Tipo:</label>*/}
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    value={tipoBusca}*/}
                    {/*    placeholder="Buscar por tipo..."*/}
                    {/*    onChange={(e) => setTipoBusca(e.target.value)}*/}
                    {/*    className="w-[150] p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm placeholder-slate-400"*/}
                    {/*/>*/}

                    <button type="button" onClick={() => limparCamposBusca()}
                        className="text-red-800 hover:text-red-900 cursor-pointer">
                        <X />
                    </button>

                </div>

                <div className="flex justify-end items-center pt-4 gap-10">
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            id="filtroSugestoes"
                            checked={quantidadeBusca}
                            onChange={(e) => setQuantidadeBusca(e.target.checked)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer" />
                        <label htmlFor="filtroSugestoes" className="pl-2 cursor-pointer">Exibir somente Quantidade
                            maior que 0.</label>
                    </div>
                    <button onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700">
                        <Plus className="w-5 h-5" /> Cadastrar Produto
                    </button>
                </div>

            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className=" flex justify-between gap-9 p-6">
                    <h3 className="text-lg font-semibold text-gray-200">Produtos</h3>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-700 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase ps-10">Nome</th>
                            {/*<th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase">Tipo</th>*/}
                            <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Quantidade</th>
                            <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {produtosFiltrados.map((p) => (
                            <React.Fragment key={p.id}>
                                <tr
                                    onClick={() => toggleExpand(p)}
                                    className="hover:bg-slate-700/50 cursor-pointer">

                                    <td className="px-6 py-4 font-medium text-slate-100 ps-10">{p.nome?.toUpperCase()}</td>
                                    {/*<td className="px-6 py-4 text-slate-300">{p.tipo}</td>*/}
                                    <td className="px-6 py-4 text-slate-300 text-center">{p.quantidade}</td>
                                    <td className="px-6 py-4 justify-end pe-10 flex space-x-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                editarProduto(p)
                                            }}
                                            className="text-blue-400 hover:text-blue-300 cursor-pointer flex justify-end gap-6">
                                            <Edit />
                                            {expanded[p.id]?.open ? (
                                                <ChevronUp className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            )}
                                        </button>
                                    </td>
                                </tr>

                                {expanded[p.id]?.open && (
                                    <tr>
                                        <td colSpan={5} className="bg-slate-900 px-6 py-4">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-semibold text-slate-300">
                                                    Histórico de Movimentações
                                                </h4>
                                                <div
                                                    className="scroll-container max-h-40 overflow-y-auto rounded-lg border border-slate-700">
                                                    <table className="min-w-full text-sm text-slate-300">
                                                        <thead className="bg-slate-800 sticky top-0">
                                                            <tr>
                                                                <th className="px-4 py-2 text-sm uppercase">Data</th>
                                                                <th className="px-4 py-2 text-sm uppercase">Tipo</th>
                                                                <th className="px-4 py-2 text-sm uppercase">Quantidade</th>
                                                                <th className="px-4 py-2 text-sm uppercase">Operador</th>
                                                                <th className="px-4 py-2 text-sm uppercase">Observação</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {expanded[p.id]?.movimentos?.length > 0 ? (
                                                                expanded[p.id].movimentos.map((m, idx) => (
                                                                    <tr
                                                                        key={idx}
                                                                        className="border-b border-slate-800 hover:bg-slate-800/50 transition">

                                                                        <td className="px-4 py-3 text-slate-300">
                                                                            {new Date(m.created_at).toLocaleString("pt-BR", {
                                                                                day: "2-digit",
                                                                                month: "2-digit",
                                                                                year: "numeric",
                                                                            })}
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span
                                                                                className={`p-2 text-xs font-semibold rounded-xl ${m.tipo === "Entrada"
                                                                                        ? "bg-green-500/20 text-green-400"
                                                                                        : "bg-red-500/20 text-red-400"
                                                                                    }`}>
                                                                                {m.tipo?.toUpperCase()}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-slate-300">{m.quantidade}</td>
                                                                        <td className="px-4 py-2 text-slate-300">
                                                                            {m.usuarios?.nome.toUpperCase() || "—"}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-slate-300">
                                                                            {m.observacao?.toUpperCase()}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={5}
                                                                        className="px-6 py-4 text-center text-slate-400">
                                                                        Nenhum movimento encontrado
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
