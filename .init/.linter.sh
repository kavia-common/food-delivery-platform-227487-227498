#!/bin/bash
cd /home/kavia/workspace/code-generation/food-delivery-platform-227487-227498/web_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

