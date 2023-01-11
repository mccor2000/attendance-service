import { randomInt } from "crypto";
import { MongoClient, ObjectId } from "mongodb";

const autocannon = require('autocannon')


const bench = async () => {
    const client = new MongoClient("mongodb://localhost:27017");

    const randomPayload = () => {
        return JSON.stringify({
            type: 'checkin',
            timestamp: Date.now(),
            image: "",
            userId: new ObjectId(ObjectId.generate()),
            schoolId: schools[randomInt(1000)]._id.toString(),
            temperature: randomInt(34, 42),
        })
    }
    const schools = await client.db()
        .collection('schools')
        .find({}, { projection: { _id: 1 } })
        .toArray()


    const instance = autocannon({
        url: 'http://localhost:8080/attendances',
        connections: 100,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        amount: 100000,
        body: randomPayload(),
    })

    instance.on('response', (client) => {
        client.setBody(randomPayload());
    })

    autocannon.track(instance, { renderResultTable: true });

    instance.on('done', () => {
        return
    })

    process.once('SIGINT', () => {
        instance.stop();
    });
}

bench().then(()=>{
    
}).catch(console.log)