**How to run locally**

**Prequisites:** 
1. Create a .env file in the root directory.
2. create a file called openAIkey.json in /src.
3. Put credentials in both.

**To Start**

1. Start by opening up 2 terminals
2. cd into hackathonspeakeasy in both

**Terminal 1:**
1. If this is your first time running it, run the venv_setup.sh script
2. Once you have done that, activate your virtual environment by running source venv/bin/activate
3. Run the server by using this command: `uvicorn api:app --host localhos --port 8000`

**Terminal 2:**
1. If this is your first time, run `npm install`
2. Just run `npm start`

The app should run on http://localhost:3000
