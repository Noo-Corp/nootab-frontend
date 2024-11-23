import json
import pytz
import datetime
import base64
from flask import Flask, render_template, jsonify, request
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/panel/<panel_name>')
def serve_panel(panel_name):
    return render_template(f'{panel_name}.html')


@app.route('/authorize')
def authorize():
    token, refresh_token = request.headers.get('Authorization').split(' ')
    check = request.headers.get('Check')
    app = request.headers.get('App')

    if app == "gmail":
        SCOPES = GMAIL_SCOPES
    elif app == "calendar":
        SCOPES = CALENDAR_SCOPES
    else:
        return jsonify({"authorized": False})
    
    if token == "null" or refresh_token == "null":
        if check == "1":
            return jsonify({"authorized": False})

        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json", SCOPES
        )
        creds = flow.run_local_server(port=0)
    else:
        with open("credentials.json") as f:
                creds_data = json.load(f)
                client_id = creds_data["installed"]["client_id"]
                client_secret = creds_data["installed"]["client_secret"]
                token_uri = creds_data["installed"]["token_uri"]
        creds = Credentials(
            token=token,
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri=token_uri,
            scopes=SCOPES
        )

    if app == "gmail":
        gmail_data = run_gmail_flow(creds)

        if gmail_data:
            return jsonify({"authorized": True, "emails": gmail_data[0], "gmail_token": creds.token, "gmail_refresh_token": creds.refresh_token, "user_email": gmail_data[1]})
        else:
            return jsonify({"authorized": False})
    elif app == "calendar":
        calendar_data = run_calendar_flow(creds)

        if calendar_data:
            return jsonify({"authorized": True, "events": calendar_data[0], "calendar_token": creds.token, "calendar_refresh_token": creds.refresh_token, "user_email": calendar_data[1]})
        else:
            return jsonify({"authorized": False})
    else:
        return jsonify({"authorized": False})


@app.route('/view_email/<email_id>')
def view_email(email_id):
    token, refresh_token = request.headers.get('Authorization').split(' ')
    
    with open("credentials.json") as f:
            creds_data = json.load(f)
            client_id = creds_data["installed"]["client_id"]
            client_secret = creds_data["installed"]["client_secret"]
            token_uri = creds_data["installed"]["token_uri"]
    creds = Credentials(
        token=token,
        refresh_token=refresh_token,
        client_id=client_id,
        client_secret=client_secret,
        token_uri=token_uri,
        scopes=GMAIL_SCOPES
    )

    if creds and creds.valid:
        try:
            service = build("gmail", "v1", credentials=creds)
            msg = service.users().messages().get(userId="me", id=email_id).execute()

            subject = next(header['value'] for header in msg['payload']['headers'] if header['name'] == 'Subject')
            
            body = None
            for part in msg['payload']['parts']:
                if part['mimeType'] == 'text/html':
                    body = part['body'].get('data', '')
                    break
                elif part['mimeType'] == 'text/plain' and body is None:
                    body = part['body'].get('data', '')

            if body:
                body = body.replace("-", "+").replace("_", "/")
                decoded_body = base64.b64decode(body).decode("utf-8")
            else:
                decoded_body = "No content found in email body."

            return jsonify({"subject": subject, "content": decoded_body})

        except (HttpError, KeyError):
            return jsonify({"error": "<div style='padding: 22px 0; font-weight: bold; font-size: 12px;'>FAILED TO VIEW EMAIL</div>"})
    
    return jsonify({"error": "Unauthorized"})


def run_gmail_flow(creds):
    try:
        service = build("gmail", "v1", credentials=creds)

        profile = service.users().getProfile(userId='me').execute()
        user_email = profile['emailAddress']

        results = service.users().messages().list(userId="me", q="is:unread").execute()
        messages = results.get("messages", [])

        email_info = []
        for message in messages:
            msg = service.users().messages().get(userId="me", id=message['id']).execute()
            email_info.append({
                'id': msg['id'],
                'subject': next(header['value'] for header in msg['payload']['headers'] if header['name'] == 'Subject'),
                'from': next(header['value'] for header in msg['payload']['headers'] if header['name'] == 'From'),
                'received_time': next(header['value'] for header in msg['payload']['headers'] if header['name'] == 'Date')
            })

        return [email_info, user_email]

    except HttpError:
        return None


def run_calendar_flow(creds):
    try:
        service = build("calendar", "v3", credentials=creds)
        calendar_info = service.calendars().get(calendarId="primary").execute()
        user_email = calendar_info["id"]
        calendar_timezone = calendar_info.get("timeZone", "UTC")

        local_tz = pytz.timezone(calendar_timezone)
        now = datetime.datetime.now(local_tz)

        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()

        start_of_day_utc = datetime.datetime.fromisoformat(start_of_day).astimezone(pytz.utc).isoformat()
        end_of_day_utc = datetime.datetime.fromisoformat(end_of_day).astimezone(pytz.utc).isoformat()

        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=start_of_day_utc,
                timeMax=end_of_day_utc,
                maxResults=100,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        calendar_info = []
        for event in events:
            calendar_info.append({
                'start': event["start"].get("dateTime", event["start"].get("date")),
                'end': event["end"].get("dateTime", event["end"].get("date")),
                'title': event.get("summary", "No Title")
            })
        
        return [calendar_info, user_email]

    except HttpError:
        return None