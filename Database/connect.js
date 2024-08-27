const Mongoose = require('mongoose')
Mongoose.set('strictQuery', true)

const uri =
    'mongodb+srv://dragonfire7z:' +
    process.env.MONGODB_PASSWORD +
    '@picmo.ti6ffzg.mongodb.net/?retryWrites=true&w=majority'

const connectDB = async () => {
    await Mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    console.log('MongoDB Connected')
}

module.exports = connectDB
