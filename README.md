This is a Vanilla NodeJS project written in Typescript

## Getting Started

-   First, cd in to Rest-API in the root folder.

    ```bash
    cd Rest-API
    ```

-   You can either run the project in src folder (if you have ts-node install) or dist folder (if you want to run the app with plain node).

-   Then create two folders (`.log` and `.data`) inside either `src` or `dist` folder depending on the method you chose above.

    ```bash
    mkdir src/.logs
    mkdir src/.data

    	or

    mkdir dist/.logs
    mkdir dist/.data
    ```

-   Create three folders (`checks`, `tokens`, `users`) inside the `.data`. A lot of functionalities depends on this as the folder is where the files from the app are going to be stored. (No database).

    ```bash
    touch src/.data/checks
    touch src/.data/tokens
    touch src/.data/users

    		or

    touch dist/.data/checks
    touch dist/.data/tokens
    touch dist/.data/users
    ```

-   Run the app:

    ```bash
    ts-node src/index.ts

    or

    node dist/index.js
    ```

## The routes list of the app (both frontend and backend) are:

-   /
-   /ping
-   /api/users
-   /api/tokens
-   /api/checks
-   /account/create
-   /account/edit
-   /account/deleted
-   /session/create
-   /session/deleted
-   /checks/all
-   /checks/create
-   /checks/edit

## When you start the app, you can run some admin only command line code which can work as the admin dashboard of the app. The codes and what each code does are:

```bash

exit - Kill the CLI (and the rest of the application)

man - Show this help page

help -  Alias of the "man" command

stats - Get statistics on the underlying operating system and resource utilization

List users - Show a list of all the registered (undeleted) users in the system

More user info --{userId} : 'Show details of a specified user'

List checks --up --down : Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."

More check info --{checkId} : Show details of a specified check

List logs -  Show a list of all the log files available to be read (compressed only)

More log info --{logFileName} : Show details of a specified log file

```
