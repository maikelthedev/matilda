##What is this?
This is a work in progress for a bot to answer recruiters in Linkedin

##How does it work?
It uses Puppeteer to access the given account, download the messages, reformat them, then does some NLP on 
them to give a conversational-ish response. 

##What bits are finished?
1. Login
2. Getting all the conversations. 
3. Downloading the conversations to files. 

##What is coming soon?
4. Reformat the conversations. 
5. Discover some patterns in the messages.
6. Respond to the recruiter with some canned responses. 
7. Archive the message. 
8. Ignore past messages unless they are new. 

You should create a .env file on the root of the repo with
USERNAME=username
PASS=password

Being username your email in Linkedin. 
That .env file is already added in .gitignore
