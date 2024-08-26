const Transform = require('stream').Transform
const fs = require('fs')

module.exports = function (res, path, callback) {
    const replacementTransform = new Transform()
    replacementTransform._transform = function (data, encoding, done) {
        const str = callback(data.toString())
        this.push(str)
        done()
    }

    res.write('<!-- Begin stream -->\n')
    let stream = fs.createReadStream(path)
    stream
        .pipe(replacementTransform)
        .on('end', () => {
            res.write('\n<!-- End stream -->')
        })
        .pipe(res)
}
