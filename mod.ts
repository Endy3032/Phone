import { lookup } from "https://deno.land/x/mime_types@1.0.0/mod.ts"

const listener = Deno.listen({ port: 8080 })

async function http(conn: Deno.Conn) {
  for await (const req of Deno.serveHttp(conn)) {
    const path = new URL(req.request.url).pathname
    const filename = path == "/" ? "./index.html" : `.${path}`
    try {
      const file = await Deno.readFile(decodeURI(filename))
      req.respondWith(new Response(file, { status: 200, statusText: "OK", headers: { "content-type": lookup(filename.split(".").at(-1) ?? "") || "" } }))
    } catch {
      req.respondWith(new Response("404 Not Found", { status: 404, statusText: "Not Found", headers: { "content-type": "text/html; charset=utf-8", } }))
    }
  }
}

for await (const conn of listener) http(conn)
