import fastify, { FastifyInstance } from "fastify";

import cors from '@fastify/cors'
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";

import config from "../config";
import { repo, publisher } from "./plugins";
import { IPublisher, IRepo } from "../core/ports";
import { ICreateAttendance } from "../core/domain";
import { createAttendanceHandler, uploadImageHandler } from "./route-handlers";
import { CreateAttendanceRequest, UploadImageRequest } from "./schemas";


export type FastifyWithDecorators = FastifyInstance & {
  repo: IRepo
  publisher: IPublisher,
}

export const bootstrap = async () => {
  const app = fastify({ logger: { level: 'error' }})

  try {
    usePlugins(app)
    useSchemas(app)
    // @ts-ignore
    useRouter(app)

    await app.ready()
    await app.listen(config.server)
    app.log.info(`Application bootstraped successfully!`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

const usePlugins = async (fastify: FastifyInstance) => {
  fastify.register(cors)
  fastify.register(helmet)
  // fastify.register(auth)
  fastify.register(repo)
  fastify.register(publisher)
  fastify.register(multipart, {
    limits: { fileSize: 1000000 },
  })
}

const useSchemas = (fastify: FastifyInstance) => {
  fastify.addSchema(CreateAttendanceRequest)
  fastify.addSchema(UploadImageRequest)
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
}