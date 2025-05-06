import anthropic
import csv
import random

client = anthropic.Anthropic(
    api_key="",
)

def is_scam(email: str):
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": f"Determine whether each email body is a scam or not. Return 0 if it is not a scam and 1 if it is. Do not explain. Here is the email body: {email}"}
        ]
    )
    return message.content[0].text


def test_case(email: str, scam: str):
    claude_scam = is_scam(email)
    TP = 0
    TN = 0
    FP = 0
    FN = 0

    if scam == claude_scam:
        if scam == '1':
            TP += 1
        else:
            TN += 1
    elif scam == '0' and claude_scam == '1':
        FP += 1
    elif scam == '1' and claude_scam == '0':
        FN += 1
    else:
        print(f"a row was skipped due to formatting problems. scam = {scam} and claude_scam = {claude_scam}")
    return TP, TN, FP, FN


with(open("fraud_email_.csv", mode="r", encoding='utf-8')) as training_data:
    reader = csv.reader(training_data)
    next(reader)
    rows = list(reader)
    test_rows = random.sample(rows, 100)
    TP, TN, FP, FN = 0, 0, 0, 0
    for row in test_rows:
        email = row[0]
        scam = row[1]
        TP_new, TN_new, FP_new, FN_new = test_case(email, scam)
        TP += TP_new
        TN += TN_new
        FP += FP_new
        FN += FN_new
    print(f"TP={TP}, TN={TN}, FP={FP}, FN={FN}")
