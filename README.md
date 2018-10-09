# probot-app-delete-merged-branch

Forked from [https://github.com/SvanBoxel/delete-merged-branch](https://github.com/SvanBoxel/delete-merged-branch)

A GitHub app built with [Probot](https://github.com/probot/probot) that automatically deletes a branch after it's merged.

## Running it locally
1. First, follow [these instructions](https://probot.github.io/docs/development/#configure-a-github-app) for making your own GitHub app.
Give your app the following permissions:
    - Repository contents: Read & Write.
    - Pull requests: Read

2. Then, clone the repo:
```sh
git clone git@github.com:uber-workflow/probot-app-delete-merged-branch.git
```

3. Copy `.env.example` to `.env` and set the right environment variables as [here](https://probot.github.io/docs/development/#configure-a-github-app) 

4. Now, install app dependencies and run it:

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## How it works
This GitHub app listens to the `pull_request.closed` webhook. If a pull request is closed and the connected branch is merged, it will delete the branch.
