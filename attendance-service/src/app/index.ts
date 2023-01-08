import fastify, { FastifyInstance } from "fastify";

import cors from '@fastify/cors'
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";

import { auth, repo, publisher } from "./plugins";
import { IPublisher, IRepo } from "../core/ports";
import { createAttendanceHandler, uploadImageHandler } from "./route-handlers";
import { CreateAttendanceRequest, UploadImageRequest, UploadImageResponse } from "./schemas";
import { ICreateAttendance } from "../core/domain";

export type FastifyWithDecorators = FastifyInstance & {
  // authenticate: onRequestAsyncHookHandler,
  // adminOnly: onRequestAsyncHookHandler,
  repo: IRepo
  publisher: IPublisher,
}


export const bootstrap = async () => {
  const app = fastify({ logger: false })

  usePlugins(app)
  useSchemas(app)
  // @ts-ignore
  useRouter(app)

  try {
    await app.ready()
    await app.listen({ host: '0.0.0.0', port: 8080 })
    console.log(`Application bootstraped successfully!`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

const usePlugins = async (fastify: FastifyInstance) => {
  fastify.register(cors)
  fastify.register(helmet)
  fastify.register(auth)
  fastify.register(repo)
  fastify.register(publisher)
  fastify.register(multipart, {
    limits: { fileSize: 1000000 },
  })
}

const useSchemas = (fastify: FastifyInstance) => {
  fastify.addSchema(CreateAttendanceRequest)
  fastify.addSchema(UploadImageRequest)
  fastify.addSchema(UploadImageResponse)
}

const useRouter = (fastify: FastifyWithDecorators) => {
  fastify.route<{ Body: ICreateAttendance }>({
    method: 'POST',
    url: '/attendances',
    schema: { body: { $ref: 'createAttendanceRequest' } },
    handler: (request, reply) => createAttendanceHandler(fastify, request, reply),
  })
  fastify.route({
    method: 'POST',
    url: '/upload/image',
    handler: (request, reply) => uploadImageHandler(fastify, request, reply),
  })
  fastify.route({
    method: 'GET',
    url: '/reports',
    handler: (request, reply) => { }
  })
}