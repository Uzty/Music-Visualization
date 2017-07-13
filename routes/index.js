var express = require('express');
var router = express();
var path = require('path');
var fs = require("fs")
var formidable = require('formidable')
var media = path.join(__dirname, "../public/media");

/* GET home page. */
router.get('/', function (req, res, next) {
    fs.readdir(media, function (err, names) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {title: 'Passionate Music', music: names});
        }
    })
});

router.post('/upload', function (req, res, next) {
    const form = new formidable.IncomingForm()
    form.uploadDir = media
    form.keepExtensions = true // 配置保持文件原始的扩展名
    form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err)
            }
        fs.rename(files.upload.path,media + "/"+files.upload.name,function(err){
            if(err){
                console.error("改名失败"+err);
            }
            res.json({ status: 100,msg:'成功'});
        });

        }
    )
});

module.exports = router;

