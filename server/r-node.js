process.mixin(GLOBAL, require("sys"));
var fs = require("fs");
var URL = require("url");
var querystring = require ("querystring");
var http = require("http");
process.mixin(GLOBAL, require("./rserve"));

function rprompt () {
    process.stdio.write("> ");
}

function printResult (r) {
    puts(JSON.stringify(r));
    rprompt();
}

/*
// THis sequence fails for now - it returns tags:
   fruit <- c(5, 10, 1, 20)
   names(fruit) <- c("orange", "banana", "apple", "peach")
   lunch <- fruit[c("apple","orange")]
//   
//   This fails to;
//  e <- numeric()
//  attr(e, "t") <- "hi"
//  attributes(e)
//
//  and this:
//
 state <- c("tas", "sa",  "qld", "nsw", "nsw", "nt", "wa", "wa", "qld", "vic", "nsw", "vic", "qld", "qld", "sa", "tas", "sa",  "nt",  "wa",  "vic", "qld", "nsw", "nsw", "wa", "sa",  "act", "nsw", "vic", "vic", "act")
 statef <- factor(state)
 incomes <- c(60, 49, 40, 61, 64, 60, 59, 54, 62, 69, 70, 42, 56, 61, 61, 61, 58, 51, 48, 65, 49, 49, 41, 48, 52, 46, 59, 46, 58, 43)
 incmeans <- tapply(incomes, statef, mean)

  ----

 z <- c(1,2,3,4,5,6,7,8,9,0)
 dim(z) <- c(2,5)
 z

 x <- array(1:20, dim=c(4,5))


  attach(faithful)
  summary(eruptions)
  fivenum(eruptions) // this is ok
  stem(eruptions) // this is a graph
  hist(eruptions) // another graph
  hist(eruptions, seq(1.6, 5.2, 0.2), prob=TRUE)
  lines(density(eruptions, bw=0.1))
  rug(eruptions) // This line and the other two above run them together.
  ecdf(eruptions) // XT_CLOS??
  plot(ecdf(eruptions), do.points=FALSE, verticals=TRUE)

long <- eruptions[eruptions > 3]
plot(ecdf(long), do.points=FALSE, verticals=TRUE)
x <- seq(3, 5.4, 0.01)
lines(x, pnorm(x, mean=mean(long), sd=sqrt(var(long))), lty=3)
par(pty="s")       # arrange for a square figure region
qqnorm(long); qqline(long)

x <- rt(250, df = 5)
qqnorm(x); qqline(x)

qqplot(qt(ppoints(250), df = 5), x, xlab = "Q-Q plot for t dsn")
qqline(x)

shapiro.test(long)

ks.test(long, "pnorm", mean = mean(long), sd = sqrt(var(long)))


COntine from 8.3 in book


*/

var defaultReturnFormat = "raw";

mimeTypes = {
    '.png': 'image/png',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.html': 'text/html'
}

mimeTypesRe = /\.([^.]+)$/;
function getMimeType (url) {
    var ft = url.match (mimeTypesRe);
    return mimeTypes[ft[0]] || 'text/plain';
}

function blurb (req, resp) {
    var blurbText = "Copyright (C) 2009 The R Foundation for Statistical Computing\n" +
                    "ISBN 3-900051-07-0\n\n" +
                    "R is free software and comes with ABSOLUTELY NO WARRANTY.\n" +
                    "You are welcome to redistribute it under certain conditions.\n" +
                    "Type 'license()' or 'licence()' for distribution details.\n\n" +
                    "R is a collaborative project with many contributors.\n" +
                    "Type 'contributors()' for more information and\n" + 
                    "'citation()' on how to cite R or R packages in publications.\n\n" +
                    "This online interface to R is Copyright (C) 2010 Jamie Love\n";


    r.request("R.version.string", function (rResp) {
        var completedResponse = rResp[0] + "\n" + blurbText; 
        resp.writeHeader(200, {
          "Content-Length": completedResponse.length,
          "Content-Type": "text/plain"
        });
        resp.write (completedResponse);
        resp.close();
    });
}

function requestMgr (req, resp) {
    if (req.url == "/") {
        req.url = "/index.html";
    }
    if (req.url == "/blurb") {
        blurb(req, resp);
    }
    else if (req.url.search (/^\/R\//) == 0) {
        var url = URL.parse (req.url);
        var parts = url.href.split (/\//);

        var request = querystring.unescape(parts[2]);

        if (defaultReturnFormat == "pretty") {
            request = "paste(capture.output(print(" + request + ")),collapse=\"\\n\")";
        }

        r.request(request, function (rResp) {
            var str = JSON.stringify(rResp);

            if (defaultReturnFormat == "pretty" && rResp.length) {
                str = rResp[0];
            }

            resp.writeHeader(200, {
              "Content-Length": str.length,
              "Content-Type": "text/plain" // Change to application/json TODO
            });
            resp.write (str);
            resp.close();
        });

        return;
    } else {
        var file = "../client/htdocs" + req.url;
        fs.stat(file, function (err, stats) {
            if (err) {
                resp.writeHeader(404, { "Content-Type": "text/plain" });
                resp.close();
            } else {
                resp.writeHeader(200, {
                  "Content-Length": stats.size,
                  "Content-Type": getMimeType (req.url)
                });
                fs.readFile (file, "binary", function (err, data) {
                    if (err) {
                        resp.writeHeader(404, { "Content-Type": "text/plain" });
                        resp.close();
                    } else {
                        resp.write (data, "binary");
                        resp.close();
                    }
                });
            }
        });
    }

}

var ui = http.createServer(requestMgr);
ui.listen (2903, 'localhost');


r = new RservConnection();
r.connect(function (requireLogin) {
   r.login ('test', 'test');
});
r.request("R.version.string", function (version) {
    process.stdio.write(version + "\n\n");


    process.stdio.addListener ("data", function (d) { // Looks like in practice this returns a line.
        r.request (d, printResult);
    });

    rprompt();
    process.stdio.open(encoding="utf8");

});

