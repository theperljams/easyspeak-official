# Easy Speak

## Running Locally

### Back-end

1. `cd back-end`
2. Create a `.env` file and add the provided credentials
3. If this is your first time, run `npm install` (`npm i`)
4. run locally with `npm run start`
5. Double check that the port matches the one in the `front-end/.env` `VITE_SERVER_URL` variable
   
### Front-end

1. `cd front-end`
2. Create a `.env` file and add the provided credentials
3. If this is your first time, run `npm install` (`npm i`)
4. Run the dev server with `npm run start`
5. Click on the `localhost` link in the terminal to view the website (make sure the backend is running if you are testing both front and back-end.)

See the [front-end README](./front-end/README.md) for more details.

## Deploying to main

Github actions deploys both the front and back-end to Vercel whenever a pull request into `main` gets merged, or whenever someone commits directly to `main` (which we generally shouldn't do.)

### Deploying to the test environment

We can deploy into a test environment by merging a pull request into the `test-scroll` branch on the [forked repository](https://github.com/Taylorbrad/easyspeak-official). Use [this](https://easyspeak-frontend-git-test-scroll-taylorbrad.vercel.app) link to view the test deployment (the 'root directory' values will need to be changed in the respective Vercel projects for the deployment to succeed, as noted below in #2)

## Notes
1. Environment variables for the website deployment are set in Vercel, in a project owned by Taylor Bradshaw. He will have to log in to change these values. (Teams in Vercel is a paid feature)
#####
2. When deploying through GitHub Actions, the 'root directory' value in the front and back-end Vercel project settings should be blank. If you are going to deploy to vercel by committing to Taylor's forked repository (any pushes to the main branch on that fork will automatically be seen by vercel and deployed), those values should be changed to 'front-end' and 'back-end' respectively.
#####
3. When deploying when changes have been made to the back-end, you MUST run `npm run build` before you commit the changes. This script converts TypeScript to JS, and we must do this in order to deploy to Vercel, as it does not support TS as far as I understand.
#####
[//]: # (4. )
#####