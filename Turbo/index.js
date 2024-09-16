const { Host } = require('./cdo-host/index')
const { customExport } = require('./cdo-expo/index')
class Turbo {
    constructor(app, dir) {
        if (typeof app !== 'object' && app === null) {
            throw new Error('App not initalized')
        }
        app.use('/turbowarp', dir)
        new Host(app)
        app.get('/turbowarp', async (req, res) => {
            let project = req.query.u || ''
            let link = new RegExp(`(?<=(applab|gamelab)/)[^/]+`)
            let id = project.match(link)
            if (id !== null) {
                project = await customExport(id[0])
                res.send(project)
            }
        })
    }
}
module.exports = {
    Turbo,
}
