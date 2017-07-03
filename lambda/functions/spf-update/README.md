# SPF update function

AWS lambda function to call some of the SPF tools script for the given domain and update the records in Akamai if needed.

The function calls the following commands:

1. `compare.sh $DOMAIN $ORIG_SPF`
1. `despf.sh $ORIG_SPF | normalize.sh | simplify.sh | mkblocks.sh $DOMAIN | DOMAIN=$DOMAIN ORIG_SPF=$ORIG_SPF DRY_RUN=$DRY_RUN node ./scripts/plugins/akamai.js`

The function expects `event` to include both `DOMAIN` and `ORIG_SPF`, e.g.:

```
{
  "DOMAIN": "apiary-staging.in",
  "ORIG_SPF": "spf-orig.apiary-staging.in",
  "DRY_RUN": 1
}
```

## Dry run

The function updates the DNS records via Akamai API. To avoid this and test the function without changing anything, set `DRY_RUN` to 1.

## Deploy

Before deploying, add a `project.json` file to `lambda` folder. The file should look something like this:

```
{
  "name": "spf-tools",
  "description": "",
  "memory": 128,
  "timeout": 300,
  "role": "<role-arn>",
  "environment": {}
}
```

1. Run `npm run lambda-prepare` in the project root
1. Navigate to `./lambda` folder and run `apex deploy`

## Tweaks

AWS Lambda environment does not include the `host` command needed for SPF tools. The folder `./lambda/functions/spf-update/bin` and `./lambda/functions/spf-update/lib` contain the command and necessary libraries (copied from an Amazon Linux instance).

Command `lambda-prepare` copies the files needed to the function folder. The files include the scripts from the root folder and the following folders: node_modules, include and plugins.
