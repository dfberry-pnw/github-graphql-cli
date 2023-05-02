first='./config.json'
second='./config-diff.json'
COMPARE=$(cmp $first $second)
if [[ $COMPARE ]]; then
     echo "true"
#     echo "$(cat $COMPARE)"
 else
     echo "false"
fi
