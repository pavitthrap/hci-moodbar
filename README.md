# hci-moodbar
A Github action to take in new contributor feedback/questions/concerns at regular intervals

# Usage

See [action.yml](action.yml)

```yaml
name: Moodbar Action
  
on:
  push:
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
        repo-name: "demo_repo_name"
        repo-owner: "demo_owner"
        moodbar-message: "# Moodbar Issue.\nThis is the first part of the message to be displayed."
        mentor-list: "demo_mentor_one,demo_mentor_two"
        feedback-form: "some_url"
```


# Example Issue Message 

__Hi newcomers! We wanted to check in on everyone - in this thread, feel free to add any of your comments, suggestions, or questions. This community looks forward to looking at your feedback.__
Here are the mentors that will be able to answer any questions: @lorem_ipsum_1, @lorem_ipsum_2
These are all the new users in the past month: @lorem_ipsum_3, @lorem_ipsum_4
Here is a link to a feedback form: lorem_ipsum.net

# Implementation Notes 
- The schedule that this action runs on depends on the "cron" line. Use [crontab guru](https://crontab.guru/) to help format the schedule to be what you want. 
  - '00 9 1 1-12 \*' corresponds to *at 09:00 on day-of-month 1 in every month from January through December*.
- This action is under the expectation it will be run monthly. It collects all new users of the past 31 days, where a user is defined as someone that created a PR. If the past 31 days extends beyond the previous month, then the calculations will be run from the 1st of the previous month, not any earlier. 
- It is possible to customize the first part of the message (bolded in the example above) by passing in something for the input *moodbar-message*. 