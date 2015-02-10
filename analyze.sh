#!/bin/bash
# ------------------------------------------------------------------
# [Krzysztof Sobczak] DMP3 Analyzer
# ------------------------------------------------------------------

# Usage
USAGE="Usage: analyze js_script i j k"

#Colors
ESC_SEQ="\x1b["
COL_RED=$ESC_SEQ"31;01m"
COL_RESET=$ESC_SEQ"39;49;00m"

# --- Option processing --------------------------------------------
if [ $# == 0 ] ; then
    echo $USAGE
    exit 1;
fi

# Variables
SCRIPTFILE=$1
LIMIT1=$2
LIMIT2=$3
LIMIT3=$4
ITERATIONS=$(($LIMIT1*$LIMIT2*$LIMIT3))

# Check if file exists
if [ -f $1 ]
then
    echo "Starting analyzes for script: \"$1\"..."
    echo "Total iterations: $ITERATIONS"
else
    echo "$SCRIPTFILE doesn\'t exist."
    exit 1;
fi

# Perform multiple tests
CURRENT=0
for (( k=1 ; k<=$LIMIT3 ; k++ )); do
  for (( j=1 ; j<=$LIMIT2 ; j++ )); do
    for (( i=1 ; i<=$LIMIT1 ; i++ )); do
      CURRENT=$(($CURRENT+1))
      echo -e "$COL_RED\033[1m----------    ITERATION $CURRENT / $ITERATIONS    ----------"
      echo -e "----------   i: $i | j: $j | k: $k   ----------\033[0m $COL_RESET"
      node $SCRIPTFILE -i $i -j $j -k $k
    done
  done
done