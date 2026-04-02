"""
validate_w3c.py
---------------
Run:     python validate_w3c.py
Requires: pip install requests

Checks all public AND authenticated pages against the W3C Nu Validator API.
For authenticated routes, the script will prompt for your PHPSESSID cookie.

How to get your PHPSESSID:
  1. Log into the site in your browser
  2. DevTools → Application → Cookies → your site URL
  3. Copy the value of PHPSESSID and paste it when prompted
"""

import requests
import time
# ── after your imports (line 17) ──────────────────────────────────────
import sys

class Tee:
    """Writes output to both terminal and a file simultaneously."""
    def __init__(self, filepath):
        self.terminal = sys.stdout
        self.file     = open(filepath, "w", encoding="utf-8")
    def write(self, message):
        self.terminal.write(message)
        self.file.write(message)
    def flush(self):
        self.terminal.flush()
        self.file.flush()
    def close(self):
        self.file.close()

BASE_URL = "http://35.212.199.144"
W3C_API  = "https://validator.w3.org/nu/"

# ── Public routes — no login needed ───────────────────────────────────
PUBLIC_PATHS = [
    "/",
    "/about",
    "/login",
    "/register",
    "/listings",
    "/listings/2",
    "/blog",
    "/blog/2"
]

# ── Authenticated routes — requires a valid PHPSESSID ─────────────────
AUTH_PATHS = [
    "/dashboard",
    "/profile",
]

# ── Admin routes — requires a PHPSESSID from an admin account ─────────
ADMIN_PATHS = [
    "/admin",
]
# ───────────────────────────────────────────────────────────────────────


def validate_url(url: str, cookies: dict = None) -> list:
    """
    Fetch the page ourselves (with our session cookie if provided),
    then POST the raw HTML to the W3C Nu Validator.

    Why not just pass the URL to the validator directly?
    The W3C validator fetches pages server-side from its own servers —
    it has no way to carry your browser session cookie. So we fetch
    the HTML ourselves first, then hand the markup to the validator.
    """
    try:
        page = requests.get(
            url,
            cookies=cookies or {},
            headers={"User-Agent": "VapourFT-Validator/1.0"},
            timeout=15,
            allow_redirects=True,
        )

        # If we got redirected to /login, the session is invalid or expired
        if "/login" in page.url and "/login" not in url:
            return [{
                "type":     "error",
                "message":  "Redirected to /login — session may be invalid or expired.",
                "lastLine": "—",
            }]

        # POST the raw HTML to the W3C validator
        resp = requests.post(
            W3C_API,
            params={"out": "json"},
            headers={
                "Content-Type": "text/html; charset=utf-8",
                "User-Agent":   "VapourFT-Validator/1.0",
            },
            data=page.content,
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json().get("messages", [])

    except Exception as e:
        return [{"type": "error", "message": f"Request failed: {e}", "lastLine": "—"}]


def print_result(url: str, messages: list):
    errors   = [m for m in messages if m["type"] == "error"]
    warnings = [m for m in messages if m["type"] == "info"]

    status = "PASS" if not errors else f"FAIL  ({len(errors)} error(s))"
    icon   = "v" if not errors else "x"
    print(f"\n  [{icon}] {status} — {url}")

    for m in errors:
        print(f"        [ERROR] Line {m.get('lastLine', '?')}: {m['message']}")
    for m in warnings:
        print(f"        [WARN]  Line {m.get('lastLine', '?')}: {m['message']}")


def run_section(title: str, paths: list, cookies: dict = None):
    total_errors   = 0
    total_warnings = 0

    print(f"\n{'─' * 55}")
    print(f"  {title}")
    print(f"{'─' * 55}")

    for path in paths:
        url      = BASE_URL + path
        messages = validate_url(url, cookies)
        print_result(url, messages)
        total_errors   += len([m for m in messages if m["type"] == "error"])
        total_warnings += len([m for m in messages if m["type"] == "info"])
        time.sleep(20)   # be polite to the W3C API — don't hammer it

    print(f"\n  Section total: {total_errors} error(s), {total_warnings} warning(s)")


def prompt_session(role: str) -> dict | None:
    """Ask the user for a PHPSESSID and return it as a cookies dict."""
    print(f"\n  To check {role} routes, paste your PHPSESSID cookie.")
    print(f"  Steps:")
    print(f"    1. Log in as {role} in your browser")
    print(f"    2. DevTools (F12) -> Application -> Cookies -> {BASE_URL}")
    print(f"    3. Copy the value of PHPSESSID")
    print()
    session_id = input("  PHPSESSID (or press Enter to skip): ").strip()

    if not session_id:
        print("  Skipping — no session provided.")
        return None

    return {"PHPSESSID": session_id}


def main():
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    tee = Tee("w3c_report.txt")
    sys.stdout = tee

    print()
    print("=" * 55)
    print("  Vapour FT — W3C Validation Audit")
    print(f"  Target : {BASE_URL}")
    print(f"  Time   : {timestamp}")
    print("=" * 55)

    # ── 1. Public routes ───────────────────────────────────────
    run_section("PUBLIC ROUTES", PUBLIC_PATHS)

    # ── 2. Authenticated routes ────────────────────────────────
    user_cookies = None
    if AUTH_PATHS:
        user_cookies = prompt_session("a regular user")
        if user_cookies:
            run_section("AUTHENTICATED ROUTES  (user)", AUTH_PATHS, user_cookies)

    # ── 3. Admin routes ────────────────────────────────────────
    if ADMIN_PATHS:
        print()
        reuse = input("  Use the same session for admin routes? (y/n): ").strip().lower()
        if reuse == "y" and user_cookies:
            admin_cookies = user_cookies
        else:
            admin_cookies = prompt_session("an admin user")

        if admin_cookies:
            run_section("ADMIN ROUTES", ADMIN_PATHS, admin_cookies)

    print()
    print("=" * 55)
    print("  Audit complete.")
    print("=" * 55)
    print()
    sys.stdout = tee.terminal   # restore normal terminal output
    tee.close()
    print("Report saved → w3c_report.txt")


if __name__ == "__main__":
    main()