import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { createWriteStream } from "fs";
import path from "path";
import { pipeline as pump } from "stream/promises";

import { FastifyWithDecorators } from ".";
import { DomainException, ICreateAttendance } from "../core/domain";
import { createAttendance } from "../core/services";

export const createAttendanceHandler = async (
    { repo, publisher, log }: FastifyWithDecorators,
    { body }: FastifyRequest<{ Body: ICreateAttendance }>,
    reply: FastifyReply) => {

    try {
        const attd = await createAttendance(repo, body)

        repo.save(attd)
        publisher.produce(JSON.stringify(attd))

        reply.send()
    } catch (err) {
        if (err instanceof DomainException) {
            reply.status(400).send(err)
            return
        }
        log.error(err)
        return reply.send(err)
    }
}

export const uploadImageHandler = async ({ log, multipartErrors }: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
    const { InvalidMultipartContentTypeError } = multipartErrors
    try {
        const data = await request.file()
        if (!data) {
            return reply.send(new InvalidMultipartContentTypeError())
        }

        const filepath = path.resolve('/usr/app/upload/', data.filename)
        pump(data.file, createWriteStream(filepath))

        return reply.send({ image: filepath })
    } catch (err) {
        log.error(err)
        return reply.send(err)
    }
}

