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

* **[Service Dependencies](#service-dependencies)**
* **[Installation and Setup](#installation-and-setup)**
  * **[Install the dependencies](#install-the-dependencies)**
  * **[Configure the environment variables](#configure-the-environment-variables)**
  * **[Running the server](#running-the-server)**
  * **[Turn on Domain Security (Optional)](#turn-on-domain-security-optional)**
* **[Using Free Progress](#using-free-progress)**
  * **[Using the Free Progress JavaScript Client](#using-the-free-progress-javascript-client)**
    * [Auto-discovery of pages based on sharing meta tags](#auto-discovery-of-pages-based-on-sharing-meta-tags)
    * [Handling user share and tweet actions](#handling-user-share-and-tweet-actions)
    * [Measuring conversions](#measuring-conversions)
  * **[Using the Free Progress Admin](#using-the-free-progress-admin)**
  * **[Scheduling Sharing Autoresponder Emails](#scheduling-sharing-autoresponder-emails)**
    * [POST `/emails/schedule` to schedule an email](#post-emailsschedule-to-schedule-an-email)
    * [More info on Action Network integration](#more-info-on-action-network-integration)
    * [A word about unsubscribing](#a-word-about-unsubscribing)
* **[Getting Help & Contributing](#getting-help--contributing)**
* **[License](#license)**

## Service dependencies

* **[Node.js][1]**
* **[npm][2]**
* **[ruby 2.2.3][11]:** for building and running the server
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

* **`SESSION_SECRET`**: Set this to an arbitrary string, and keep it private.

* **`PORT`**: What port to run the server on. Not needed on Heroku / production.

* **`URL`**: The base URL for the Free Progress server app. No trailing slash!

* **`ADMIN_USERNAME`**: Username for Free Progress Admin

* **`ADMIN_PASSWORD`**: Password for Free Progress Admin

* **`DB_NAME`**: Postgres database name

* **`DB_USER`**: Postgres database username

* **`DB_PASS`**: Postgres database password

* **`DB_HOST`**: Postgres database host lol

* **`DB_PORT`**: Postgres database port

* **`DB_PREFIX`**: This prefix is appended to any tables created in the database
  by Free Progress. Useful if you're using one database to serve multiple apps.

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
  domains that embed the Free Progress JavaScript Client. This prevents
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
  [scheduled emails section](#scheduling-sharing-autoresponder-emails).


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


### Install the Free Progress JavaScript Client on your site(s)

Once you have the Free Progress server running, you can add the JavaScript
Client to your site. Just add this script tag before the closing `</BODY>`:

```html
<script type="text/javascript" src="//YOUR-DOMAIN/js/client.js"></script>
```

(obviously substitute `YOUR-DOMAIN` with whatever domain Free Progress is
running on. For local testing this is usually `localhost:9002`)


### Turn on Domain Security (Optional)

By default, Free Progress will automatically "discover" any page the JavaScript
Client is hosted on and add it to the database. You can turn on Domain Security
to restrict this feature to domains you authorize, which prevents third parties
from using your Free Progress instance without permission. It is surprisingly
common for shady sites to scrape and re-host your content, so Domain Security is
recommended for production deployments.

To use Domain Security, perform the following steps:

1. the `DOMAIN_SECURITY` environment variable must be set to `on`, and the
   `DOMAIN_SECURITY_TOKEN` should be set to an arbitrary string that must be
   kept private.

2. Place a file called `freeprogress.txt` in the root of your site that you wish
   to use Free Progress on. This file must contain a [SHA-256 hash][8] of your
   `DOMAIN_SECURITY_TOKEN` value prepended to the full domain of your site.

   For example, if your `DOMAIN_SECURITY_TOKEN` is `lol`, and your site domain
   is `www.omg.com`, the hash would be computed as:

   ```
    SHA256('lolwww.omg.com')
    # 628abb24a6c9da75d3f548a9a6d047541fd546c052f9a1f46a26e3ceb37fb423
   ```

   The contents of `freeprogress.txt` should be the hexadecimal value of
   the SHA-256 hash digest.

That's all. When `DOMAIN_SECURITY` is set to `on` and the Free Progress
JavaScript Client is activated on a domain that isn't yet in the database, the
Free Progress server will scrape the `freeprogress.txt` file from your domain
and make sure it matches the correct hash, as generated from the private
`DOMAIN_SECURITY_TOKEN` value and your domain name.

**NOTE:** This configuration means you can't use `http://domain.com` and
`http://www.domain.com` interchangeably. Free Progress page discovery will only
work on the subdomain that you generate the domain security hash from.

**NOTE 2:** If `DOMAIN_SECURITY` is turned on but the `freeprogress.txt` file is
missing or invalid for a particular domain, the Free Progress JavaScript Client
will fallback to directly sharing based on the meta tags on that particular
page, bypassing the Free Progress server's share and click tracking redirect
URLs. Nothing will appear broken to your users and they will still be able to
share the page.


## Using Free Progress

### Using the Free Progress JavaScript Client

The Free Progress JavaScript Client script handles almost all sharing-related
functionality automatically, minimizing the amount of setup needed on any page.
Free Progress will automatically discover any new page that includes the Client
script. Any links or buttons with the `.twitter` or `.facebook` CSS classes will
automatically open up in a Free Progress sharing window, which tracks shares and
clicks for each AB test variation using a special redirection URL. This allows
Free Progress to automatically select winning variations and eliminate
less-effective ones.


#### Auto-discovery of pages based on sharing meta tags

Free Progress Server will automatically detect any new pages that include the
Client script. The Server will scrape the Facebook Open Graph and Twitter Card
tags to grab the initial sharing variations for these social networks.

**NOTE:** Auto-discovery only happens once, so if you change your sharing meta
tags after Free Progress scrapes the page, you'll also want to add new
variations in the [Free Progress Admin](#using-the-free-progress-admin).

##### Facebook Open Graph meta tags

Follow [Facebook's guidelines][9] to choose good sharing tags for your page.
You can always set up more variations in Free Progress Admin if you want to try
new ideas!

![](https://s3.fightforthefuture.org/images/documentation/freeprogress_facebook.png)

* **`<meta property="og:title" content="My page is not clickbait..." />`**:
  The title you want for your Facebook sharing summary. Make it clicky!

* **`<meta property="og:description" content="but definitely click here!" />`**:
  The description to use in your Facebook sharing summary.

* **`<meta property="og:image" content="https://example.com/image.jpg" />`**:
  Full URL to a Facebook sharing image.

* **`<meta property="og:site_name" content="Your Site Name" />`**:
  The name of your web site (distinct from the page title)

##### Twitter Card meta tags

Follow [Twitter's documentation][10] to set up your Twitter Card sharing tags.
These will enable Free Progress to display a graphical summary of your sharing
variations when people share the site on Twitter.

![](https://s3.fightforthefuture.org/images/documentation/freeprogress_twitter.png)

* **`<meta name="twitter:site" content="fightfortheftr" />`**:
  This should always be your Twitter username.

* **`<meta name="twitter:title" content="My page is not clickbait..." />`**:
  The title to use in your Twitter sharing summary.

* **`<meta name="twitter:description" content="Click here to learn more!" />`**:
  The description to use in your Twitter sharing summary.

* **`<meta name="twitter:image" content="https://example.com/twitter.jpg" />`**:
  Full URL to a Twitter sharing image.

* **`<meta name="twitter:text" content="My page is kewl plz click it lol" />`**:
  **NOTE: This is not an official Twitter Card meta tag.** Rather, this is
  specific to Free Progress and will automatically populate the tweet text when
  the user clicks on a Twitter sharing link (the user can edit this tweet).

##### Sharing Autoresponder Email meta tags

If you have the `EMAIL_SCHEDULER` environment variable turned `on` and use the
Free Progress Email Scheduler API to schedule sharing autoresponder emails,
these meta tags will be scraped each time a scheduled email goes out for that
page. See the [section on scheduled emails](#scheduling-sharing-autoresponder-emails)
for more information.

* **`<meta name="autoresponder_subject" content="Don't forget to share!" />`**:
  The subject of the delayed sharing autoresponder email

* **`<meta name="autoresponder_body" content="Blah blah|Second paragraph" />`**:
  The text to use in the body of the sharing autoresponder. If you absolutely
  can't keep it short, use the vertical pipe (`|`) character to separate
  paragraphs.


#### Handling user share and tweet actions

By default, any links or buttons with the `.twitter` or `.facebook` CSS classes
will automatically open up in a sharing window on the appropriate social network
using a Free Progress tracking link. You can directly call
`FreeProgress.share()` and 'FreeProgress.tweet()` from your JavaScript code to
pop a sharing window.

```javascript
FreeProgress.share();       // open a Facebook sharing window
FreeProgress.tweet();       // open a Twitter sharing window
```


#### Measuring conversions

In addition to tracking sharing stats, Free Progress can also track conversions
for your variations. Currently conversion information is not used for anything;
it's just displayed in the Free Progress Admin. At some point we may enable
conversion-based variation ranking at the Page level.

```javascript
FreeProgress.convert();     // tell Free Progress that the user "converted"
                            // (this has no effect if the user did not enter the
                            // page from a Free Progress sharing link)
```

**NOTE:** Whatever user action you decide is a "conversion" is completely up to
you. Free Progress doesn't know or care, so you'll have to call this manually.


### Using the Free Progress Admin

**Visit http://YOUR-FREE-PROGRESS-DOMAIN/admin to view the Free Progress Admin**

The Free Progress Admin is where you can create new sharing variations for your
pages and view stats. When a user clicks a sharing button on one of your pages,
one of the active variations for that page is randomly selected to be shared
using a redirection link that allows Free Progress to measure clicks.

Free Progress will periodically check the sharing stats for your page and
deactivate any variations that are determined to be statistically less-effective
than others. Eventually a winner will automatically be selected with no need to
babysit the process.

Domains and pages that show up in the admin are automatically added by the Free
Progress JavaScript Client. There is no need (or way) to manually set up domains
and pages in the Free Progress Admin.

![](https://s3.fightforthefuture.org/images/documentation/freeprogress_admin.png)

The interface is not pretty, but it should be fairly self-explanatory.


### Scheduling Sharing Autoresponder Emails

Free Progress can optionally send autoresponder emails prompting your users to
share your pages. Using an API call, you can schedule these to be sent after a
certain number of hours (for example 72 hours after a user originally takes
action on one of your pages). Emails will be sent using content scraped from the
[Sharing Autoresponder Email meta tags](#sharing-autoresponder-email-meta-tags)
on a given page. These will always be re-scraped before any email is sent, so
emails will always reflect the most up-to-date content in your meta tags.

Optionally, the email scheduler can integrate with your [Action Network][7]
account, if you have one. This will verify that recipients are subscribed to
your mailing list before sending, thus preventing emails from being sent to
people who may have unsubscribed.

As a further option, the autoresponder emails can be disabled for Action Network
users who have a tag of your choosing. For example, users may wish to opt-out
of receiving autoresponder emails while still remaining subscribed to your list.
Free Progress abides.

#### POST `/emails/schedule` to schedule an email

**Request Parameters**

* `email`: (String Email) The email address to schedule a sharing reminder for

* `url`: (String URL) The page URL to use in the sharing reminder. If
  `DOMAIN_SECURITY` is turned `on`, then this must be from an authorized domain.

* `hours`: (Integer) number of hours to wait before sending, eg. `72`

* `external_network`: (String, optional) Currently only `action-network` is a
  supported value if this parameter is passed

* `external_network_id`: (String, optional) The User ID for the user on the
  specified external network. So currently, this could only be the Action
  Network User ID.

**Response Format**

If the request succeeds, you will receive a JSON string containing `kthxbai`.

#### More info on Action Network integration

When a POST request to `/emails/schedule` comes in that specifies
`external_network=action-network`, the following steps will be performed:

1. A task will be scheduled for the specified number of `hours`.

2. Once the task executes, if the `ACTIONNETWORK_INTEGRATION` environment
   variable is not turned `on`, the task will be aborted and deleted.

3. The Action Network API will be queried for the User ID specified in the
   `external_network_id` parameter. If the user does not exist or is
   unsubscribed, the task will be aborted and deleted.

4. The Action Network API will be queried to see if the user has a tag with the
   ID specified in the `ACTIONNETWORK_LESS_EMAILS_TAG` environment variable.
   If the user is tagged to receive less emails, the task will be aborted and
   deleted.

5. If we get to this point without aborting and deleting the task, the sharing
   autoresponder email will be sent out using the content specified in the
   [Sharing Autoresponder meta tags](#sharing-autoresponder-email-meta-tags) for
   the specified `url`.

#### A word about unsubscribing

You are responsible for providing a link that will unsubscribe users from
receiving emails. Free Progress will not do this for you. If you use the Action
Network integration, you should have a page similar to the
[Fight for the Future Subscription Management Page][12] that can unsubscribe
users from Action Network.

If you're not using the Action Network integration, then you need to build an
unsubscribe page that will add a suppression entry directly on SparkPost, using
the [SparkPost API][13].

Your unsubscribe page must be specified in the `EMAIL_UNSUBSCRIBE_URL`
environment variable.


## Getting Help & Contributing

Please feel free to submit [Issues][14] if you're having a problem with Free
Progress. If you're handy with Node.js and you want to submit a new feature,
please fork the project and submit a [Pull Request][15]!

Feel free to email me at
[jeff@fightforthefuture.org](mailto:jeff@fightforthefuture.org) if you have a
question or comment that you'd rather not share with the whole class. I'll do my
best to help!


## License

Free Progress is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

Free Progress is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Free Progress. If not, see [http://www.gnu.org/licenses/][16].


[1]: https://nodejs.org/en/
[2]: https://www.npmjs.com/
[3]: https://www.postgresql.org/
[4]: https://aws.amazon.com/s3/
[5]: https://twitter.com
[6]: https://www.sparkpost.com/
[7]: https://actionnetwork.org/
[8]: http://www.xorbin.com/tools/sha256-hash-calculator
[9]: https://developers.facebook.com/docs/sharing/best-practices#tags
[10]: https://dev.twitter.com/cards/markup
[11]: https://www.ruby-lang.org/en/
[12]: https://www.fightforthefuture.org/subscription
[13]: https://developers.sparkpost.com/api/suppression-list
[14]: https://github.com/fightforthefuture/freeprogress/issues
[15]: https://github.com/fightforthefuture/freeprogress/pulls
[16]: http://www.gnu.org/licenses/
