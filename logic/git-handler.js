var git = require("gift");
var crypto = require('crypto');
var async = require("async");

class GitHandler {
    constructor(folder, remote, branch) {
        this.repo = new git(folder);
        this.remote = remote;
        this.branch = branch;
    }

    run(callback, verbose) {
        async.series([
            //git add --all
            function (cb) {
                if (verbose) console.log("Running 'git add --all'");
                this.repo.add("--all", (err, res)=>{
                    if (err) return cb(err);
                    cb(null, res);
                });
            }.bind(this),
            //git status
            function (cb) {
                if (verbose) console.log("Running 'git status'");
                this.repo.status((err, res)=>{
                    if (err) return cb(err);
                    if (res.clean) return cb({message:"Nothing to commit"});
                    cb(null, res);
                });
            }.bind(this),
            //set actor
            function(cb) {
                if (verbose) console.log("Setting actor");
                this.repo.identify({
                    "name": "cron",
                    "email": "cron@job",
                    "hash": crypto.createHash('md5').update("cron@job").digest('hex')
                }, (err, res)=>{
                    if (err) return cb(err);
                    cb(null, res);
                });
            }.bind(this),
            //git commit
            function(cb) {
                var message = `Update ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}`;
                if (verbose) console.log(`Running 'git commit -m "${message}"'`);
                this.repo.commit(message, (err)=> {
                    if (err) return cb(err);
                    cb();
                });
            }.bind(this),
            //git push
            function(cb){
                if (verbose) console.log(`Running 'git push ${this.remote} ${this.branch}'`);
                this.repo.remote_push(this.remote, this.branch, (err)=>{
                    if (err) return cb(err);
                    cb();
                });
            }.bind(this)
        ], (err, res)=>{
            callback(err, res);
        });
    }
}

module.exports = GitHandler;