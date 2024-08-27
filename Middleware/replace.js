const Transform = require('stream').Transform
const fs = require('fs')

module.exports = function (res, path, callback, xml) {
    const replacementTransform = new Transform()
    replacementTransform._transform = function (data, encoding, done) {
        const str = callback(data.toString())
        this.push(str)
        done()
    }

    if (!xml) res.write('<!-- Begin stream -->\n')
    let stream = fs.createReadStream(path)
    stream
        .pipe(replacementTransform)
        .on('end', () => {
            if (!xml) res.write('\n<!-- End stream -->')
        })
        .pipe(res)
}
