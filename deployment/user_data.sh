#!/bin/bash

git clone https://github.com/leo-step/listflow
cd listflow

export MONGO_URI="${MONGO_URI}"
export OPENAI_API_KEY="${OPENAI_API_KEY}"
export GEMINI_API_KEY="${GEMINI_API_KEY}"

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 16

npm install
npm run build
npm start
