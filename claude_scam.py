import anthropic

client = anthropic.Anthropic(
    api_key="",
)

def is_scam(email: str):
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1024,
        messages=[  # prompt
            {"role": "user", "content": f"Determine whether each email body is a scam or not. Return the probability between 0 and 1 that it is. Do not explain. Only return the decimal. Here is the email body: {email}"}
        ]
    )
    return message.content[0].text

with open("input.txt") as file:
    email = file.read()
    scam_likelihood = is_scam(email)
    print(scam_likelihood)
