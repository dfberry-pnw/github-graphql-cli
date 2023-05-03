if [[ ! -f .env ]] ; then
    echo 'File ".env" is not there, aborting.'
    exit
else
    export $(cat .env | grep -v ^# | xargs) >/dev/null
    node ./dist/index.js --org staticwebdev --page 2 --verbose true --delay 2000 --max -1 --prop all --file staticwebdev.json --pat $PAT --top 2 --sort weight --sortdir
fi
