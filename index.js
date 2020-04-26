const core = require("@actions/core");
const github_old = require("@actions/github");
var Github = require('github-api');

var defaultMoodbarMessage = "Hi newcomers! We wanted to check in on everyone - in this thread, feel free to add any of your comments, suggestions, or questions. This community looks forward to looking at your feedback.";


function run() {
    const client = new github_old.GitHub(core.getInput('repo-token', { required: true }));
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

    const context = github_old.context;    
    const newIssue = client.issues.create({
        ...context.repo,
        title: 'Moodbar for Current Month',
        body: defaultMoodbarMessage
    });


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

    userRepo.listPullRequests({state: 'open'})
        .then(function({data: prJson}) {
            console.log('Open Issues: ' + prJson.length);

        }).catch(function(err) {
            console.log(err);
        });
    

    console.log("NOW: Quering for issues."); 
    userIssues.listIssues({state: 'open'})
        .then(function({data: issuesJson}) {
            console.log('Open Issues: ' + issuesJson.length);

        }).catch(function(err) {
            console.log(err);
        });
    // get all new users of the past month 
    var newUsers = [];
    var nonNewUsers = []; 

}

run(); 
