#! /bin/bash

while [[ "$1" =~ ^- && ! "$1" == "--" ]];
do
  case $1 in
    -r | --repo)
      REPO=$2
      ;;
    -l | --language)
      LANGUAGE=$2
      ;;
    -h | --help)
      echo "usage: ./grouptext.sh [-h | --help][-l | --language <language>][-r | --repo <repo>]"
      echo ""
      echo "options:"
      echo "  -h, --help      provides this help screen"
      echo "  -l, --language  declares the language <language> for testing (default is node)"
      echo "  -r, --repo      declares which repo will be tested"
      exit
      ;;
  esac
  shift
done

if [[ ! -d homework/$1  || -z $1 ]] 
then
  echo "Repo does not exist, exiting program." && exit 1
fi

cd homework/$REPO

case $LANGUAGE in
  ruby)
    TESTFRAMEWORK="rspec"
    ;;
  *)
    TESTFRAMEWORK="npm t"
    ;;
esac

ls | xargs -I {} bash -c "cd {} && echo Now running tests for {}. && $TESTFRAMEWORK && cd .."
