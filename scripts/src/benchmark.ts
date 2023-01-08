import { randomInt, randomUUID } from "crypto";
import { ObjectId } from "mongodb";

const autocannon = require('autocannon')

const SchoolIds = Array(1000).fill(0).map(() => randomUUID())
const Type = ['checkin', 'checkout']

const randomPayload = () => {
    return JSON.stringify({
            type: Type[randomInt(2)],
            timestamp: Date.now(),
            image: "",
            userId: new ObjectId(ObjectId.generate()),
            schoolId: SchoolIds[randomInt(1000)],
            temperature: randomInt(34, 42),
    })
}

const startBench = () => {
    const instance = autocannon({
        url: 'http://localhost:8080/attendances',
        connections: 500,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        overallRate: 1000,
        duration: 240,
        body: randomPayload(),
    })

    instance.on('response', (client) => {
        client.setBody(randomPayload());
    })

    autocannon.track(instance, { renderResultTable: true });

    process.once('SIGINT', () => {
        instance.stop();
    });
}

startBench()