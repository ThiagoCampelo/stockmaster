import { createClient } from "@supabase/supabase-js"
import md5 from "md5"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(req) {
    const { searchParams } = new URL(req.url)

    const nome = searchParams.get("nome")
    const status = searchParams.get("status")

    let query = supabase
        .from("usuarios")
        .select("*")
        .order("nome")

    if (nome) {
        query = query.ilike(
            "nome",
            `%${nome}%`
        )
    }
    if (status) {
        query = query.ilike(
            "status",
            `%${status}%`
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
            status: 400
        }
        )
    }
    return new Response(
        JSON.stringify(data),
        {
            status: 200
        }
    )
}

export async function POST(req) {
    const { usuario, senha, nome, status } = await req.json()

    if (!usuario || !senha) {
        return new Response(
            JSON.stringify(
                {
                    error: "Usuário e senha obrigatórios"
                }
            ), {
            status: 400
        }
        )
    }

    const { data, error } = await supabase
        .from("usuarios")
        .insert(
            [
                {
                    usuario,
                    senha: md5(senha),
                    nome
                }
            ]
        )
        .select(
            "id," +
            " usuario," +
            " nome, " +
            "created_at, " +
            "status"
        )
        .single()

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
    return new Response(
        JSON.stringify(data),
        {
            status: 201
        }
    )
}

export async function PUT(req) {
    const { id, usuario, senha, nome, status } = await req.json()

    if (!id) {
        return new Response(
            JSON.stringify(
                {
                    error: "ID é obrigatório"
                }
            ), {
            status: 400
        }
        )
    }

    const updateData = {
        usuario,
        nome,
        status
    }

    if (senha) {
        updateData.senha = md5(senha)
    }

    const { data, error } = await supabase
        .from("usuarios")
        .update(updateData)
        .eq("id", id)
        .select(
            "id," +
            "usuario, " +
            "nome, " +
            "created_at," +
            "status"
        )
        .single()

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
    return new Response(
        JSON.stringify(data),
        {
            status: 200
        }
    )
}

export async function DELETE(req) {
    const { id } = await req.json()

    if (!id) {
        return new Response(
            JSON.stringify(
                {
                    error: "ID é obrigatório"
                }
            ), {
            status: 400
        }
        )
    }

    const { error } = await supabase.from("usuarios").delete().eq("id", id)

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
