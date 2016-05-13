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
  },
  config: {
    url: env.get('url'),
    twitter_account_id: env.get('twitter').account_id,
    twitter_username: env.get('twitter').username,
    test_viability_threshold: parseInt(env.get('test').viability_threshold),
    domain_security: env.get('domain').security,
    domain_security_token: env.get('domain').security_token,
    alerts_sending: env.get('alerts').sending,
    alerts_admin_email: env.get('alerts').admin_email,
    sendgrid_api_key: env.get('sendgrid').api_key,
    actionnetwork_integration: env.get('actionnetwork').integration,
    actionnetwork_api_key: env.get('actionnetwork').api_key,
    actionnetwork_less_emails_tag: env.get('actionnetwork').less_emails_tag,
    email_scheduler: env.get('email').scheduler,
    email_from_address: env.get('email').from_address,
    email_from_name: env.get('email').from_name,
    email_unsubscribe_url: env.get('email').unsubscribe_url,
  }

};
