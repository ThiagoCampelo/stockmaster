import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(req) {
    const { searchParams } = new URL(req.url)

    const nome = searchParams.get("nome")
    const quantidade = searchParams.get("quantidade")

    let query = supabase
        .from("produtos")
        .select("*")
        .order("nome")

    if (nome) {
        query = query.ilike(
            "nome",
            `%${nome}%`
        )
    }


    const { data, error } = await query

    if (error) {
        return new Response(
            JSON.stringify(
                {
                    error: error.message
                }
            ), {
            status: 400,
        }
        )
    }

    return new Response(JSON.stringify(data), { status: 200 })
}

export async function POST(req) {
    const { nome, quantidade } = await req.json()

    if (!nome) return new Response(
        JSON.stringify(
            {
                error: "Nome é obrigatório"
            }
        ), {
        status: 400
    }
    )

    const { data, error } = await supabase
        .from("produtos")
        .insert([
            {
                nome,
                quantidade: quantidade || 0
            }
        ])
        .select()
        .single()

    if (error) return new Response(
        JSON.stringify(
            {
                error: error.message
            }
        ), {
        status: 400
    }
    )

    return new Response(
        JSON.stringify(data),
        {
            status: 201
        }
    )
}

export async function PUT(req) {
    const { id, nome, tipo, quantidade } = await req.json()

    if (!id) return new Response(
        JSON.stringify(
            {
                error: "ID é obrigatório"
            }
        ), {
        status: 400
    }
    )

    const { data, error } = await supabase
        .from("produtos")
        .update(
            {
                nome,
                quantidade
            }
        )
        .eq("id", id)
        .select()
        .single()

    if (error) return new Response(
        JSON.stringify(
            {
                error: error.message
            }
        ), {
        status: 400
    }
    )
    return new Response(
        JSON.stringify(data),
        {
            status: 200
        }
    )
}

export async function DELETE(req) {
    const { id } = await req.json()

    if (!id) return new Response(
        JSON.stringify(
            {
                error: "ID é obrigatório"
            }
        ), {
        status: 400
    }
    )

    const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id)

    if (error) return new Response(
        JSON.stringify(
            {
                error: error.message
            }
        ), {
        status: 400
    }
    )

    return new Response(
        JSON.stringify(
            {
                success: true
            }
        ), {
        status: 200
    }
    )
}
