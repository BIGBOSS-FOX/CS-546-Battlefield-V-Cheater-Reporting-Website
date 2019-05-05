
## CS546 Final Project: Game Cheater Reporting Website ##

### Developer Note:
Please do npm install every time you pull, and do not add the node modules to github


### Database Collections and Methods:

Users:
- addUser(user_name, isAdmin)
- getAllUsers()
- getUserByObjectId(obj_id)
- updateUser(obj_id, UserInfo)
- deleteUser(obj_id)

Report:
- addReport(reported_by, reported_player, body, image, proof_link, comments)
- getAllReports()
- getReportByObjectId(obj_id)
- updateReport(obj_id, ReportInfo)
- deleteReport(obj_id)

Poll:
- addPoll (voting_about)    
- getAllPolls()
- getPollByObjectId(obj_id)
- updatePoll(obj_id, PollInfo)
- deletePoll(obj_id)

Comment:
- addComment (commenter, comment)
- getAllComments()
- getCommentByObjectId(obj_id)
- updateComment(obj_id, CommentInfo)
- deleteComment(obj_id)

Appeal:
- addAppeal(appealed_by, body, image, proof_link)
- getAllAppeals()
- getAppealByObjectId(obj_id)
- updateAppeal(obj_id, AppealInfo)
- deleteAppeal(obj_id)   