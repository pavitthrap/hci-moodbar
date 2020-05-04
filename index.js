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
var newUserMessage = "\nThese are all the new users in the past month: "; 
var feedbackFormMessage = "\nHere is a link to a feedback form: "; 

var month_map = {0: 31, 1: 28, 2: 31, 3: 30, 4: 31, 5: 30, 6: 31, 7: 31, 8: 30, 9: 31, 10: 30, 11:31};

//TODO: add survey field 
// TODO - use non default message 
// idea-> when withinMonth is false, simply call isFirstPull directly, passing the appropriate page number in as well 
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
            
            try {
                // QUESTION: how to determine last month? -- 31 day distance, don't go more than 2 months behind 
                // DOC: do not include the current day? 
                
                //  // figure out if the most recent PR is within the month 
                var creationDate = new Date(creationTime); 
                var currDate = new Date(); 

                if (currDate.getYear() % 4 == 0) {
                    month_map[1] = 29; 
                }

                var withinMonth = false; 
                //  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
                if (false && currDate.getMonth() == creationDate.getMonth() && creationDate.getYear() == currDate.getYear()) {
                    withinMonth = true;
                }
                else if (creationDate.getYear() != currDate.getYear()) {
                    var prevMonth = (creationDate.getYear() == currDate.getYear()-1) && currDate.getMonth()==0 && creationDate.getMonth()==11; 
                    
                } else { // year is the same, month is diff 
                    var prevMonth = (currDate.getMonth() - creationDate.getMonth()) <= 1; // check if created_at is less than 1 month from current moment 
                }
                var dateMinimum = Math.max(month_map[creationDate.getMonth()] - (31 - currDate.getDay())+1, 1);
                if (!withinMonth) {
                    withinMonth = prevMonth && creationDate.getDay() >= dateMinimum;
                }

                console.log("within month:", withinMonth, " , creation date:", creationDate, ", curr date: ", currDate, ", prev month: ", prevMonth, " , date min:", dateMinimum);
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
            const repoOwner = core.getInput('repo-owner');
            const feedbackForm = core.getInput('feedback-form');

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
                defaultMoodbarMessage = defaultMoodbarMessage + " Here are the mentors that will be able to answer any questions: " + mentorString; 
            }


            // get all new users of the past month 
            var newUsers = new Map();
            
            yield getAllUsers(client, repoOwner, repoName, newUsers);
            yield isFirstPull(client, repoOwner, repoName, newUsers); 

            if (newUsers.size == 0) {
                console.log("There were no new users this month, not creating an issue");
                return;
            }

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

            if (newUserString) {
                defaultMoodbarMessage = defaultMoodbarMessage + newUserMessage + newUserString; 
            }

            if (feedbackForm) {
                defaultMoodbarMessage = feedbackFormMessage + feedbackFormMessage; 
            }

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
