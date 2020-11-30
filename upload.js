const AWS = require('aws-sdk')
// const logplease = require('logplease')
const agent = require('global-agent')
const fs = require('fs')

const bootstrap = agent.bootstrap
// logplease.setLogfile('debug.log')
// logplease.setLogLevel('DEBUG')
// const logger = logplease.create('logger name')
// AWS.config.logger = logger

process.env.GLOBAL_AGENT_HTTP_PROXY = 'http://127.0.0.1:7890';
bootstrap()
const albumBucketName = 'test.znox.top'
const bucketRegion = 'ap-southeast-2'

AWS.config.update({
    region: bucketRegion,
});

var s3 = new AWS.S3({ apiVersion: '2006-03-01' })
var filePath = 'F:/work/webAdmin/dist/'
var fileList = []

function readFileList(path) {
    var files = fs.readdirSync(path)
    files.forEach((item) => {
        var stat = fs.statSync(path + item)
        if (stat.isDirectory()) {
            readFileList(path + item + '/')
        } else {
            fileList.push(path + item)
        }
    })
    return fileList
}


function listOldFiles() {
    return new Promise((resolve, reject) => {
        let params = {
            Bucket: albumBucketName
        }
        s3.listObjectsV2(params).promise().then(data => {
            let keyArray = data.Contents.reduce((aur, cur) => {
                if (!(/static/).test(cur.Key)) {
                    aur.push(cur.Key)
                }
                return aur
            }, []);
            resolve(keyArray)
        }, err => {
            reject(err)
        })
    })
}

function upload(filesPathArray) {
    filesPathArray.forEach(item => {
        const array = item.split('/')
        const distIndex = array.indexOf('dist')
        let key = array.slice(distIndex + 1).join('/')
        var fileStream = fs.createReadStream(item);

        listOldFiles().then((data) => {
            // 存在就删除旧的
            data.indexOf(key) >= 0 ? s3.deleteObject({ Bucket: albumBucketName, Key: key }, function (err, data) {
                if (err) console.log('deleteerr', err);
                putObjectToS3(key, fileStream)
            }) : putObjectToS3(key, fileStream)

        })

    })
}

function putObjectToS3(key, fileStream) {
    let params = {
        Bucket: albumBucketName,
        Key: key,
        Body: fileStream,
    }
    s3.putObject(params).promise().then((data) => {
        console.log('putObject', data);
    }, err => {
        console.log('putObjectError', err);
    })
}
let filesPathArray = readFileList(filePath)
upload(filesPathArray)




