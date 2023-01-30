# Developer Guide

## Prerequisites

To work on OpenSearch-Dashboards(OSD) plugins, you must have OpenSearch and OpenSearch-Dashboards running.

1. Follow this [link](https://opensearch.org/docs/latest/install-and-configure/install-opensearch/index/) to setup OpenSearch, you can easily get OpenSearch up and running [with Docker](https://opensearch.org/docs/latest/install-and-configure/install-opensearch/docker/)
2. You also need to run OSD dev server, check this [link](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/DEVELOPER_GUIDE.md) to setup local development environment

## Setup

1. Fork this repository
2. Change working directory to OSD `/plugins` folder: `cd OpenSearch-Dashboards/plugins`
3. Clone this repo to plugins folder, `git clone git@github.com:<your-github-username>/ml-commons-dashboards.git ./`

## Install and Run

```bash
# install dependencies in OpenSearch-Dashboards/plugins/ml-commons-dashboards
cd ml-commons-dashboards
yarn osd bootstrap

# Go to OSD project root and run bootstrap to make sure all deps are installed
yarn osd bootstrap

# start OSD dev server
yarn start
```

If everything went well, OSD will be available on `http://localhost:5601/`

## Unit Test

In `plugins/ml-commons-dashboards` folder

```bash
# run tests
yarn test:jest

# or in watch mode
yarn test:jest --watch
```

NOTE: Before creating a pull request, please make sure all tests are passed. You’re also encouraged to write tests to cover the code changes you made.

## Release

### Tagging & Versioning

## Project Conventions

When contributing the codes, please read [OpenSearch-Dashboards general conventions](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/DEVELOPER_GUIDE.md#general)
and the following project conventions.

### Conventional Commit

We are following [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/#specification), these commit type are used by this project:

1. `feat:` Adding a new feature
2. `fix:` Fixing a bug
3. `test:` Adding new tests or correct existing tests
4. `refactor:` A code refactor which only contains non-functional changes
5. `docs:` Adding documentation
6. `build:` Changes that will affect the build system, such as webpack configuration, build scripts
7. `ci:` Changes to the CI configurations, such as GitHub Actions config change
8. `chore:` Changes that will not affect the meaning of the code, such as code formatting, code prettier, removing trailing white-space

### Merge a Pull Request

It it recommended to use "Squash and merge" strategy to merge a PR. If the PR contains commits which are logically isolated, you are encouraged to
squash the commits into several different ones and use "Rebase and merge" strategy in this case.
