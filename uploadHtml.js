const AWS = require('aws-sdk')
const logplease = require('logplease')
const agent = require('global-agent')
const fs = require('fs')

const bootstrap = agent.bootstrap
logplease.setLogfile('debug.log')
logplease.setLogLevel('DEBUG')
const logger = logplease.create('logger name')
AWS.config.logger = logger

process.env.GLOBAL_AGENT_HTTP_PROXY = 'http://127.0.0.1:7890';
bootstrap()
const albumBucketName = 'test.znox.top'
const bucketRegion = 'ap-southeast-2'

AWS.config.update({
    region: bucketRegion,
});

var s3 = new AWS.S3({ apiVersion: '2006-03-01' })
// const htmlPath = path.resolve(__dirname,'../webAdmin/dist/index.html')
// console.log(htmlPath);
var fileStream = fs.createReadStream('F:/work/webAdmin/dist/index.html');
const objectParams = {
    Bucket: albumBucketName,
    Key: 'index.html',
    Body: fileStream,
    ContentType: 'text/html'
}

s3.putObject(objectParams)
    .promise()
    .then((data) => {
        console.log('putObject', data);
    }, err => {
        console.log('putObjectErr', err);
    })