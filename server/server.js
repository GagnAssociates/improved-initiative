/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
define(["require", "exports", 'express'], function (require, exports, express) {
    var port = process.env.PORT || 80;
    var app = express();
    app.use(express.static('./'));
    app.get('/', function (req, res) {
        res.render('index.html');
    });
    var server = app.listen(port, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Improved Initiative listening at http://%s:%s', host, port);
    });
});
//# sourceMappingURL=server.js.map