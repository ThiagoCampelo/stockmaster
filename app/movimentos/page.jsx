"use client"
import {useEffect, useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import Image from "next/image"
import logo from "@/assets/logo2.png"
import {PlusCircle, Plus, Save, X, Trash2} from "lucide-react"
import Modal from "@/app/components/modal"

export default function MovimentosPage() {
    const router = useRouter()
    const [movimentos, setMovimentos] = useState([])
    const [produtos, setProdutos] = useState([])

    const [tipo, setTipo] = useState("Entrada")
    const [observacao, setObservacao] = useState('')
    const [usuarioLogado, setUsuarioLogado] = useState(null)

    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    const [filtroTipoMov, setFiltroTipoMov] = useState("Todos")
    const [filtroDataInicio, setFiltroDataInicio] = useState('')
    const [filtroDataFim, setFiltroDataFim] = useState('')
    const [notification, setNotification] = useState({text: '', type: ''})

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [itensTemporarios, setItensTemporarios] = useState([])
    const [modalProdutoId, setModalProdutoId] = useState('')
    const [modalQuantidade, setModalQuantidade] = useState(1)

    const showNotification = (text, type, duration = 2000) => {
        setNotification({text, type});
        if (type !== 'isLoading') {
            setTimeout(() => {
                setNotification({text: '', type: 'info'})
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
        const fetchData = async () => {
            setIsLoading(true)
            await Promise.all([buscarProdutos(), buscarMovimentos()])
            setIsLoading(false)
        }
        fetchData()
    }, [router])

    const handleAddItemAoModal = (e) => {
        e.preventDefault()
        if (!modalProdutoId || modalQuantidade <= 0) {
            showNotification('Selecione um produto e informe uma quantidade válida.', 'alert')
            return
        }

        const itemExistente = itensTemporarios.find(item => item.produto_id === modalProdutoId)

        if (itemExistente) {
            const novosItens = itensTemporarios.map(item =>
                item.produto_id === modalProdutoId
                    ? {...item, quantidade: item.quantidade + parseInt(modalQuantidade)}
                    : item
            )
            setItensTemporarios(novosItens);
        } else {
            const produtoSelecionado = produtos.find(p => p.id === modalProdutoId)
            setItensTemporarios([...itensTemporarios, {
                produto_id: modalProdutoId,
                nome_produto: produtoSelecionado.nome,
                quantidade: parseInt(modalQuantidade),
                observacao: observacao
            }])
        }
        setModalProdutoId('')
        setModalQuantidade(1)
    }

    const handleRemoveItemDoModal = (idParaRemover) => {
        setItensTemporarios(itensTemporarios.filter(item => item.produto_id !== idParaRemover))
    }

    const handleSalvarModal = () => {
        if (itensTemporarios.length === 0) {
            showNotification('Adicione pelo menos um produto.', 'alert')
            return;
        }
        registrarMultiplosMovimentos(itensTemporarios)
        handleFecharModal()
    }

    const handleFecharModal = () => {
        setIsModalOpen(false)
        setItensTemporarios([])
        setModalProdutoId('')
        setModalQuantidade(1)
        setObservacao('')
    }

    const buscarMovimentos = async () => {
        const res = await fetch("/api/movimentos")
        const data = await res.json()
        setMovimentos(Array.isArray(data) ? data : [])
    }

    const buscarProdutos = async () => {
        const res = await fetch("/api/produtos")
        const data = await res.json()
        setProdutos(Array.isArray(data) ? data : [])
    }

    const registrarMultiplosMovimentos = async (itensParaSalvar) => {
        setIsLoading(true)
        const movimentosParaSalvar = itensParaSalvar.map(item => ({
            produto_id: item.produto_id,
            usuario_id: usuarioLogado?.id,
            tipo: tipo,
            quantidade: item.quantidade,
            observacao: observacao,
        }))

        try {
            const res = await fetch("/api/movimentos", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(movimentosParaSalvar),
            })
            const data = await res.json()
            if (!res.ok || data.error) {
                showNotification("Erro: " + (data.error || "Falha ao registrar movimentos."), "error")
                return
            }
            showNotification("Movimentos registrados com sucesso!", "success")
            await Promise.all([buscarMovimentos(), buscarProdutos()]);
            setObservacao('')
            setTipo("Entrada")
        } catch (err) {
            showNotification("Erro inesperado ao registrar movimentos.", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const movimentosFiltrados = movimentos.filter((m) => {
        const filtroTipoOk =
            filtroTipoMov === "Todos" ? true : m.tipo === filtroTipoMov

        if (filtroDataInicio && filtroDataFim) {
            const dataMov = new Date(m.created_at)

            const [anoIni, mesIni, diaIni] = filtroDataInicio.split("-")
            const dataInicio = new Date(Date.UTC(anoIni, mesIni - 1, diaIni, 0, 0, 0))

            const [anoFim, mesFim, diaFim] = filtroDataFim.split("-")
            const dataFim = new Date(Date.UTC(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999))

            const filtroDataOk = dataMov >= dataInicio && dataMov <= dataFim

            return filtroTipoOk && filtroDataOk
        }

        return filtroTipoOk
    })

    const limparCamposBusca = () => {
        setFiltroTipoMov("Todos")
        setFiltroDataInicio("")
        setFiltroDataFim("")
    }

    if (isLoading || isPending || !usuarioLogado) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen ">
                <Image src={logo} alt="Logo" className="w-[80px] h-[80px] mb-4 animate-pulse"/>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">

                {notification.text && (
                    <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-[9999]
                    ${notification.type === 'success' ? 'bg-green-600' : ''}
                    ${notification.type === 'error' ? 'bg-red-600' : ''}
                    ${notification.type === 'alert' ? 'bg-yellow-600' : ''}`}>
                        {notification.text}
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleFecharModal}
                    title="Adicionar Produtos para Movimentação">

                        <form onSubmit={handleAddItemAoModal}
                              className="grid grid-cols-2 items-end text-gray-300 gap-3 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Produto</label>
                                <select value={modalProdutoId}
                                        onChange={(e) => setModalProdutoId(e.target.value)}
                                        className=" w-full p-2 bg-slate-700 rounded-lg">
                                    <option value="">Selecione...</option>
                                    {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo</label>
                                <select value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        className="w-full p-2 bg-slate-700 rounded-lg h-[42px]">
                                    <option>Entrada</option>
                                    <option>Saída</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantidade</label>
                                <input type="text" min="1"
                                       value={modalQuantidade}
                                       onChange={(e) => setModalQuantidade(e.target.value)}
                                       className="w-full p-2 bg-slate-700 rounded-lg"/>
                            </div>
                            <div className="block text-sm font-medium mb-1">
                                <label className="block text-sm font-medium mb-1">Observação</label>
                                <input type="text" value={observacao.toUpperCase()}
                                       onChange={(e) => setObservacao(e.target.value)}
                                       className="w-full p-2 bg-slate-700 rounded-lg h-[50px]"/>
                            </div>
                            <button type="submit"
                                    className="md:col-start-3 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                                <PlusCircle size={20}/> Adicionar
                            </button>
                        </form>

                        <div className="bg-slate-800 rounded-lg p-2 max-h-60 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-700 rounded-md border-b border-slate-700">
                                <tr className='text-sm'>
                                    <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase">Produto</th>
                                    <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Quantidade</th>
                                    <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase"></th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-700">
                                {itensTemporarios.length > 0 ? (
                                    itensTemporarios.map((item) => (
                                        <tr key={item.produto_id} className="border-t hover:bg-slate-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-100">
                                                {item.nome_produto}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-100 text-center">
                                                {item.quantidade}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button onClick={() => handleRemoveItemDoModal(item.produto_id)}
                                                        className="text-red-500 hover:text-red-400">
                                                    <Trash2 size={18}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-6 py-4 text-center text-slate-400"
                                            colSpan={3}>
                                            Nenhum produto encontrado
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end items-center gap-4 pt-4">
                            <button onClick={handleFecharModal}
                                    className="bg-slate-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-500">Cancelar
                            </button>
                            <button onClick={handleSalvarModal}
                                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700">
                                <Save size={20}/> Salvar Movimentações
                            </button>
                        </div>
                </Modal>

                <div className="flex items-center space-x-4 logo">
                    <Image src={logo} alt="Logo" className="w-[60px] h-[60px]"/>

                    <h1 className="text-xl font-bold text-slate-100 hidden sm:block">
                        Movimentações de Estoque
                    </h1>
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="bg-slate-700 text-gray-200 px-8 rounded-lg font-semibold hover:bg-slate-600 transition-colors h-12 cursor-pointer">
                    Voltar
                </button>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-bold mb-6">Buscar Movimentações</h3>

                <div className="flex items-center gap-2">
                    <label htmlFor="FiltroTipo">Tipo de Movimentação: </label>
                    <select value={filtroTipoMov}
                            onChange={(e) => setFiltroTipoMov(e.target.value)}
                            className="w-45 p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm cursor-pointer mr-2">

                        <option value="Todos">Todos</option>
                        <option value="Entrada">Entradas</option>
                        <option value="Saída">Saidas</option>
                    </select>

                    <div className="flex gap-2 items-center">
                        <label>Data: </label>
                        <input
                            type="date"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            className="p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm custom-date-icon"
                        />
                        <span>-</span>
                        <input
                            type="date"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            className="p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm custom-date-icon"
                        />
                    </div>

                    <button type="button" onClick={() => limparCamposBusca()}
                            className="text-red-800 hover:text-red-900 cursor-pointer">
                        <X/>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

                    <div className="md:col-span-3 flex justify-end pt-4">
                        <button onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700">
                            <Plus className="w-5 h-5"/> Adicionar Movimentação
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">

                <div className="flex justify-between gap-9 p-6">
                    <h3 className="text-lg font-semibold text-gray-200">
                        Histórico de Movimentações
                    </h3>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-700 border-b border-slate-700">

                    <tr>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase">Produto</th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Tipo</th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Quantidade</th>

                        {usuarioLogado?.role === "Administradores" && (
                            <>
                                <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Usuário</th>
                                <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Data Movimentação</th>
                            </>
                        )}
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Observação</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-700">
                    {movimentosFiltrados.length > 0 ? (
                        movimentosFiltrados.map(
                            (m) => (
                                <tr key={m.id} className="hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-100">
                                        {m.produtos?.nome}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`p-2 text-xs font-semibold rounded-xl 
                                            ${m.tipo === 'Entrada'
                                                ? 'bg-green-500/20 text-green-400 '
                                                : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {m.tipo.toUpperCase()}
                                            </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 font-mono text-center">
                                        {m.quantidade}
                                    </td>

                                    {usuarioLogado?.role === "Administradores" && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-center">
                                                {m.usuarios?.nome}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm text-center">
                                                {new Date(m.created_at).toLocaleString("pt-BR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric"
                                                })}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm text-center">
                                        {m.observacao?.toUpperCase()}
                                    </td>
                                </tr>
                            )
                        )
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                                Nenhuma movimentação encontrada
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}