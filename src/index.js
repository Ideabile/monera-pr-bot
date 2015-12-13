'use strict';
import PullRequest from './modules/PullRequest.js';
import Server from './modules/Server.js';
let options = process.argv.slice(2);

export default (function(){
  console.log(options);
  if(options[0] === 'server') return new Server('localhost', 8081);
  return new PullRequest(...options).create(()=>{console.log('PR created!')});
})();
