# hci-moodbar
A Github action to take in new contributor feedback/questions/concerns at regular intervals

# Usage

See [action.yml](action.yml)

```yaml
name: Moodbar Action
  
on:
  push:
  schedule:
    - cron: '07 20 22 1-12 *'

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
