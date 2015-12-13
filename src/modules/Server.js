import Hapi from 'hapi';

export default class Server {
  constructor(host, port){
    this.host = host;
    this.port = port;

    this.routes = [{
      method: 'GET',
      path: '/',
      handler: this.main
    }];

    this.setServer();
    this.parseRoutes();
    this.startServer();
  }

  setServer(){
    this.server = new Hapi.Server();
    this.server.connection({
      host: this.host || 'localhost',
      port: this.port || 80
    });
  }

  parseRoutes(){
    for(let i in this.routes){
      this.server.route(this.routes[i]);
    }
  }

  startServer(){
    this.server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', this.server.info.uri);
    });
  }

  main(req, res){
    return reply('hello world!');
  }
}
