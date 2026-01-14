import {createClient} from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(req) {

    const {searchParams} = new URL(req.url)
    const dias = parseInt(searchParams.get("dias")) || 30
    const previsao = parseInt(searchParams.get("previsao")) || 30
    const dataInicial = new Date()
    dataInicial.setDate(dataInicial.getDate() - dias)

    const {data, error} = await supabase
        .from("movimentos")
        .select(
            "quantidade, " +
            "created_at, " +
            "tipo, " +
            "produto_id, " +
            "usuario_id, " +
            "produtos(nome, quantidade), " +
            "usuarios(nome)"
        )
        .gte("created_at", dataInicial.toISOString())

    if (error) {
        return new Response(
            JSON.stringify(
                {
                    error: error.message
                }
            ), {
                status: 400
            }
        )
    }

    if (!data || data.length === 0) {
        return new Response(
            JSON.stringify(
                []
            ), {
                status: 200
            }
        )
    }

    const consumoMap = {}
    data.forEach((m) => {
        const produtoId = m.produto_id
        const usuario = m.usuarios?.nome || "Desconhecido"

        if (!consumoMap[produtoId]) {
            consumoMap[produtoId] = {
                nome: m.produtos?.nome || "Desconhecido",
                atual: m.produtos?.quantidade || 0,
                totalSaida: 0,
                totalEntrada: 0,
                historico: []
            }
        }

        if (!consumoMap[produtoId]) {
            consumoMap[produtoId] = {
                nome: m.produtos?.nome || "Desconhecido",
                atual: m.produtos?.quantidade || 0,
                totalSaida: 0,
                totalEntrada: 0,
                historico: []
            }
        }

        if (m.tipo === "Saída") {
            consumoMap[produtoId].totalSaida += m.quantidade
        } else if (m.tipo === "Entrada") {
            consumoMap[produtoId].totalEntrada += m.quantidade
        }

        consumoMap[produtoId].historico.push(
            {
                data: new Date(m.created_at).toISOString(),
                tipo: m.tipo,
                entrada: m.tipo === "Entrada" ? m.quantidade : 0,
                saida: m.tipo === "Saída" ? m.quantidade : 0,
                usuarios: [usuario]
            }
        )

    })

    const sugestoes = Object.values(consumoMap).map((p) => {
        const diasConsiderados = Math.max(1, dias)
        const consumoRealPeriodo = p.totalSaida || 0
        const entradasPeriodo = p.totalEntrada || 0
        const consumoMedioDia = diasConsiderados > 0 ? consumoRealPeriodo / diasConsiderados : 0
        const saldoPeriodo = entradasPeriodo - consumoRealPeriodo
        const previsaoConsumo = consumoMedioDia * previsao
        const sugestaoCompra = Math.max(
            0,
            Math.round(
                previsaoConsumo - (p.atual || 0)
            )
        )
        const historicoFormatado = (p.historico || [])
            .sort((a, b) => new Date(a.data) - new Date(b.data))

        let status = "OK"
        if (sugestaoCompra > 0 && p.atual <= 5) {
            status = "PRECISA COMPRAR"
        } else if (sugestaoCompra > 0) {
            status = "ESTOQUE BAIXO"
        }

        return {
            nome: p.nome,
            atual: p.atual || 0,
            usuario: p.usuario,
            totalEntrada: entradasPeriodo,
            consumoRealPeriodo,
            consumoMedioDia,
            saldoPeriodo,
            previsaoConsumo,
            sugestaoCompra,
            status,
            historico: historicoFormatado,
        };
    });


    return new Response(
        JSON.stringify(sugestoes),
        {
            status: 200
        }
    )
}
