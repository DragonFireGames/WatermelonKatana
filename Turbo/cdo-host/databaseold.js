const fs = require('fs')
if (!fs.existsSync('./client/Turbo/Database/')) {
    fs.mkdirSync('./client/Turbo/Database')
}
let initalized = false
class Database {
    directory = '/storage.json'
    data = { keys: {}, tables: {} }
    csvPath = ''
    constructor(app, path) {
        const self = this
        if (typeof app !== 'object' && app === null) {
            throw new Error('App not initalized')
        }
        path = path !== undefined ? path : __dirname
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        this.directory = path + this.directory
        this.csvPath = `${path || __dirname}/Data`
        if (!fs.existsSync(this.directory)) {
            this.updateData()
        } else {
            this.getData()
        }
        if (fs.existsSync(this.csvPath)) {
            let csvDirs = fs.readdirSync(this.csvPath)
            for (let file of csvDirs) {
                let tablename = file.match(/.*(?=\.)/)[0]
                if (
                    file.endsWith('.csv') &&
                    this.tableContainer[tablename] === undefined
                ) {
                    this.tableContainer[tablename] = this.csvToJSON(
                        fs.readFileSync(`${self.csvPath}/${file}`, 'utf-8')
                    )
                } else if (file.endsWith('.json')) {
                    let container = this.keyContainer
                    container = Object.assign(
                        this.keyContainer,
                        JSON.parse(
                            fs.readFileSync(`${self.csvPath}/${file}`, 'utf-8')
                        )
                    )
                }
            }
        } else {
            console.log(`skipping import of ${this.csvPath}`)
        }
        this.updateData()
        if (!initalized) {
            // keyvalue paths
            app.get(genURL('get_key_value'), (req, res) => {
                self.getData()
                res.send(self.keyContainer[req.query.key])
            })
            app.get(genURL('get_key_values'), (req, res) => {
                self.getData()
                res.send(self.keyContainer)
            })
            app.post(genURL('set_key_value'), (req, res) => {
                self.getData()
                let { key, value } = req.body
                self.keyContainer[key] = value
                self.updateData()
                res.send(req.body)
            })
            app.put(genURL('populate_key_values'), (req, res) => {
                self.getData()
                let { key_values_json } = req.body
                key_values_json =
                    typeof key_values_json === 'string'
                        ? JSON.parse(key_values_json)
                        : key_values_json
                for (let p in key_values_json) {
                    self.keyContainer[p] = key_values_json[p]
                }
                self.updateData()
                res.send(true)
            })
            app.delete(genURL('delete_key_value'), (req, res) => {
                self.getData()
                let { key } = req.body
                delete self.keyContainer[key]
                self.updateData()
                res.send(true)
            })
            // table paths
            app.post(genURL('create_record'), (req, res) => {
                let { table_name, record_json } = req.body
                record_json = JSON.parse(record_json)
                if (
                    typeof table_name !== 'string' ||
                    (typeof record_json !== 'object' && record_json !== null)
                ) {
                    return self.error(
                        res,
                        `invalid argument table "${table_name}" or record "${record_json}"`
                    )
                }
                self.getData()
                let table = self.tableContainer
                if (table[table_name] === undefined) {
                    table[table_name] = self.emptyTable
                }
                record_json.id = table[table_name].nextId++
                table[table_name].records.push(record_json)
                self.updateData()
                res.send(req.body)
            })
            app.post(genURL('create_table'), (req, res) => {
                let { table_name } = req.body
                if (typeof table_name !== 'string') {
                    return self.error(
                        res,
                        `unable to create a table wihout a name`
                    )
                }
                self.getData()
                let table = self.tableContainer
                if (table[table_name] === undefined) {
                    table[table_name] = self.emptyTable
                }
                self.updateData()
                res.send(true)
            })
            app.post(genURL('add_column'), (req, res) => {
                let { column_name, table_name } = req.body
                if (
                    typeof column_name !== 'string' ||
                    typeof table_name !== 'string'
                ) {
                    return self.error(
                        res,
                        `invalid argument table "${table_name}" or column "${column_name}"`
                    )
                }
                self.getData()
                let table = self.tableContainer[table_name]
                if (table === undefined) {
                    return self.error(
                        res,
                        `unable to create a column without a table`
                    )
                }
                for (let record of table.records) {
                    record[column_name] = null
                }
                self.updateData()
                res.send(true)
            })
            app.post(genURL('add_shared_table'), (req, res) => {
                let { table_name } = req.body
                let file = `${path || __dirname}/${table_name}.csv`
                if (!fs.existsSync(file)) {
                    self.getData()
                    self.tableContainer[table_name] = self.csvToJSON(
                        fs.readFileSync(file, 'utf-8')
                    )
                    res.send(true)
                }
            })
            app.post(genURL('import_csv'), (req, res) => {
                let { table_name, table_data_csv } = req.body
                if (
                    typeof table_name !== 'string' ||
                    typeof table_data_csv !== 'string'
                ) {
                    return self.error(
                        res,
                        `unable to import csv table ${table_name} with data ${table_data_csv}`
                    )
                }
                self.getData()
                let json = self.csvToJSON(table_data_csv)
                if (json.records.length < 0) {
                    return self.error(
                        res,
                        "there isn't any data in this csv file"
                    )
                }
                self.tableContainer[table_name] = json
                self.updateData()
                res.send(true)
            })
            app.put(genURL('populate_tables'), (req, res) => {
                let { tables_json } = req.body
                if (typeof tables_json !== 'string') {
                    return self.error(res, `invalid params json "${json}"`)
                }
                tables_json = JSON.parse(tables_json)
                self.getData()
                let table = self.tableContainer
                for (let t of Object.keys(tables_json)) {
                    if (table[t] === undefined) {
                        table[t] = self.emptyTable
                    }
                    table[t].records = tables_json[t]
                    for (let i = 1; i < table[t].length + 1; i++) {
                        table[t][i].id = i
                    }
                    table[t].nextId = table[t].records.length + 1
                }
                self.updateData()
                res.send(true)
            })
            app.put(genURL('update_record'), (req, res) => {
                let { table_name, record_json } = req.body
                record_json = JSON.parse(record_json)
                if (
                    typeof table_name !== 'string' ||
                    (typeof record_json !== 'object' && record_json !== null)
                ) {
                    return self.error(
                        res,
                        `unable to update table ${table_name} at id ${table_id}`
                    )
                }
                self.getData()
                let table = self.tableContainer
                table = table[table_name]
                for (let i = 0; i < table.records.length; i++) {
                    let record = table.records[i]
                    if (record.id === record_json.id) {
                        table.records[i] = record_json
                        break
                    }
                }
                self.updateData()
                res.send(table.records)
            })
            app.put(genURL('rename_column'), (req, res) => {
                self.getData()
                let { table_name, old_column_name, new_column_name } = req.body
                let table = self.tableContainer[table_name]
                if (
                    typeof old_column_name !== 'string' ||
                    typeof new_column_name !== 'string' ||
                    table === undefined
                ) {
                    return self.error(
                        res,
                        `invalid argument on table "${table_name}" column "${old_column_name}" new column "${new_column_name}"`
                    )
                }
                for (let record of table.records) {
                    record[new_column_name] = record[old_column_name]
                    delete record[old_column_name]
                }
                self.updateData()
                res.send(true)
            })
            app.put(genURL('coerce_column'), (req, res) => {
                self.getData()
                let { table_name, column_name, column_type } = req.body
                let table = self.tableContainer[table_name]
                if (
                    typeof column_name !== 'string' ||
                    column_type.match(/string|number|boolean/)[0] === null ||
                    table === undefined
                ) {
                    return self.error(
                        res,
                        `invalid argument on table "${table_name}" column "${column_name}" type "${column_type}"`
                    )
                }
                for (let record of table.records) {
                    switch (column_type) {
                        case 'boolean': {
                            record[column_name] = Boolean(record[column_name])
                            break
                        }
                        case 'number': {
                            record[column_name] = Number(record[column_name])
                            break
                        }
                        case 'string': {
                            record[column_name] = String(record[column_name])
                            break
                        }
                    }
                }
                self.updateData()
                res.send(true)
            })
            app.get(genURL('get_columns_for_table'), (req, res) => {
                const columns = ['id']
                let { table_name } = req.query
                let table = self.tableContainer[table_name]
                if (table === undefined) {
                    self.error(res, `no table found at "${table_name}"`)
                }
                for (let record of table.records) {
                    for (let p in record) {
                        if (columns.indexOf(p) < 0) {
                            columns.push(p)
                        }
                    }
                }
                res.send(columns)
            })
            app.get(genURL('export_csv'), (req, res) => {
                self.getData()
                let { table_name } = req.query
                let table = self.tableContainer[table_name]
                if (table === undefined) {
                    return self.error(
                        res,
                        `table "${table_name}" cannot be exported`
                    )
                }
                fs.writeFileSync(
                    `${self.csvPath}/${table_name}.csv`,
                    self.jsonToCSV(table.records),
                    'utf-8'
                )
                res.send(true)
            })
            app.get(genURL('read_records'), (req, res) => {
                self.getData()
                let table = self.tableContainer[req.query.table_name]
                if (table === undefined) {
                    return self.error(
                        res,
                        `failed to read table ${req.query.table_name}`
                    )
                }
                res.send(table.records)
            })
            app.delete(genURL('clear_table'), (req, res) => {
                self.getData()
                let { table_name } = req.body
                let table = self.tableContainer
                if (table[table_name] === undefined) {
                    return self.error(
                        res,
                        `failed to clear table "${table_name}"`
                    )
                }
                table[table_name] = self.emptyTable
                self.updateData()
                res.send(true)
            })
            app.delete(genURL('delete_record'), (req, res) => {
                self.getData()
                let { table_name, record_id } = req.body
                let table = self.tableContainer[table_name]
                if (
                    table === undefined ||
                    table.records[record_id - 1] === undefined
                ) {
                    return self.error(
                        res,
                        `failed to remove record on table "${table_name}" at id "${record_id}"`
                    )
                }
                table.records.splice(record_id - 1)
                self.updateData()
                res.send(null)
            })
            app.delete(genURL('delete_column'), (req, res) => {
                self.getData()
                let { table_name, column_name } = req.body
                let table = self.tableContainer[table_name]
                if (table === undefined) {
                    return self.error(
                        res,
                        `failed to remove column on table "${table_name}" at column "${column_name}"`
                    )
                }
                for (let record of table.records) {
                    if (record[column_name] !== undefined) {
                        delete record[column_name]
                    }
                }
                self.updateData()
                res.send(req.body)
            })
            app.delete(genURL('delete_table'), (req, res) => {
                self.getData()
                let { table_name } = req.body
                let table = self.tableContainer
                if (table[table_name] === undefined) {
                    return self.error(
                        res,
                        `failed to delete the table "${table_name}"`
                    )
                }
                delete table[table_name]
                self.updateData()
                res.send(true)
            })
            app.get(genURL('get_table_names'), (req, res) => {
                self.getData()
                res.send(Object.keys(self.tableContainer))
            })
            app.get(genURL('get_library_manifest'), (req, res) => {
                res.send({})
            })
            app.get(genURL('project_has_data'), (req, res) => {
                self.getData()
                res.send(
                    Object.keys(self.keyContainer).length > 0 ||
                        self.tableContainer.length > 0
                )
            })
            app.delete(genURL('clear_all_data'), (req, res) => {
                self.data = { keys: {}, tables: {} }
                self.updateData()
                res.send(true)
            })
            function genURL(path) {
                return `/datablock_storage/:id/${path}`
            }
            initalized = true
        }
    }
    get emptyTable() {
        return { records: [], nextId: 1 }
    }
    get keyContainer() {
        return this.data['keys']
    }
    get tableContainer() {
        return this.data['tables']
    }
    csvToJSON(csv) {
        const csvData = csv.replace(/^\s*|\s*$/g, '')
        const rows = csvData.split(/\n\s*/g)
        const headers = rows[0].split(',')
        let data = this.emptyTable
        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i].match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g)
            let obj = {}
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = rowData[j]
                    ? rowData[j].replace(/"/g, '')
                    : null
            }
            data.records = data.records.concat(obj)
        }
        data.nextId = Number(data.records[data.records.length - 1].id) + 1
        return data
    }
    error(res, output) {
        return res.status(400).send({ msg: output, type: output })
    }
    getData() {
        this.data = JSON.parse(fs.readFileSync(this.directory, 'utf-8'))
    }
    jsonToCSV(data) {
        const headers = ['id']
        let csv = 'id,'
        for (let d of data) {
            for (let p in d) {
                if (headers.indexOf(p) < 0) {
                    headers.push(p)
                    csv += `${p.includes(',') ? '"' + p + '"' : p},`
                }
            }
        }
        csv = csv.slice(0, -1)
        for (let i = 0; i < data.length; i++) {
            csv += `\n`
            for (let j = 0; j < headers.length; j++) {
                let h = headers[j]
                csv += (data[i][h] || '') + (j + 1 < headers.length ? ',' : '')
            }
        }
        return csv
    }
    updateData() {
        fs.writeFileSync(this.directory, JSON.stringify(this.data), 'utf-8')
    }
}
module.exports = {
    Database,
}
