# Easy Speak

## Back-end

1. `cd back-end`
2. Create a `.env` file and add the provided credentials
3. If this is your first time running it, run the commands from the `setup/venv_setup.sh` manually (for some reason the second command won't actually run sometimes, which will install the dependencies outside the venv)
4. Activate your virtual environment by running `source venv/bin/activate`
5. Start the server by running the api script with `python3 mp.py`

### Notes

If you run into issues running `pyaudio`, try installing this `sudo apt-get install portaudio19-dev`

If `torch` takes too long to install, try installing it this way `pip3 install torch --index-url=https://pypi.org/simple/`

## Front-end

1. `cd front-end`
2. If this is your first time, run `npm install`
3. Run the dev server with `npm start`
4. Click on the `localhost` link in the terminal to view the website

See the [front-end README](./front-end/README.md) for more details.
