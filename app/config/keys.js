var Habitat = require('habitat');

Habitat.load('.env');

var
  env = new Habitat('', {
    port: 9002
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
  port: env.get('port'),
  aws: {
    access_key: env.get('aws').access_key,
    secret_key: env.get('aws').secret_key,
    s3_bucket:  env.get('aws').s3_bucket,
    s3_folder:  env.get('aws').s3_folder
  }
};
