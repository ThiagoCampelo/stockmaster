import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const produtoId = searchParams.get("produto_id")

    let query = supabase
        .from("movimentos")
        .select(
            "id, " +
            "tipo, " +
            "quantidade, " +
            "observacao, " +
            "created_at, " +
            "produtos(nome), " +
            "usuarios(nome)"
        )
        .order("created_at", { ascending: false })

    if (produtoId) {
        query = query.eq("produto_id", produtoId)
    }

    const { data, error } = await query

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
    return new Response(JSON.stringify(data), { status: 200 })
}

export async function POST(req) {
    try {
        const movimentos = await req.json();

        if (!Array.isArray(movimentos) || movimentos.length === 0) {
            return new Response(JSON.stringify({ error: "O corpo da requisição deve ser um array de movimentos." }), { status: 400 });
        }


        const validationError = await validateStock(supabase, movimentos);
        if (validationError) {
            return new Response(JSON.stringify({ error: validationError }), { status: 400 });
        }

        const { data: novosMovimentos, error: movError } = await supabase
            .from("movimentos")
            .insert(movimentos)
            .select();

        if (movError) {
            console.error("Erro Supabase (insert):", movError);
            return new Response(JSON.stringify({ error: movError.message }), { status: 400 });
        }

        const ajustes = novosMovimentos.map(mov => ({
            produto_id_input: mov.produto_id,
            delta: mov.tipo === "Entrada" ? mov.quantidade : -mov.quantidade
        }));

        const { error: updError } = await supabase.rpc("ajustar_estoque_lote", {
            ajustes: ajustes
        });

        if (updError) {
            console.error("Erro Supabase (RPC):", updError);
            return new Response(JSON.stringify({ error: "Falha ao ajustar o estoque: " + updError.message }), { status: 500 });
        }

        return new Response(JSON.stringify(novosMovimentos), { status: 201 });

    } catch (error) {
        console.error("Erro interno da API:", error);
        return new Response(JSON.stringify({ error: "Erro interno do servidor." }), { status: 500 });
    }
}

async function validateStock(supabase, movimentos) {
    const saidas = movimentos.filter(m => m.tipo === 'Saída');
    if (saidas.length === 0) return null;

    const productIds = [...new Set(saidas.map(s => s.produto_id))];

    const { data: products, error } = await supabase
        .from('produtos')
        .select('id, quantidade, nome')
        .in('id', productIds);

    if (error) return "Erro ao verificar estoque: " + error.message;

    const productMap = products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
    const exitTotals = {};

    saidas.forEach(m => {
        exitTotals[m.produto_id] = (exitTotals[m.produto_id] || 0) + parseFloat(m.quantidade);
    });

    for (const [pid, totalExit] of Object.entries(exitTotals)) {
        const prod = productMap[pid];
        if (!prod) return `Produto ID ${pid} não encontrado.`;

        if (prod.quantidade < totalExit) {
            return `Estoque insuficiente para o produto "${prod.nome}". Disponível: ${prod.quantidade}, Solicitado: ${totalExit}`;
        }
    }

    return null;
}