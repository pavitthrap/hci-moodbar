var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const core = require("@actions/core");
const github = require("@actions/github");

var defaultMoodbarMessage = "Hi newcomers! We wanted to check in on everyone - in this thread, feel free to add any of your comments, suggestions, or questions. This community looks forward to looking at your feedback.";
var newUserMessage = "\nThese are all the new users in the past month: "


function getAllUsers(client, owner, repo, allUsers, page = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        // Provide console output if we loop for a while.
        console.log('Checking...');
        var { status, data: pulls } = yield client.pulls.list({
            owner: owner,
            repo: repo,
            per_page: 100,
            page: page,
            state: 'all'
        });
        if (status !== 200) {
            throw new Error(`Received unexpected API status code ${status}`);
            var withinMonth = false; 
        }
        if (pulls.length === 0) {
            console.log("No more pull requests..")
            var withinMonth = false; 
        }
        for ( var pull of pulls) {
            // run 18 has the body of the pull 
            var user = pull.user.login;
            var prNumber = pull.number; 
            var creationTime = pull.created_at; 
            console.log("got login: ", user)
            console.log("creation time", creationTime);
            
            try {
                // TODO: calculate next withinMonth 
                // QUESTION: how to determine last month? -- 31 day distance, don't go more than 2 months behind 
                
                //  // figure out if the most recent PR is within the month 
                var creationDate = new Date(creationTime); 
                var currDate = new Date(); 
                //  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
                if (creationDate.getYear() != currDate.getYear()) {
                    var withinMonth = (creationDate.getYear() == currDate.getYear()-1) && currDate.getMonth()==0 && creationDate.getMonth()==11; 
                } else {
                    var withinMonth = (currDate.getMonth() - creationDate.getMonth()) <= 1; // check if created_at is less than 1 month from current moment 
                }
                console.log("within month:", withinMonth, " , creation date:", creationDate, ", current month: ", currDate.getMonth());
            } catch (err){
                console.log(err);
            }
            
            // break if withinMonth is false
            if (!withinMonth) {
                break; 
            }

            allUsers.set(user, prNumber);
        }

        if (withinMonth) {
            return yield getAllUsers(client, owner, repo, allUsers, page + 1);
        } else {
            return allUsers; 
        }
        
    });
}


// No way to filter pulls by creator
function isFirstPull(client, owner, repo, allUsers, page = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        // Provide console output if we loop for a while.
        console.log('Checking pulls page ', page);
        const { status, data: pulls } = yield client.pulls.list({
            owner: owner,
            repo: repo,
            per_page: 100,
            page: page,
            state: 'all'
        });
        if (status !== 200) {
            throw new Error(`Received unexpected API status code ${status}`);
        }
        if (pulls.length === 0) {
            console.log("Finished checking all pulls, so will return the remaining new users.")
            return allUsers;
        }
        for (const pull of pulls) {
            const currUser = pull.user.login;
            
            if (allUsers.has(currUser) && pull.number < allUsers.get(currUser)) {
                // delete currUser from the dict ; return if the dict is empty 
                console.log("An older pull request was found for user:  ", currUser);
                allUsers.delete(currUser);
                if (allUsers.size == 0) {
                    console.log('There are no more users left to check, so will return early.')
                    return allUsers;
                }
            }
        }
        return yield isFirstPull(client, owner, repo, allUsers, page + 1);
    });
}


function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var client = new github.GitHub(core.getInput('repo-token', { required: true }));
            let moodbarMessage = core.getInput('moodbar-message');
            const mentors  = core.getInput('mentor-list');
            const repoName = core.getInput('repo-name');
            const option = core.getInput('option');
            console.log("option value is:", option); 
            if (option) {
                console.log("hello option here!!")
            }

            // OPTIONALLY: strip whitespace? 
            var mentorArr = mentors.split(',');
            
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

           

            // get all new users of the past month 
            var newUsers = new Map();
            owner = "pavitthrap";
            yield getAllUsers(client, owner, repoName, newUsers);
            yield isFirstPull(client, owner, repoName, newUsers); 

            const it = newUsers.keys(); 
            var val = it.next().value;
            var newUserString = ""; 
            var i = 0;
            while (val) {
                if (i != 0) {
                    newUserString += ", "; 
                }
                newUserString += "@";
                newUserString += val;
                val = it.next().value;
                i+= 1; 
            }
            console.log("new user string: ", newUserString); 

            if (newUserString) {
                defaultMoodbarMessage = defaultMoodbarMessage + newUserMessage + newUserString; 
            }

            console.log("final moodbar string: ", defaultMoodbarMessage); 
            // TODO: make the issue message for real 
            const context = github.context;    
            const newIssue = client.issues.create({
                ...context.repo,
                title: 'Moodbar for Current Month',
                body: defaultMoodbarMessage
            });


        } catch(err) {
            console.log(err);
        }

    });
}


run(); 
