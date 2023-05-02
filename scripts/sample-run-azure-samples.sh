if [[ ! -f .env ]] ; then
    echo 'File ".env" is not there, aborting.'
    exit
else
    export $(cat ../.env | grep -v ^# | xargs) >/dev/null
    node ../dist/index.js --org azure-samples --page 100 --verbose true --delay 1200 --max -1 --prop all --file azure-samples.json --pat $PAT --top 5 --sort weight --sortdir
fi
