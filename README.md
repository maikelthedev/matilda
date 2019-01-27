## What is this?
This is a work in progress for a bot to answer recruiters in Linkedin

## How does it work?
It uses Puppeteer to access the given account, download the messages, reformat them, then does some NLP on 
them to give a conversational-ish response. 

## What bits are finished?
1. Login
2. Getting all the conversations. 
3. Downloading the conversations to files. 
4. Reformat the conversations. // Not sure I want to reformat them more. 

## What is coming soon?
5. Discover some patterns in the messages.
6. Respond to the recruiter with some canned responses. 
7. Archive replied messages.
8. Ignore past recruiters unless unless they have new messages.

You should create a .env file on the root of the repo with
USERNAME=username
PASS=password
ME=fullname

Being username your email in Linkedin, and fullname your name as it appears on LinkedIn.
That .env file is already added in .gitignore
