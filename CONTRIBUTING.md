# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owner of this repository before making a change.

Please note we have a code of conduct (below), please follow it in all your interactions with the project.

## Code Style and Formating Guide

- Restrict Javascript to the latest supported natively in most browsers to avoid need for transpiling and maximize browser support.
- Always comment code sections with jsdoc style comments for methods, functions and classes. Keep comments
meaningful and helpful.
- Comment complex or interesting sections of code.
- This project is meant to be included in other projects or websites, so efforts should be made to minimize pollution of the global namespace.
- Follow code styles found in other sections of the project. Try to keep it consistent.
- Use Linux style line endings and 4 spaces for indenting.

## Pull Request Process

1. Ensure any development or build artifacts are removed before commiting your work.
2. Use clear and descriptive comments, commit messages and pull request details.
3. If you have many commits in your PR, please rebase and squash them together.
4. If the main project has been updated you may need to rebase your PR onto master.
5. Check other PRs for conflicts with your own.
6. Increase the version number found in `main/version.js` and `package.json`. Use SemVer.

### Help With PRs and Git

* Q: I need to change something in my branch after I submitted a PR. Can I?
  * A: Yes, you can add more commits to your branch and the PR will be updated with them. Please add a comment to the PR to explain what you added.

* Q: I was asked to rebase my PR. What do I do?
  * A: Changes were made to master or other PRs were merged in and your PR is no longer based on the latest code and likely has conflicts. You can update your fork, then replay your changes onto the latest version so that merging your PR will be possible. Here is a guide: https://github.com/edx/edx-platform/wiki/How-to-Rebase-a-Pull-Request

## Code of Conduct

Participation in this project and community requires fostering a harassment and discriminiation free environment for all.

- Be polite, always.
- Don't criticise. Ask questions, offer ideas.
- Don't be a jerk, or you will be banned.
- Compliments and kudos are nice.
- Concerns or reports of abuse: https://syntaxseed.com/about/contact/.
- Maintainer Syntaxseed is the final arbiter of this policy.
