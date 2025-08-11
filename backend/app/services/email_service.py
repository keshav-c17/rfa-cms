# FILE: backend/app/services/email_service.py
# -------------------------------------------
# This file simulates sending emails by logging to the console.

def send_email_simulation(to_email: str, subject: str, body: str):
    """
    Simulates sending an email by printing the details to the console.
    In a real application, this function would contain the logic to
    connect to a service like SendGrid or AWS SES and send the email.
    """
    print("--- SIMULATING EMAIL ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("------------------------")