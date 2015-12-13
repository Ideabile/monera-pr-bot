import GitHub from 'octonode';

let gh_user = process.env.GH_USER || false;
let gh_pass = process.env.GH_PASS || false;
let gh_token = process.env.GH_TOKEN || false;
let github_conf = {};
let mode = 'process';

export default class PullRequest {

  constructor(user, repoName, file, content, desc ){
    if(!user || !repoName || !file || !content){
      throw new Error('user, repo, file and content are required to create a Pull Request.');
    }

    if(gh_user && gh_pass){
      this.github = GitHub.client({
        username: gh_user,
        password: gh_pass
      });
    }else if(gh_token){
      this.github = GitHub.client(gh_token);
    }else{
      throw new Error('You need to set a method to authenticante GH_USER and GH_PASS or GH_TOKEN');
    }

    this.user = user;
    this.file = file;
    this.content = content;
    this.desc = desc;
    this.repoName = repoName;

    this.fromRepo = user+'/'+repoName;
    this.bot_user = this.github.me();
    this.repo = this.github.repo(this.fromRepo);
    this.branchFrom = 'master';
    this.newBranchName = 'bot-'+this.getDate();
    this.commit = desc + '\n\n---\n\n monera-pr-bot';

    return this;
  }

  getDate(){
    var date = new Date(),
        yyyy = date.getFullYear().toString(),
        mm = (date.getMonth()+1).toString(), // getMonth() is zero-based
        dd  = date.getDate().toString(),
        M  = date.getMinutes().toString(),
        S  = date.getSeconds().toString();
    return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0])+M+S; // padding
  }

  setBotRepo(cb){
    this.github.get('/user', {}, (err, status, body, headers) => {
      gh_user = gh_user || body.login || 'monera-bot';
      this.bot_repo = this.github.repo(gh_user+'/'+this.repoName);
      if(cb) cb();
    });
  }

  fork(cb){
    this.bot_user.fork(this.fromRepo, cb);
  }

  branch(cb){
    this.bot_repo.branch(this.branchFrom, (err, res) => {
      if(err) return this.showError(err);
      if(!(res && res.commit && res.commit.sha)){
        throw new Error('Impossible to get the commit sha');
      }
      this.bot_repo.createReference(this.newBranchName, res.commit.sha, cb);
    });
  }

  pr(cb){
    var pull = {
      'title': 'PR '+this.newBranchName+' by monera-bot',
      'body': this.commit,
      'base': this.branchFrom,
      'head': gh_user + ":" + this.newBranchName
    };
    this.repo.pr(pull, cb);
  }

  write(cb){
    console.log(this.file);
    this.bot_repo.contents(this.file, (err, file) => {
        if(err) this.showError(err);
        if(file){
          this.bot_repo.updateContents(file.path, this.commit, this.content, file.sha, this.newBranchName, cb);
        }else{
          this.bot_repo.createContents(this.file, this.commit, this.content, this.newBranchName, cb);
        }
    });
  }

  showError(err){
    if(err && err.body && err.body.errors){
      console.log(err.body.errors);
    }else{
      console.log(err);
    }
  }

  create(cb){
    this.setBotRepo((err, repo) => {
      if(err) this.showError(err);
      this.fork((err, fork) => {
        if(err) this.showError(err);
        this.branch((err, file) => {
          if(err) this.showError(err);
          this.write((err, file) => {
            if(err) this.showError(err);
            this.pr((err, pr) => {
              if(err) this.showError(err);
              if(cb) cb(err, pr);
            });
          })
        })
      })
    });
  }
};
