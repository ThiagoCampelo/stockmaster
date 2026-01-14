import { createClient } from "@supabase/supabase-js"
import md5 from "md5"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
    const { usuario, senha } = await req.json()

    const hashedPassword = md5(senha)



    const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("usuario", usuario)
        .eq("senha", hashedPassword)
        .single()

    if (error && error.code !== 'PGRST116') {
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
                {
                    error: "Usuário ou senha inválidos"
                }
            ), {
            status: 401
        }
        )
    }

    const user = data

    if (user.status !== 'Ativo') {
        return new Response(
            JSON.stringify(
                {
                    error: "Seu usuário está inativo"
                }
            ), {
            status: 403
        }
        )
    }

    return new Response(
        JSON.stringify(
            {
                success: true,
                user: user
            }
        ), {
        status: 200
    }
    )
}
