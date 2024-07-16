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

Before deploying, make sure you run `npm run build` in both the 'front-end' and 'back-end' directories. 

Github actions deploys both the front and back-end to Vercel whenever a pull request into `main` gets merged, or whenever someone commits directly to `main` (which we generally shouldn't do). 

If deployment fails, Double-check the 'root directory' value in the front and back-end Vercel project settings; they should both be blank (unless deploying to the test environment - see below).

### Deploying to the test environment

We can deploy into a test environment by merging a pull request into [another repository](https://github.com/Taylorbrad/easyspeak-official), under the `test-scroll` branch (after changing values, noted in #1 below) on the. Use [this](https://easyspeak-frontend-git-test-scroll-taylorbrad.vercel.app) link to view the test deployment

## Notes

1. When deploying to the test environment, the 'root directory' values will need to be changed to 'front-end' and 'back-end' respectively. When deploying to main through GitHub Actions (this happens anytime `main` is committed to), the 'root directory' value in the front and back-end Vercel project settings should be blank, so make sure to reset the values after you've deployed to the test environment. 
#####
2. When deploying changes to the back-end, you MUST run `npm run build` (in the back-end directory) before you commit the changes. It will not fail to deploy, but it will not update the backend if you don't run the command, it will use old code.<br>
This script converts TypeScript to JS, and we must do this in order to deploy to Vercel, as it does not support TS as far as I understand.

#####
[//]: # (4. )
#####
