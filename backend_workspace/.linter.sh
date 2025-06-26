#!/bin/bash
cd /home/kavia/workspace/code-generation/focuspulse-114423-8d66ce52/backend_workspace/backend
source venv/bin/activate
flake8 .
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

