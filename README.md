**How to run locally**

**Prequisites:** 
1. Create a .env file in the root directory.
3. Put provided credentials in file

**To Start**

1. Start by opening up 2 terminals
2. cd into easyspeak-official in both

**Terminal 1:**
1. If this is your first time running it, run the `venv_setup.sh` script
2. Once you have done that, activate your virtual environment by running source venv/bin/activate
3. Run the server by running the api script (`python3 mp.py`)

**Terminal 2:**
1. `cd front-end`
2. If this is your first time, run `npm install`
3. Just run `npm run dev`

**Notes**:
If you run into issues running pyaudio, try installing this `sudo apt-get install portaudio19-dev`
If torch takes too long to install, try installing it this way `pip3 install torch --index-url=https://pypi.org/simple/`

The app should run on http://localhost:3000
