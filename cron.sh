#!/bin/bash

maxdelay=$((14*60))  # 14 hours from 9am to 11pm, converted to minutes
delay=$(($RANDOM%maxdelay))
(sleep $((delay*60)); node ./index.js) & # background a subshell to wait, then run the php script
