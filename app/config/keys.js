var Habitat = require('habitat');

Habitat.load('.env');

var
  env = new Habitat('', {
    port: 3019
  });

module.exports = {
  session: {
    secret: env.get('session').secret || 'omgomgomg'
  },
  db: {
    name:   env.get('db').name,
    user:   env.get('db').user,
    pass:   env.get('db').pass,
    host:   env.get('db').host,
    port:   env.get('db').port,
    prefix: env.get('db').prefix
  },
  port: env.get('port')
};
