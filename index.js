const puppeteer = require("puppeteer");
const request = require('request');
var http=require('http');
var express=require('express');

var app=express();
app.set('view engine', 'ejs');
app.set("views",__dirname);
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

var port = process.env.PORT || 3000;

app.get('/find',function(req,res){
    var url = req.query.url;
    var array = [];
    (async () => {
        const browser = await puppeteer.launch({
            args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
            ],
            });
        var page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768});
        await page.goto(url,{waitUntil: 'load', timeout: 0});  
        try{
            var requrl = await page.evaluate(() => {let requrl =  document.getElementsByClassName('a-link-emphasis a-text-bold')[0].href;return requrl; });
        }
        catch(error){
            res.send(error);
        }
        await page.goto(requrl,{waitUntil: 'load', timeout: 0});  
        var titles = await page.evaluate(() => {
                let data = [];
                let elements = document.getElementsByClassName('a-size-base review-title a-text-bold');
                let n = elements.length;
                for (var i=0;i<n;i++)
                    data.push(elements[i].textContent);
                return data;
        });
        var data = await page.evaluate(() => {
                let data = [];
                let elements = document.getElementsByClassName('a-size-base review-text review-text-content');
                let n = elements.length;
                for (var i=0;i<n;i++)
                    data.push(elements[i].textContent);
                return data;
        });
        var c=2,x=1;
            for(var i=2;i<6;i++){
            try{
                c=i;
              var requrl1 = requrl+"&pageNumber="+c;
              console.log(requrl1);
                await page.goto(requrl1,{waitUntil: 'load', timeout:0}); 
                var titles1 = await page.evaluate(() => {
                        let data = [];
                        let elements = document.getElementsByClassName('a-size-base review-title a-text-bold');
                        let n = elements.length;
                        for (var i=0;i<n;i++)
                            data.push(elements[i].textContent);
                        return data;
                });
                var data1 = await page.evaluate(() => {
                        let data = [];
                        let elements = document.getElementsByClassName('a-size-base review-text review-text-content');
                        let n = elements.length;
                        for (var i=0;i<n;i++)
                            data.push(elements[i].textContent);
                        return data;
                });
                data = data.concat(data1);
                titles = titles.concat(titles1);
                c++;
            }
            catch(error){
                console.log("no page");
                break;
            }
            }
        debugger;
        await browser.close();
        var str,mstr;
        for(var i=0;i<titles.length;i++){
            str = titles[i];
            mstr = str.replace( /[\r\n]+/gm, "" ); 
            mstr = mstr.trim();
            titles[i] = mstr;
        }
        for(var i=0;i<data.length;i++){
                str = data[i];
                mstr = str.replace( /[\r\n]+/gm, "" ); 
                mstr = mstr.trim();
                data[i] = mstr;
        }
        var reviews={};
        for(i=0;i<data.length;i++){
            var temp = {title:titles[i],comment:data[i]};
            reviews[i] = temp;
        }
        res.send(reviews);
    })(); 
})

app.listen(port);