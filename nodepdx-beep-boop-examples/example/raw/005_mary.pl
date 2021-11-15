#!/bin/bash
perl -e'%c=map{[a..z]->[log($_)/log(2)*8-48],$_}map 2**($_/8),6*8..8*8
; print((((chr)x($_/16)).("\x00"x(256-$_)/16))x128)for map{$c{$_},0}"
jklkjjj0kkk0j0g0g00jklkjjjjkkjkl"=~/./g'|play -c1 -r 8k -t s8 -

# http://www.perlmonks.org/?node_id=571140 - Sep 05 2006
