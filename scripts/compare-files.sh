newFile=$2      # ./repo-scope-tool/config.json
oldFile=$1      # ./cqa-dashboard-app/scope/config.json
diffFile=$3     # ./repo-scope-tool/diff.txt
sendToEnv=$4    # save to env variable

echo `NewFile: $newFile`
echo 'OldFile: $oldFile'
echo 'DiffFile: $diffFile'
echo 'SendToEnv: $sendToEnv'

# Check if files exist
if [[ ! -f $oldFile]] ; then
    echo 'File "$oldFile" is not there, aborting.'
    exit 1
else
if [[ ! -f $newFile]] ; then
    echo 'File "$newFile" is not there, aborting.'
    exit 1
else

# -s suppress the output normally produced by cmp command i.e it compares two files without writing any messages
# 0 if the files are identical
# 1 if different
# 2 if an error message occurs
COMPARE=$(cmp -s $newFile $oldFile > $diffFile )

if [[ $sendToEnv -eq '--send' ]] ; then
    echo 'Save output to env $envVarName'
    echo "export COMPARE=$COMPARE"
    echo 'exit 0'
else
    echo 'Do not save output to env'
    echo 'exit 0'
fi
