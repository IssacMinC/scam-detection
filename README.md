# scam-detection
CS6320
NLP Project for scam detection in emails and SMS messages. 

# spam.csv
Training data for this project. Includes 2 columns - 1) spam or ham (not spam) and 2) The raw email body

# bert_spam_dataset_training.py
Cleans spam.csv and trains the BERT model. The model is exported from here and used elsewhere.

# bert_spam_dataset_model
Trained BERT model that can be loaded into the backend, exported from bert_spam_dataset_training.py

# bert_spam_dataset_load.py
Loads bert_spam_dataset_model and processes an email. Outputs the probability that it is a scam (float from 0 to 1)

# claude_scam.py
Load the Claude API and ask it if the given email is a scam or not.

# claude_scam_test.py
Load the Claude API and assemble a confusion matrix given 100 emails and their actual values (spam/not spam)

..... more

