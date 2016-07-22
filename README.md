# Free Progress

### Social ABCDE testing that doesn't suck

Free Progress is a social AB testing service that will optimize your Twitter and
Facebook sharing messaging to make your pages more viral. It discovers any pages
you upload and immediately starts testing your sharing meta tags by intercepting
user share actions and routing them through a special URL that measures share to
click ratios. You can add more sharing variations at any time via the admin, and
they will be tested against the original sharing message (and each other) with a
statistical relevance algorithm. Winners are automatically chosen and losers are
eliminated.

Free Progress requires no special setup on any page, other than a simple
JavaScript include. The server is packaged to run on Heroku, though you can run
it on any server that supports Node.js.

## Table of Contents

## Service dependencies

* **[Node.js][1]**
* **[npm][2]**
* **[Postgresql][3]**
* **[Amazon AWS S3 API][4]:** for image storage
* **[A twitter account][5]**
* **[SparkPost API][6]:** _(optional)_ used to send scheduled sharing emails
* **[An Action Network account][7]** _(optional)_ used to verify subscribers
                                      before sending emails

## Installation and Setup

### Install the dependencies

Just cd to whatever directory you installed the code into and run `npm install`.

### Configure the environment variables

All settings for Free Progress are specified via environment variables. There's
a template file with these variables stored in `env.sample`. Copy these into a
file called `.env` (important to use that filename since it's in the
`.gitignore` and you don't want to commit any of these private values into the
repo). Then, edit the `.env` file and configure these to your liking.

Here are the specific environment variables, and what they do:

* **`SESSION_SECRET`**: Set this to an arbitrary string, and keep it private. It
  is used for hashing of session tokens (when sessions are enabled)

* **`PORT`**: What port to run the server on. Not needed on Heroku / production.

* **`URL`**: The base URL for the Free Progress server app. No trailing slash!

* **`DB_NAME`**: Postgres database name

* **`DB_USER`**: Postgres database username

* **`DB_PASS`**: Postgres database password

* **`DB_HOST`**: Postgres database host lol

* **`DB_PORT`**: Postgres database port

* **`DB_PREFIX`**: This prefix is appended to any tables created in the database
  by Free Progress. Useful if you're using one database to server multiple apps.

* **`AWS_ACCESS_KEY`**: Access key for Amazon S3

* **`AWS_SECRET_KEY`**: Secret key for Amazon S3

* **`AWS_S3_BUCKET`**: S3 bucket for image storage

* **`AWS_S3_FOLDER`**: Folder to use for image storage. No trailing slash!

* **`TWITTER_ACCOUNT_ID`**: Numeric ID for your Twitter account. Required to
  generate the "card" site preview graphics that show up in the feed (instead of
  simple text links).

* **`TWITTER_USERNAME`**: Your Twitter username. Don't include the `@` symbol.

* **`TEST_VIABILITY_THRESHOLD`**: Minimum number of shares before any variation
  is sent into the viability testing / statistical ranking algorithm. Because we
  test for statistical significance, this shouldn't really matter, but I guess
  it's useful for peace of mind. Recommend setting this to 20.

* **`DOMAIN_SECURITY`**: (`on` or `off`) Whether to turn on security to authorize
  domains that embed the Free Progress javascript client. This prevents
  unauthorized sites   from using your server, but requires some extra setup
  (more info in the section below).

* **`DOMAIN_SECURITY_TOKEN`**: An arbitrary private string to generate the hash
  for domain security token strings from

* **`SPARKPOST_API_KEY`**: API key for SparkPost. Only needed if sending emails.

* **`ALERTS_SENDING`**: (`on` or `off`) Whether to send error alert emails to
  an administrator address. This will also require SparkPost to be configured in
  the environment variables.

* **`ALERTS_ADMIN_EMAIL`**: The administrator email address to send alert emails

* **`EMAIL_SCHEDULER`**: (`on` or `off`) Whether to enable the scheduled sharing
  email system. More information in the scheduled emails section.

* **`EMAIL_FROM_ADDRESS`**: Address to send sharing reminder emails from

* **`EMAIL_FROM_NAME`**: Name to use in the sharing reminder emails

* **`EMAIL_UNSUBSCRIBE_URL`**: A link to an unsubscribe page for sharing
  reminder emails.

* **`ACTIONNETWORK_INTEGRATION`**: (`on` or `off`) Whether to use Action Network
  to verify subscriber status before sending scheduled emails. Only relevent if
  Action Network is enabled. More information in the scheduled emails section.

* **`ACTIONNETWORK_API_KEY`**: Your API key for Action Network

* **`ACTIONNETWORK_LESS_EMAILS_TAG`**: The Action Network ID for the
  `less-emails` tag you set up on Action Network. More information in the
  scheduled emails section.

### Running the server

Once your packages are installed and your environment variables are setup in the
`.env` file, you can run the server:

```
  source .env
  npm start
```

If all goes well, you should see the grunt tasks running and then something like
`‼  Server running at http://0.0.0.0:9002 ‼`.

**Note:** The first time the server runs, it will automatically create the
database tables, if they don't already exist.





[1]: https://nodejs.org/en/
[2]: https://www.npmjs.com/
[3]: https://www.postgresql.org/
[4]: https://aws.amazon.com/s3/
[5]: https://twitter.com
[6]: https://www.sparkpost.com/
[7]: https://actionnetwork.org/
