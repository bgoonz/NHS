# Programming beyond ASCII text
========================

* Speaker   : [Josh Marinacci]
* Available : [Dates/Times Available, eg: Apr 20th - 21st]
* Length    : [Length of Presentation, eg: 45-60 min]

Description
-----------

Programming is when you have a problem to solve and you tell the computer how to
solve it for you. That’s all programming really is. Everything we do comes back
to that fundamental. Functions are ways of encapsulating solving stuff in small
chunks so we can reason about it. The same thing with objects (often used to
“model” what we are solving). Unit tests are to help verify what we are solving,
though it often helps to define the problem as well. At the end of the day it’s
all to serve the goal of teaching the computer how to solve problems for us.
Sadly our current programming languages don’t do a good job of this.

If a client said they were using a plain text file to store their company’s most
valuable customer information, we’d say that was crazy. Important information
belongs in a database with querying, versioning, and backups. So why do we still
treat our code this way? Diffing, versioning, and querying all becomes far
harder with plain text code.

Just how bad is it? Consider the regex (regular expression). They are powerful
and concise, but a given regex is not easy to read if you didn’t write it
yourself; or even if you did but you didn’t just write it. A regex you wrote six
months ago will be impenetrable without good documentation.

A regex conveys a lot of information. You have a lot to load up into your brain.
When you look at a regex to see what it does you have to start simulating it in
your brain. Your brain basically becomes a crappy computer that executes the
regex on hypothetical strings. That’s crazy. Why are we simulating a state
machine in our heads? That’s what we have computers for! All this because we are
encoding a complex thing in a rigid text-based system.

A programming language should really be a system of tools that work together.
The syntax, semantics, and editor all working together to help you (the human)
express problems to the machine. Unit tests, visualizers, and debuggers are all
tools that further this goal; yet they are hampered by our dogmatic instance
that code is text on disk.

We should have the PL show the regex to us in an easier-to-understand form, or
perhaps even multiple forms. With unit tests. And visualizers. Or an embedded
regex simulator to show how it works. I have a lot to say about regular
expressions in an upcoming blog, but for now I’ll just say they are some
extremely low hanging fruit in the mission to reduce cognitive load.

- The problem with text: encoding, spacing, tabs, diffs and merges, wasted technology
- Why do we still do it: legacy, fear, compatibility
- Historical efforts: APL, Smalltalk, Self, node-based editors, database storage
- Red herrings: Scratch, Quartz Composer, Literary Programming, Git
- Five ways forward: WYSIWYG coding, inline tests and simulations, typographic editing, binary literals, semantic indentation
- Five tools that exist now: WebStorm color editor, elastic tabstops, Unity Editor

---------------

Speaker Bio
-----------

Josh is an O’Reilly author, developer advocate, and recovering engineer. He is
currently head of the developer evangelism team at PubNub. Previously he worked
as a UI researcher at Nokia, and a developer advocate at Palm and Sun. He is
passionate about user interfaces and education. Josh lives in sunny Eugene,
Oregon.


Links
-----

* Blog: http://joshondesign.com/
* Company: http://www.pubnub.com/
* Github: http://github.com/joshmarinacci
