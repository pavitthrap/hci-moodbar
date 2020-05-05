# hci-moodbar
A Github action to take in new contributor feedback/questions/concerns at regular intervals by creating an issue.
It is intended to be run on a schedule determined in the workflow file. 

# Usage

See [action.yml](action.yml)

```yaml
name: Moodbar Action
  
on:
  schedule:
    - cron: '00 9 1 1-12 *'

jobs:
  moodbar_job:
    runs-on: ubuntu-latest
    name: A job that is scheduled once a month to collect user feedback
    steps:
    - name: Moodbar comment creation step
      uses: pavitthrap/hci-moodbar@v1.0.45
      with:
        repo-token: ${{ secrets.GITHUB_TOKEN }}
        repo-name: "your_demo_repo_name"
        repo-owner: "your_demo_owner"
        moodbar-message: "# Moodbar Issue.\nThis is the first part of the message to be displayed."
        mentor-list: "demo_mentor_one,demo_mentor_two"
        feedback-form: "some_url"
```


# Default Issue Message that is Created
Hi newcomers! We wanted to check in on everyone - in this thread, feel free to add any of your comments, suggestions, or questions. This community looks forward to looking at your feedback.
These are all the new users in the past month: @lorem_ipsum_3, @lorem_ipsum_4  

# Customizable Issue Message
## Instead of the default issue message, it is possible to customize the message with any or all of these input fields: moodbar-message, mentor-list, feedback-form.
__Custom message to repo users__  
Here are the mentors that will be able to answer any questions: __@demo_mentor_one, @demo_mentor_two__  
Here is a link to a feedback form: __some_url.com__  
  
## These are the corresponding input values to produce the output above.
moodbar-message = __"Custom message to repo users"__  
mentor-list = __"demo_mentor_one,demo_mentor_two"__  
feedback-form = __"some_url.com"__

# Implementation Notes 
- This action is under the expectation it will be run monthly. When it is run, it collects all new users of the past 31 days, where a user is defined as someone that created a PR. If the past 31 days extends beyond the previous month, then the calculations will be run from the 1st of the previous month, not any earlier. 
  - For example, if the action is scheduled to run on March 1st, the action will include new users starting from February 1st, instead of going back a few more days into January. 
- The schedule that this action runs on depends on the "cron" line in the workflow file. Use [crontab guru](https://crontab.guru/) to help format the schedule to be what you want. 
  - '00 9 1 1-12 \*' corresponds to *at 09:00 on day-of-month 1 in every month from January through December*.
  - '[min] [hour] [day of month] [month] [day of week]' is the format for cron. 
- It is possible to customize the first part of the message (bolded in the example above) by passing in something for the input *moodbar-message*. 
