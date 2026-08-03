# Understanding the Lab

Create an account and log into your instance

Claim the reward like any normal user would do, but watch this, it resets after 24hrs.

However, Ponzi did find a way to claim it 4 times in total


# Race Condtion

Now, create a second account 

Best extension for this kind of act, firefox multi account containers, set it up and configure your proxies, or just use chrome and cognito mode

Once done, intercept a claim request and send to burp.

Leave the intercept on, go to burp, duplicate the request how many times you like, but at least >3 request (needs 150 to ulock the vault), adding them to a single group

Now, choose send group in parrallel (last byte sync), last byte sync is best for HTTP 1.1

Click send, and on the web app, refresh the page and turn off the intercept

Claim the vault and get your flag

