// 芙桜竹 2024
// Github lilac-milena
// Website muna.uk
// LastUpdate: V4.28-P ITAP7

const express = require('express');
const { MongoClient } = require('mongodb');
const { rateLimit } = require('express-rate-limit')


// 从环境变量中获取配置
const mongodbUrl = process.env.mongodbUrl || undefined // 获取环境变量
const AdminSession = process.env.AdminSession || undefined // 获取环境变量
const linkLen = process.env.linkLen || 10 // 如未指定链接长度则默认为10
const mongodbDB = process.env.mongodbDB || 'Muaca' // 如未指定数据库则默认为 Muaca
const mongodbCollection = process.env.mongodbCollection || 'Links' // 如未指定集合则默认为 Links


let database = null // 数据库 Client

let cache = {} // 缓存，用于加速数据库查询，优先于数据库查询
let enableCache = true // 是否启用缓存

// class
class MunakaDatabaseFunctionsClass {
    async searchLink(path) {
        if (cache[path] == undefined) {
            let database = await db_connect()
            let collection = database.collection(mongodbCollection)
            let result = await collection.find({ path: path }).toArray()

            if (enableCache == true) {
                cache[path] = result // 将结果存入缓存
            }

            return result
        } else {
            console.log(path+" 命中缓存")
            return cache[path]
        }
    }
    async createLink(creater, path, to) {

        function isNotDisablePath(path) {
            var oneUrl = path.split("/")[1]
            if (oneUrl != "admin") {
                return true
            } else {
                return false
            }
        }

        let database = await db_connect()
        if (path == undefined) {
            while (true) {
                var thisPath = randomString(linkLen)
                var searchResult = await this.searchLink(thisPath)
                if (searchResult.length == 0 && isNotDisablePath(thisPath) == true) {
                    path = "/"+thisPath
                    break
                }
            }
        } else {

            if (path[0]!="/") {
                path = "/" + path
            }

            var searchResult = await this.searchLink(path)
            if (searchResult.length != 0 || isNotDisablePath(path) == false) {
                return "Path already exists"
            }
        }
        let collection = database.collection(mongodbCollection)
        let result = await collection.insertOne({ creater: creater, path: path, to: to })
        
        if (result.insertedId != undefined) {

            if (enableCache == true) {

                // 写入缓存
                cache[path] = [{ creater: creater, path: path, to: to }]
            }

            return path
        } else {
            return false
        }
    }
    async deleteLink(path) {
        let database = await db_connect()
        let collection = database.collection(mongodbCollection)
        let result = await collection.deleteOne({ path: path })

        if (enableCache == true) {
            // 删除缓存
            try {
                delete cache[path]
            } catch (error) {
                // console.log("缓存删除失败")
            }
        }

        return result
    }
    async editLink(path,newPath) {
        var data = await this.searchLink(path)
        await this.deleteLink(path)
        await this.createLink(data[0].creater,path,newPath)
        return true
    }
    async auth(session) { // 如需修改权限验证方式请修改此函数
        switch (session.type) {
            case "session":
                if (session.session == AdminSession) {
                    return {"username":session.session}
                } else {
                    return false
                } 
            default:
                return false
        }
    }
    async getLinkList(page, pageSize,other) {

        if (other == undefined) {
            var flll = { }
        } else {
            var flll = { $and:[JSON.parse(other)] }
        }

        try {
            pageSize = parseInt(pageSize)
            // 分页
            let database = await db_connect()
            let collection = database.collection(mongodbCollection)
            let result = await collection.find(flll).sort({_id:-1}).skip(page * pageSize).limit(pageSize).toArray()

            // 获取总页数
            let count = await collection.countDocuments(flll)
            let pageCount = Math.ceil(count / pageSize)

            return {"pageCount":pageCount,"list":result}
        } catch (error) {
            return {"error":"Internal Server Error"}
        }
    }
}


const MunakaDatabaseFunctions = new MunakaDatabaseFunctionsClass()



