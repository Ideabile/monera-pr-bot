'use strict';
import PullRequest from './modules/PullRequest.js';
import Server from './modules/Server.js';
let options = process.argv.slice(2);

export default (function(){
  let dirName = __dirname.split('/');
  dirName = dirName[dirName.length-1];
  if(options[0] === 'server') eturn new Server('localhost', 8081);

  for(let index in process.argv){
    if((process.argv[index].indexOf(dirName) > -1)){
      return new PullRequest(...options).create(()=>{console.log('PR created!')});
    }
  }
  
  return PullRequest;
})();
