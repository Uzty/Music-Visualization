function $(s) {
    return document.querySelectorAll(s);
}
var lis = $("#list li");
var size = 128;
var box = $("#box")[0];
var height, width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
var line;

var mv = new MusicVisualizer({
    size: size,
    visualizer: draw
})

function bindEvent(){
    var lis = $("#list li");
    lis.forEach(function (v) {
        v.onclick = function () {
            lis.forEach(function (li) {
                li.className = "";
            })
            this.className = "selected";
            mv.play("media/" + this.title);
        }
    })
}
bindEvent();


/**
 * [isMobile 判断平台]
 * @param test: 0:iPhone    1:Android
 */
function ismobile(test){
    var u = navigator.userAgent, app = navigator.appVersion;
    if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))){
        if(window.location.href.indexOf("?mobile")<0){
            try{
                if(/iPhone|mac|iPod|iPad/i.test(navigator.userAgent)){
                    return '0';
                }else{
                    return '1';
                }
            }catch(e){}
        }
    }else if( u.indexOf('iPad') > -1){
        return '0';
    }else{
        return '1';
    }
};



function random(m, n) {
    return Math.round(Math.random() * (n - m) + m);
}
function getDots() {
    Dots = [];
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = "rgba(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ",0)";
        Dots.push({
            x: x,
            y: y,
            dx: random(1,4),
            color: color,
            cap:0,
        });
    }
}

function resize() {
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0, 0, 0, height);
    line.addColorStop(0, "red");
    line.addColorStop(0.5, "yellow");
    line.addColorStop(1, "green");
    ctx.fillStyle = line;
    getDots();
}
resize();

window.onresize = resize;

function draw(arr) {
    ctx.clearRect(0, 0, width, height);
    var w = width / size;
    var cw = w * 0.6;
    var capH = cw>10?10:cw;
    ctx.fillStyle = line;
    arr.forEach(function (v, i) {
        if (draw.type == "column") {
            var o = Dots[i];
            var h = v / 256 * height;
            ctx.fillRect(w * i, height - h, cw, h);
            ctx.fillRect(w * i, height - (o.cap + capH), cw, capH);
            o.cap--;
            if(o.cap < 0){
                o.cap = 0;
            }
            if(h > 0 && o.cap < h + 40){
                o.cap = h + 40 > height - capH ? height - capH : h + 40;
            }
        } else if (draw.type == "dot") {
            ctx.beginPath();
            var o = Dots[i];
            var r = 10 + arr[i] / 256 * (height > width? width: height)/10;
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            g.addColorStop(0, "#fff");
            g.addColorStop(1, o.color);
            ctx.fillStyle = g;
            ctx.fill();
            o.x += o.dx;
            o.x = o.x > width? 0 : o.x;
        }

    })
}
draw.type = "column";
var types = $("#type li");
types.forEach(function (v, i) {
    v.onclick = function () {
        types.forEach(function (li) {
            li.className = "";
        })
        this.className = "selected";
        draw.type = this.getAttribute("data-type");
    }
})

$("#volume")[0].onchange = function () {
    mv.changeVolume(this.value / this.max);
}
$("#volume")[0].onchange();

$("#add")[0].onclick = function () {
    $("#upload")[0].click();
}
$("#upload")[0].onchange = function(){
    var file = this.files[0];
    var fr = new FileReader();
    var arr = file.name.split(".")
    var format = arr[arr.length -1];
    if(format!="mp3"){
        alert("只支持MP3格式音乐文件，你还传"+format+"文件，是不是sa (╯‵□′)╯︵┻━┻");
        return;
    }
    fr.onload = function (e) {
        mv.play(e.target.result);
    }
    fr.readAsArrayBuffer(file);

    var form = $("#uploadForm")[0];
    sendForm(form,file,function(res){
        res = JSON.parse(res)
        if(res.status == 100){
            var lis = $("#list li");
            lis.forEach(function (li) {
                li.className = "";
            })
            var li = document.createElement('li');
            li.title = file.name;
            li.innerHTML = file.name;
            li.className = "selected";

            $("#list")[0].appendChild(li);
            bindEvent();
        }
    })

}
function sendForm(form,file,callback) {
    var formData = new FormData(form);
    formData.append('upload', file);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', form.action, true);
    xhr.onload = function(e) {
        callback(this.responseText);
    };
    xhr.send(formData);
    return false;
}