# pulling configuration variables from the config.json
TOKEN=$(cat ../../config/config.json | jq --raw-output '.config.token')
COHORT=$(cat ../../config/config.json | jq --raw-output '.config.cohort')

# adding in styles and sourcing variables
. style.sh

# runs for each repo to clone down / update / remove depending on completion
# args are repo, username, branchname, PR status
function main() {
  DIR=$2
  REPOEXISTS=$(ls | grep $DIR)
  if [ "$4" == "open" ]
  then
    if [ -z "$REPOEXISTS" ]
    then
      # CLONE
      echo "Cloning down $DIR."
      if [ -z $GOH_SSH ]
      then
        # do we use HTTPS...
        git clone --single-branch --branch $3 "https://git.generalassemb.ly/$2/$1.git" --quiet $DIR
      else
        # ...or SSH?
        git clone --single-branch --branch $3 "git@git.generalassemb.ly:$2/$1.git" --quiet $DIR
      fi
      cd $DIR
    else
      # PULL FROM CURRENT BRANCH
      cd $DIR
      git pull origin $3
    fi

    echo "Checking dependencies for $DIR."
    # checking 
    NPMEXISTS=($(find . -name 'package.json' ! -path '*node_modules*'))
    GEMEXISTS=$(find . -name 'Gemfile')

    # determining necessary JS installations
    if [ -z "$NPMEXISTS" ]
    then
      echo "No package.json detected.$RED Skipping installation.$RESET"
    else
      for PKG_JSON in "${NPMEXISTS[@]}"
      do
        echo "Installing JS dependencies for $(dirname $PKG_JSON | sed "s/./$DIR/" )."
        cd $(dirname $PKG_JSON)
        if which yarn > /dev/null && [[ -f yarn.lock ]]
        then
          yarn install --silent
        else
          npm i --silent
        fi
        cd - > /dev/null
      done
    fi

    # same thing for Gemfiles
    if [ -z "$GEMEXISTS" ]
    then
      echo "No Gemfile detected.$RED Skipping installation.$RESET"
    else
      echo "Installing Ruby dependencies for $GEMEXISTS."
      cd $(dirname $GEMEXISTS) && bundle install --quiet && cd - > /dev/null
    fi

    cd ..
  fi

  # if the repo is closed, then remove the folder to preserve space
  if [ "$4" == "closed" ] && [ -n "$REPOEXISTS" ]
  then
    echo "$DIR's homework is closed, removing directory."
    rm -rf $DIR
  fi

}

export -f main

# print a reset and unset all necessary variables
printf $RESET
unset GOH_SSH

# if a cohort hasn't been chosen the program can't run
if [ -z "$COHORT" ]
then
  echo "No cohort registered! Please run$GREEN sh setup.sh!$RESET" && exit 1
fi

# options for the CLI
while [[ "$1" =~ ^- && ! "$1" == "--" ]];
do
  case $1 in
    -s | --ssh)
      GOH_SSH=1
      ;;
    -l | --lunch)
      . lunch.txt
      ;;
    -h | --help)
      echo "usage: sh main.sh [-l | --lunch][-r | --refresh]"
      echo ""
      echo "options:"
      echo "  -h, --help      provides this help screen"
      echo "  -l, --lunch     reads from lunch.txt for repos"
      echo "  -s, --ssh       uses ssh urls instead of https for git"
      exit
      ;;
  esac
  shift
done

printf $GREEN
printf "${OPENER}"
printf $RESET

echo "Welcome to Git Over Here,$BLUE $USER$RESET!"
echo "You're currently pulling from $GREEN$COHORT$RESET."

# if the lunch option hasn't been enabled, prompt the user for a space delimited set of repos
if [ -z "$REPOS" ]
then
  echo "What$GREEN repos$RESET would you like to grade? (e.g.$GREEN sequelize-pizza-express-routes rails-books-hw candies$RESET)"
  read INPUT
  REPOS=( $INPUT )
fi

for REPO in "${REPOS[@]}"
do
  # pull the repo down and make sure it exists
  SUCCESS=$(curl "https://git.generalassemb.ly/api/v3/repos/$COHORT/$REPO/pulls" -H "Authorization: token $TOKEN" 2>/dev/null |\
    grep -o "Not Found")

  if [ "$SUCCESS" == "Not Found" ]
  then
    printf "$RED"
    echo "Repository not found. Please try again."
  else
    # make the homework folder in case it doesn't exist
    if [ -z "$(ls | grep "homework")" ]
    then
      mkdir homework
    fi
    cd ./homework

    
    printf "$GREEN"
    echo "Repository found for $REPO!"
    printf "$RESET"
    OPENPRS="$(curl https://git.generalassemb.ly/api/v3/repos/$COHORT/$REPO/pulls\?state\=all\&per_page\=100 -H "Authorization: token $TOKEN" --silent | jq '.[] | .state' | grep "open" | wc -l | awk '$1=$1')"
    
    # are there any incomplete assignments?
    if [ -z "$OPENPRS" ]
    then
      # if not, clear out the folder with all existing homeworks
      echo "No submissions for this repository!"
      if [[ ! -z "$(ls | grep $REPO)" ]]
      then
        echo "Removing existing folder for$BLUE $REPO$RESET."
        rm -rf $REPOEXISTS
      fi
      cd ..
    else
      # if not, make the repo dir (if necessary) and send each repo to the main script
      if [ -z "$(ls | grep $REPO)" ]
      then
        mkdir $REPO
      fi
      cd $REPO
      echo "You have $OPENPRS submissions, cloning into$BLUE $REPO$RESET."
      curl "https://git.generalassemb.ly/api/v3/repos/$COHORT/$REPO/pulls?state=all&per_page=100" -H "Authorization: token $TOKEN" 2>/dev/null |\
      jq '.[] | @uri "\(.user.login) \(.head.ref) \(.state)"' |\
      xargs -L 4 -I {} bash -c "main $REPO {}"
          cd ../..
    fi
  fi

  printf "$RESET"
done

echo "Thank you for using$GREEN Git Over Here."
