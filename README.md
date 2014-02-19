VersionOne Backlog Provider
===========================

A *really* basic VersionOne backlog provider.

Visit http://planningpoker.io/scrummaster/TeamRoom for an instance of the Planning Poker application running this provider with mock data (this is not connecting to an instance of VersionOne)


Configure
---------
Update the config/config.js file with the following values
 - hostname: This should be the host name of your VersionOne server
 - instance: The VersionOne isntance that you want to connect to (usually 'VersionOne')
 - username: The backlog provider will connect to VersionOne as this user
 - password: Self explanatory
 - port: Usually this is running on port 80, change this value if required
 - protocol: Change this to 'https' if you are running on a secured server
 - status: Change this to the value of the status that you want the provider to load (Defaults to 'Prepared')
 - room: This must match the 'room' portion of the PlanningPoker url (http://planningpoker.io/scrummaster/{room})
 - socketHost: The root url of the Planning Poker Application (e.g. http://planningpoker.io)
 - mockData: Set to true to use mock Data

Setup
-----

    npm install

Run
---

    node index.js

Features
--------
 - Select Project scope (lists scopes that have either no EndDate or and EndDate in the future)
 - Lists backlogs in a configured state ('Prepared' status by default)
 - Vote on each backlog item. 
 - Team Members can see the backlog number, title and description
 - Team Members see a link to open the Backlog in VersionOne
 - Backlog Status and Estimate is updated automatically on Final Vote
 - Scrum Master can change the status of a backlog (e.g. Set to 'Technical Grooming')

Screenshots
-----------

## Voting In Progress
![](http://planningpoker.io/images/voting.png)

## Voting Results
![](http://planningpoker.io/images/results.png)

## Vote Complete (Backlog Status and Estimate has been updated in VersionOne)
![](http://planningpoker.io/images/voteComplete.png)

## Change Backlog Status
![](http://planningpoker.io/images/changeStatus.png)



