const core = require("@actions/core");
const github = require("@actions/github");

const defaultMoodbarMessage = "Hi newcomers! We wanted to check in on everyone - in this thread, feel free to add any of your comments, suggestions, or questions. This community looks forward to looking at your feedback.";


function run() {
    const client = new github.GitHub(core.getInput('repo-token', { required: true }));
    let moodbarMessage = core.getInput('moodbar-message');
    console.log(moodbarMessage);

    const context = github.context;    
    const newIssue = client.issues.create({
        ...context.repo,
        title: 'Moodbar for Current Month',
        body: defaultMoodbarMessage
    });

}

run(); 