function randomString(len) {
    len = len || 32;
    var $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'; 
    var maxPos = $chars.length;
    var result = '';
    for (i = 0; i < len; i++) {
    result += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
}

// 获取数据库连接
async function db_connect() {

    if (database != null) {
        return database
    } else {
        console.log("Connecting to MongoDB...")
        try {
            var client = await MongoClient.connect(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
            database = client.db(mongodbDB)
            console.log("Connected to MongoDB")

            // 判断集合是否存在
            var collections = await database.listCollections().toArray()
            if (collections.find((item) => item.name === mongodbCollection) == undefined) {
                await database.createCollection(mongodbCollection)
                console.log("Created collection "+mongodbCollection)
            } else {
                console.log("Collection "+mongodbCollection+" already exists")
            }

        } catch (error) {
            console.log("Error connecting to MongoDB")
            console.log(error)
        }
        return database
    }
}

// 服务器配置
const app = express();
const port = 3000;

// 初始化
async function init() {
    console.log(
        "Munalink Server Init\n" +
        "linkLen: " + linkLen + "\n" +
        "mongodbDB: " + mongodbDB + "\n" +
        "mongodbCollection: " + mongodbCollection + "\n" +
        "enableCache: " + enableCache + "\n" +
        "--------------------------"
    )

    if (enableCache == false) {
        console.log(
            '\033[44;37m Warn \033[40;34m 缓存功能未开启，该功能可极大提升数据处理速度，建议开启\033[0m' + "\n" +
            "--------------------------"
        )
    }

    await db_connect()

    app.listen(port, () => {
        console.log(
            `Bingo! Munalink listening at http://localhost:${port}` + "\n" +
            "--------------------------"
        )
    })
}
init()


// 默认监听端口 3000 Port
// 关于 URL 分配
// 保留 /api/ 用于 API
// 数据库结构
// id created_at creater path to

app.all('*', function (req, res, next) {
    res.header("Content-Type", "application/json;charset=utf-8"); // 响应类型
    next();
});

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 min
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 1 min).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

// 将速率限制应用至所有 admin api 下
app.use("/admin/api/*", limiter)
app.get("/admin/api/*", async (req, res) => {
    let path = req.query.path
    let to = req.query.to
    let session = {
        type: req.headers.type,
        session: req.headers.session
    }

    let apiPath = req.path

    if (session == undefined || session == "") {
        var authResult = false
    } else {
        // auth
        var authResult = await MunakaDatabaseFunctions.auth(session)
    }
    
    if (authResult == false) {
        switch (apiPath) {
            case "/admin/api/Oauth":
                var type = req.query.type
                var code = req.query.code
                switch (type) {

                    default:
                        res.status(400).json({"error":"Unknown type"})
                        return
                }
            default:
                res.status(401).json({"error":"Unauthorized"})
                return
        }
    } else {
        switch (apiPath) {
            case "/admin/api/create":

                if (path != undefined) {
                        const buffPath = Buffer.from(path, 'base64');
                    path = buffPath.toString('utf-8')
                }


                // 使用正则匹配 path，仅允许字母数字连字符及下横线和斜杠
                
                const pattern = /^[a-zA-Z0-9_\-/.]*$/;

                if (to == undefined || pattern.test(path) == false) {
                    res.status(400).json({"error":"The path or url format is illegal. The custom path only allows English letters(a-z,A,Z), Arabic numerals(0-9), slashes(/), hyphens(-), dots(.) and underscores(_)."})
                    return
                } else {
                    const buffTo = Buffer.from(to, 'base64');
                    to = buffTo.toString('utf-8');

                    var result = await MunakaDatabaseFunctions.createLink(authResult.username, path, to)
                    if (result == false) {
                        res.status(500).json({"error":"Internal Server Error"})
                        return
                    } else {
                        if (result == "Path already exists") {
                            res.status(409).json({"error":"Path already exists"})
                            return
                        } else {
                            res.status(200).json({ path: result })
                            return
                        }
                    }
                }
            case "/admin/api/delete":
                if (path == undefined) {
                    res.status(400).json({"error":"Bad Request"})
                    return
                } else {
                    var result = await MunakaDatabaseFunctions.deleteLink(path)
                    if (result == false) {
                        res.status(500).json({"error":"Internal Server Error"})
                        return
                    } else {
                        if (result.deletedCount == 0) {
                            res.status(404).json({"error":"Link not found"})
                            return
                        } else {
                            res.status(200).json({"status":"OK"})
                            return
                        }
                    }
                }
            case "/admin/api/getLinkList":
                var page = req.query.page
                var pageSize = req.query.pageSize
                var other = req.query.other

                if (page == undefined || pageSize == undefined) {
                    res.status(400).json({"error":"Bad Request"})
                    return
                } else {
                    var result = await MunakaDatabaseFunctions.getLinkList(page, pageSize,other)
                    res.status(200).json(result)
                    return
                }
            case "/admin/api/edit":
                var newPath = req.query.newPath
                if (path == undefined || newPath == undefined) {
                    res.status(400).json({"error":"Bad Request"})
                    return
                } else {

                    const buffTo = Buffer.from(newPath, 'base64');
                    newPath = buffTo.toString('utf-8')

                    await MunakaDatabaseFunctions.editLink(path,newPath)
                    res.status(200).json({"status":"OK"})
                    return
                }
            case "/admin/api/auth":
                res.status(200).json({"status":"OK","username":authResult.username})
                return
            default:
                res.status(404).json({"error":"API not found"})
                return
        }
    }
})

app.get("/*", async (req, res) => {
    // 获取请求开始时间戳
    let startTime = new Date().getTime()

    let path = req.path
    // get user ip
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    // 注：
    // path 起始字符为 /

    var result = await MunakaDatabaseFunctions.searchLink(path)
    if (result.length == 0) {

        // 获取请求结束时间戳
        let endTime = new Date().getTime()
        let costTime = endTime - startTime
        console.log("Cost "+costTime+"ms")



        res.header("Content-Type", "text/html; charset=utf-8"); // 响应类型
        res.status(404).send('Not found.')
    } else {


        // 获取请求结束时间戳
        let endTime = new Date().getTime()
        let costTime = endTime - startTime
        console.log("Cost "+costTime+"ms")

        // 302 重定向
        res.status(302).setHeader("Location", result[0].to)
        res.send()
    }
})
