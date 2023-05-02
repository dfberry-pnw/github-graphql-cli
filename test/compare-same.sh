first='./config.json'
second='./config-same.json'
COMPARE=$(cmp $first $second)
if [[ $COMPARE ]]; then
     echo "true"
#     echo "$(cat $COMPARE)"
 else
     echo "false"
fi
