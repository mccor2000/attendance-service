import { MongoClient, ObjectId } from "mongodb";

(async () => {
    // Connection URL
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    const NUM_OF_SCHOOLS = 1000
    const NUM_OF_STUDENTS_PER_SCHOOL = 5000

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const collections = await client.db('attendance').collections()
        await Promise.all(collections.map(c => c.drop()))

        const userCollection = client.db().collection("users");
        const schoolCollection = client.db().collection("schools");

        let schools: { _id: ObjectId, name: string }[] = [];
        for (let i = 0; i < NUM_OF_SCHOOLS; i++) {
            schools.push({ _id: new ObjectId(ObjectId.generate()), name: String(i) })
        }

        const result = await schoolCollection.bulkWrite(schools.map(s => ({
            insertOne: { document: s }
        })));
        console.log(`Inserted ${result.insertedCount} schools`)

        let insertedStudents = 0
        // 50000 records per each bulk
        for (let i = 0; i < schools.length; i += 10) {
            let users: { _id: ObjectId, schoolId: ObjectId, name: string }[] = []

            for (let j = i; j < i + 10; j++) {
                if (j < schools.length) {
                    users.push(
                        ...Array(NUM_OF_STUDENTS_PER_SCHOOL).fill(0).map(idx => ({
                            _id: new ObjectId(ObjectId.generate()),
                            schoolId: schools[j]._id,
                            name: String(idx)
                        }))
                    )
                }
            }
            const result = await userCollection.bulkWrite(users.map(u => ({
                insertOne: {
                    document: u
                }
            })));
            insertedStudents += result.insertedCount
        }
        console.log(`Inserted ${insertedStudents} users`)

        console.log("Database seeded!");
        await client.close();
    } catch (err) {
        console.log(err);
    }
})()
