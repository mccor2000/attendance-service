import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { createWriteStream } from "fs";
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

        return reply.send()
    } catch (err) {
        if (err instanceof DomainException) {
            return reply.status(400).send(err)
        }
        log.error(err)
        return reply.send(err)
    }
}

export const uploadImageHandler = async ({ log, multipartErrors }: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
    const { InvalidMultipartContentTypeError, FilesLimitError } = multipartErrors
    try {
        const data = await request.file()
        if (!data) {
            return reply.send(new InvalidMultipartContentTypeError())
        }

        await pump(data.file, createWriteStream(data.filename))
        if (data.file.truncated) {
            return reply.send(new FilesLimitError());
        }

        return reply.send()
    } catch (err) {
        log.error(err)
        return reply.send(err)
    }
}

