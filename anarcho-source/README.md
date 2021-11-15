A spec of protocols for cooperative governance over a member-owned, or distributed, possibly unowned, organization.

This is a naive, hypothetical, example to startup with, and the IRL test case for which it was devised is a naturalized corporation in the US (which would iomplement these protocols into its by-laws).    

But the goal is to extract the protocols and encode them.  With protocols for proposing laws and amendments, and for for voting and delegation, any organization could make use of the resulting software to automate the anarchy.  

##membership

A founding group or individual creates a body, and become the owner-member(s).

New membership is voted on by current members.

A membership may likewise be revoked.

###owner-member

__Owner-members__ are the core of the body. 

They may propose new laws and amendments, and vote or delegate on them.

They may work member-hours. 

(Or some other unit of work.)

Member-hours are used to determine shares of income.

Owner-member may have their membership revoked by a vote, but they retain their stake in portion of future income, called member shares, based on total number of member-hours the owner-member has accued.

###investor-member

It may be useful for a body to accept investment.  It all about the terms.  

An __investor-member__ may not vote.  Or they may, if the body determines it so procedurally.  But in this case, they do not.  

The experimental idea here is that investor-owners buy member-hours with their investment. They then retain those member-hours exactly as member-owners do theirs, and are therefor paid member-like dividends.  See ```Remuneration``` for more steails. 

###member-hours

__Member-hours__ are what member-workers recieve when they work for the body.  They are essentially shares in all dividends, and so it would not be unreasonable for some body to perform a buying back of member-hours, or for members to trade them.

Going by hours is the obvious and naive approach, but when it comes down to it, all we are is time.

##Governance

Codes govern the body.  Governance is the creation and maintenance of codes.  This is done with a system for orchestration proposals, and votes.

###codes
__Codes__ are immutable.

They must be removed from the system by the operation of another code.

###proposals

__Proposals__ may be created any member-owner.  A proposal may be new, or a fork of another proposal.

Members recieve notice of proposals.  They vote either to make it a proposition, or not.

Or they fork the proposal and either try to have it merged, or create a new repro.

If a proposal passes some mark, it becomes a proposal.

###proposition

__Propositions__ should already have been edited through the proposal process, and they are now ready to be voted into the code.

Members each set what they believe to the priority of the vote, like setPriority(howImportant, howSoon).

#voting and delegation

Only current owner-members may vote.  There may never be a reason to remove member-owners, or perhaps some have been removed, or removed themselves.
Members may also delegate thier vote to another member.

##Remuneration Patterns

Given a periodic financial event.  After operating expenses are subtracted out of gross revenue, divvy the net into three groups:
* operating hours
* savings
* members share

__Operating hours__ are member-hours accrued by owner-members _during the given period_.  Presumably that covers everything to operate the body, or w/e work is orchestrated.  This share of the net would probably be the largest.  Divide the amount of this share by operating hours for the period, and remunerate those members according to each for their hours as percentage of the total.

__Savings__ is some portion of the net that is set aside for future expenses.

__Members share__ is some portion of the net that is split amongst all current and former member-owners and member-investors.  The amount for each is a division of the member share by total member-hours, ever, and paid to the holders of those hours accordingly.  This is where investors come in.  An investor who "bought" member-hours is paid dividends from this share.  Neatly, the value of investment would decrease over time, as it becomes a smaller percentage of the total hours.  

example code:
```js
var gross = 20000
var operatingExpenses = 5000
var net = gross - operatingExpenses
var operatingHours = getOperationHours(/* range */)
var totalHours = getTotalMemberHours()
var operatingLog = getOperatingLog(/* range */)
var members = getMembers()

var operations = .7
var savings = .2
var payBackTime = .1
var perHour = (net * operating) / operatingLog.totalHours

operatingLog.members.forEach(function(memberObject){
  pay(memberObject.member, perHour * memberObject.operatingHours, function(bankErr, bling){})) 
})

// etc...
