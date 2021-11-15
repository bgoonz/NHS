#!/bin/bash
SLIDE=-1
ORDER=($(cat order.txt))
BASEDIR=$(node -pe "require('path').resolve(__dirname)")

function next {
    SLIDE=$((SLIDE+1))
    show $SLIDE
}

function prev {
    SLIDE=$((SLIDE-1))
    show $SLIDE
}

function show {
    if test -z "${ORDER[$1]}"; then
        echo
        echo "https://github.com/substack/baudio"
        echo
        echo "https://soundcloud.com/substack"
        echo
        echo "http://npmjs.org/package/webaudio"
        echo
        echo "__END__"
        echo
    else
        echo ">> SEQUENCE: ${ORDER[$1]}"
        cd "$BASEDIR/${ORDER[$1]}"
    fi
}
