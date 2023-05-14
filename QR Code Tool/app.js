const express=require('express');
const qrcode=require('qrcode');
const fs=require('fs');
const jsqr=require('jsqr');
const jimp=require('jimp');
const bodyparser=require('body-parser');
const multer=require('multer');
const app=express();
const port=3000;
const folder=__dirname;

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(folder+'/public'));
app.set('view engine','ejs');

var storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./qrcodes')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
});
const upload=multer({storage:storage});

function reset(){
    let folder=__dirname+'/qrcodes/';
    fs.readdir(folder,(err,fls)=>{
        for(const file of fls){
            fs.unlinkSync(folder+file);
        }
    });
}

app.get('/',(req,res)=>{
    reset();
    res.sendFile(folder+'/pages/home.html');
});

app.get('/generator',(req,res)=>{
    res.sendFile(folder+'/pages/generator.html');
});

app.post('/generate',(req,res)=>{
    const info=req.body.info;
    qrcode.toFile(folder+'/public/images/qr.png',info,{erroCorrectionLevel:'H'},(err)=>{
        console.log('QR Generated');
    });
    res.sendFile(folder+'/pages/download.html');
});

app.post('/download',(req,res)=>{
    res.download(folder+'/public/images/qr.png');
});

app.get('/decoder',(req,res)=>{
    res.sendFile(folder+'/pages/decoder.html');
});

app.post('/decode',upload.single('file'),(req,res)=>{
    const buffer=fs.readFileSync(folder+'/'+req.file.path);
    jimp.read(buffer,(err,image)=>{
        const value=jsqr(image.bitmap.data,image.bitmap.width,image.bitmap.height);
        res.render('decoded',{data:value.data});
    });
});

app.listen(port,()=>{
    console.log('Server is Running....');
});