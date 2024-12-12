import { FastifyAdapter } from '@nestjs/platform-fastify'

const app: FastifyAdapter = new FastifyAdapter({
  trustProxy: true,
})
export { app as fastifyApp }

app.getInstance().addHook('onRequest', (request, reply, done) => {
  // set undefined origin
  const origin = request.headers.origin
  if (!origin) {
    request.headers.origin = request.headers.host
  }

  const url = request.url

  // skip favicon request
  if (/favicon.ico$/.test(url) || /manifest.json$/.test(url)) {
    return reply.code(204).send()
  }

  done()
})
