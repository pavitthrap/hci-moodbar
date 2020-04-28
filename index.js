const core = require("@actions/core");
const github_old = require("@actions/github");
var Github = require('github-api');

var defaultMoodbarMessage = "Hi newcomers! We wanted to check in on everyone - in this thread, feel free to add any of your comments, suggestions, or questions. This community looks forward to looking at your feedback.";


function run() {
    var client = new github_old.GitHub(core.getInput('repo-token', { required: true }));
    let moodbarMessage = core.getInput('moodbar-message');
    console.log(moodbarMessage);
    const mentors  = core.getInput('mentor-list');
    const repoName = core.getInput('repo-name');

    // OPTIONALLY: strip whitespace? 
    var mentorArr = mentors.split(',');

    console.log("mentors: ", mentorArr);
    console.log("first mentor: ", mentorArr[0]); 
    
    if (mentors) {
        var mentorString = ""; 
        for (var i=0; i < mentorArr.length; i++) {
            if (i != 0) {
                mentorString += ", "; 
            }
            mentorString += "@";
            mentorString += mentorArr[i];
        }
        console.log("mentor string: ", mentorString); 
        defaultMoodbarMessage = defaultMoodbarMessage + " Here are the mentors that will be able to answer any questions: " + mentorString; 
    }

    // TODO: make the issue message for real 
    // const context = github_old.context;    
    // const newIssue = client.issues.create({
    //     ...context.repo,
    //     title: 'Moodbar for Current Month',
    //     body: defaultMoodbarMessage
    // });


    // using github api 
    const userToken  = core.getInput('repo-token');
    var github = new Github({
        'token': userToken
    });

    var user = github.getUser();
    var userRepo = github.getRepo(user, repoName);
    console.log('name of repo: ' + repoName);
    console.log('userRepo: ' + userRepo);
    console.log('username: ' + user.__user);
    console.log('repo fullname: ' + userRepo.__fullname);

    // make it sorted in descending order - get the first number of the PR
    // userRepo.listPullRequests({state: 'open'})
    //     .then(function({data: prJson}) {
    //         console.log('Open Issues: ' + prJson);
    //     }).catch(function(err) {
    //         console.log("Error:", err);
    //     });
     // get most recent PR number 
     //var mostRecentPR = 199; // TODO: obtain real value 

   
     
     // get all new users of the past month 
    var newUsers = [];
    var nonNewUsers = []; 

    var page = 1; 
    var withinMonth = true; 

    while (withinMonth) {
        var { status, data: pulls } = client.pulls.list({   //removed yield
            owner: "pavitthrap",
            repo: repoName,
            per_page: 100,
            page: page,
            state: 'all'
        });
        if (status !== 200) {
            throw new Error(`Received unexpected API status code ${status}`);
        }
        if (pulls.length === 0) {
            withinMonth = false; 
        }
        for ( var pull of pulls) {
            var user = pull.user.login;
            console.log("got pull: ", pull)
            
            // TODO: add user to list

            // TODO: calculate next withinMonth 
            withinMonth = false;
            //  // figure out if the most recent PR is within the month 
            //  var creationDate = Date.parse("2020-04-10T20:09:31Z"); // TODO: data["created_at"]: 
            //  var currDate = Date.now(); 
            //  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
            //  var withinMonth = (currDate.getMonth() - creationDate.getMonth()) <= 1; // check if created_at is less than 1 month from current moment 
            //  console.log("within month:", withinMonth)
        }

        withinMonth = false; 
        
        
    }

   


    // get individual PRs, and keep going until created date exceeds 1 month 
    // created_at, creator.login
    // https://developer.github.com/v3/pulls/#get-a-single-pull-request

    // userRepo.getPullRequest(199)
    //     .then(function({data}) {
    //         console.log('json value: ', data);
    //     }).catch(function(err) {
    //         console.log("Error:", err);
    //     });


}

run(); 
