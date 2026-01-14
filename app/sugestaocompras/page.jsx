"use client";
import React, {useEffect, useState, useTransition} from "react"
import {useRouter} from "next/navigation"
import Image from "next/image"
import logo from "@/assets/logo2.png"
import {ChevronDown, ChevronUp} from "lucide-react"

export default function SugestaoComprasPage() {
    const router = useRouter()
    const [sugestoes, setSugestoes] = useState([])
    const [dias, setDias] = useState(30)
    const [previsao, setPrevisao] = useState(30)
    const [expanded, setExpanded] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [usuarioLogado, setUsuarioLogado] = useState(null)
    const [sugestaoFiltro, setSugestaoFiltro] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem("usuarioLogado")
        if (userData) {
            setUsuarioLogado(JSON.parse(userData))
        } else {
            startTransition(() => router.push("/login"))
        }
        buscarSugestoes()
    }, [router])

    const buscarSugestoes = async () => {
        setIsLoading(true)

        const res = await fetch(`/api/sugestaocompras?dias=${dias}&previsao=${previsao}`)
        const data = await res.json()

        console.log(data)

        setSugestoes(Array.isArray(data) ? data : [])
        setIsLoading(false)
    }

    const sugestoesFiltradas = sugestaoFiltro
        ? sugestoes.filter((s) => s.sugestaoCompra > 0)
        : sugestoes

    const toggleExpand = (index) => {
        setExpanded((prev) => ({...prev, [index]: !prev[index]}))
    }

    const getStyleStatus = (status) => {
        switch (status) {
            case "ESTOQUE BAIXO":
                return "text-yellow-400"
            case "PRECISA COMPRAR":
                return "text-red-400"
            default:
                return "text-green-400"
        }
    }

    if (isLoading || isPending || !usuarioLogado) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Image src={logo} alt="Logo" className="w-[80px] h-[80px] mb-4 animate-pulse"/>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-gray-200 p-4 sm:p-6 lg:p-8">
            {/*Cabeçalho*/}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4 logo">
                    <Image src={logo} alt="Logo" className="w-[60px] h-[60px]"/>
                    <h1 className="text-xl font-bold text-slate-100 hidden sm:block">
                        Sugestão de Compras
                    </h1>
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="bg-slate-700 text-gray-200 px-8 rounded-lg font-semibold hover:bg-slate-600 transition-colors h-12 cursor-pointer">
                    Voltar
                </button>
            </div>

            {/*Filtros de análise*/}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-lg font-semibold text-gray-200 mb-6">
                    Definir Período de Análise
                </h3>

                <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Período de Análise:</label>
                    <select
                        value={dias}
                        onChange={(e) => setDias(Number(e.target.value))}
                        className="w-40 p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm cursor-pointer">

                        <option value={30}>Últimos 30 dias</option>
                        <option value={60}>Últimos 60 dias</option>
                        <option value={90}>Últimos 90 dias</option>
                        <option value={120}>Últimos 120 dias</option>
                    </select>

                    <span> - </span>

                    <select
                        value={previsao}
                        onChange={(e) => setPrevisao(Number(e.target.value))}
                        className="w-45 p-2 bg-slate-700 border-slate-600 rounded-lg shadow-sm cursor-pointer">

                        <option value={30}>Próximos 30 dias</option>
                        <option value={60}>Próximos 60 dias</option>
                        <option value={90}>Próximos 90 dias</option>
                        <option value={120}>Próximos 120 dias</option>
                    </select>

                </div>

                <div className="flex justify-end items-center pt-4 gap-10">
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            id="filtroSugestoes"
                            checked={sugestaoFiltro}
                            onChange={(e) => setSugestaoFiltro(e.target.checked)}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"/>
                        <label htmlFor="filtroSugestoes" className="pl-2 cursor-pointer">Exibir somente Sugestão Compras
                            maior do que 0.</label>
                    </div>

                    <button
                        onClick={buscarSugestoes}
                        className="flex items-center bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 cursor-pointer">
                        Buscar Sugestoes
                    </button>
                </div>
            </div>

            {/*Lista de produtos analisados*/}
            <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex justify-between gap-9 p-6">
                    <h3 className="text-lg font-semibold text-gray-200">
                        Produtos analisados
                    </h3>
                </div>

                {/*Tabela de produtos analisados*/}
                <table className="w-full text-left">
                    {/*Cabeçalho Tabela*/}
                    <thead className="bg-slate-700 border-b border-slate-700">
                    <tr>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase">Produto</th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Entradas</th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Saídas</th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Saldo
                            Estoque
                        </th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Consumo
                            Médio/Dia
                        </th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Sugestão
                            Compra
                        </th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-300 uppercase text-center">Status</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                    </thead>

                    {/*Corpo Tabela Sugestôes*/}
                    <tbody className="divide-y divide-slate-700">
                    {sugestoesFiltradas.length > 0 ? (
                        sugestoesFiltradas.map((s, i) => (
                            <React.Fragment>
                                <tr
                                    key={i}
                                    className="hover:bg-slate-700/50 cursor-pointer"
                                    onClick={() => toggleExpand(i)}>
                                    <td className="px-6 py-4 font-medium text-slate-100">{s.nome}</td>
                                    <td className="px-6 py-4 text-center text-green-400">{s.totalEntrada}</td>
                                    <td className="px-6 py-4 text-center text-red-400">{s.consumoRealPeriodo}</td>
                                    <td
                                        className={`px-6 py-4 text-center 
                                        ${s.saldoPeriodo >= 5
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }`}>
                                        {s.saldoPeriodo}
                                    </td>
                                    <td className="px-6 py-4 text-center">{s.consumoMedioDia.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center text-blue-400 font-semibold">{s.sugestaoCompra}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`p-2 text-xs font-semibold rounded-xl ${getStyleStatus(s.status)}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {expanded[i]
                                            ? (
                                                <ChevronUp className="w-5 h-5 text-slate-400"/>
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400"/>
                                            )}
                                    </td>
                                </tr>

                                {/*Histórico do movimentações*/}
                                {expanded[i] && (
                                    <tr>
                                        <td colSpan={8} className="bg-slate-900 px-6 py-4">
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-1">
                                                            Histórico de Movimentações
                                                        </h4>

                                                        <div className="scroll-container max-h-40 overflow-y-auto rounded-lg border border-slate-700">
                                                            {/*Tabela do histórico de movimentações*/}
                                                            <table className="min-w-full text-sm text-slate-300">
                                                                {/*Cabeçalho tabela de movimentações*/}
                                                                <thead className="bg-slate-800 sticky top-0">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left">Data</th>
                                                                    <th className="px-4 py-2 text-left">Entrada</th>
                                                                    <th className="px-4 py-2 text-left">Saída</th>
                                                                    <th className="px-4 py-2 text-left">Usuário</th>
                                                                </tr>
                                                                </thead>
                                                                {/*Corpo tabela movimentações*/}
                                                                <tbody>
                                                                {s.historico && s.historico.length > 0 ? (
                                                                    s.historico.map((h, idx) => (
                                                                        <tr
                                                                            key={idx}
                                                                            className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                                                            <td className="px-4 py-2">
                                                                                {new Date(h.data).toLocaleDateString("pt-BR")}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-green-400">
                                                                                {h.entrada > 0 ? h.entrada : "-"}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-red-400">
                                                                                {h.saida > 0 ? h.saida : "-"}
                                                                            </td>
                                                                            <td className="px-4 py-2">{h.usuarios}</td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td
                                                                            colSpan={4}
                                                                            className="italic text-slate-500 px-4 py-2 text-center">
                                                                            Sem histórico
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="sm:w-1/3">
                                                        <h4 className="text-sm font-semibold text-slate-300 mb-1">
                                                            Previsão de Consumo
                                                        </h4>
                                                        <p className="text-lg font-bold text-purple-400">
                                                            {s.previsaoConsumo}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={8}
                                className="px-6 py-4 text-center text-slate-400">
                                Nenhum dado encontrado no período selecionado.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
