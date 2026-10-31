---
slug: testing-user-permissions
title: Testing User Permissions
summary: Learn to test role-based access control end to end, using a permission matrix, negative tests for every role, direct URL and API checks, and the classic horizontal and vertical privilege escalation scenarios.
level: intermediate
duration: 35
tags: [real-world, security, authorization, rbac]
objectives:
  - Build a permission matrix from requirements
  - Design positive and negative tests for each role and action
  - Test both vertical and horizontal access control
  - Verify that hidden buttons are also blocked on the server
prerequisites:
  - Testing login and authentication
  - Decision table testing
related: [testing-login-and-authentication, decision-table-testing, authentication-and-authorization, api-security-testing, positive-and-negative-testing]
references:
  - title: OWASP Top 10 (A01 Broken Access Control)
    url: https://owasp.org/projects/top-ten
  - title: OWASP Web Security Testing Guide
    url: https://owasp.org/projects/web-security-testing-guide
  - title: MDN Web Docs — HTTP 401 and 403 status codes
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
interview:
  - q: How do you approach testing a feature with several user roles?
    a: I build a permission matrix of roles against actions from the requirements, and get it confirmed by the product owner because gaps are common. Then I test every cell — allowed actions succeed, denied actions are blocked. For denied actions I check the UI hides or disables them, and separately that the server rejects them when called directly by URL or API, because UI hiding is not security.
  - q: What is the difference between horizontal and vertical privilege escalation?
    a: Vertical escalation is a lower-privileged user doing something reserved for a higher role, like a viewer deleting a project. Horizontal escalation is a user accessing another user's data at the same level, like customer A opening customer B's invoice by changing the ID in the URL. Both are broken access control, and the horizontal one is often missed because the role is "allowed" to view invoices.
  - q: What should happen when a user's role is changed while they are logged in?
    a: It depends on the requirement, but the safe behaviour is that the new permissions take effect on the next request, or at least within a defined short time. I test downgrading a role during an active session and confirm that previously allowed actions are now rejected by the server, not just hidden after a refresh.
practice:
  - "A document app has Owner, Editor, Commenter and Viewer roles and actions view, comment, edit, share, delete. Draw the permission matrix and list the negative tests."
  - "Log in as two different users on a demo app you own and try to open each other's resources by editing IDs in the URL. Record the results."
  - "Write test cases for what happens when an admin removes a user's access while that user has the page open."
takeaways:
  - Start from a confirmed permission matrix; every cell is a test.
  - Negative tests (denied actions) matter more than positive ones for security.
  - Hiding a button is not access control; check the server by URL and API.
  - Test horizontal access (other users' data), not only vertical (higher roles).
  - Re-check permissions after role changes, logout and session expiry.
quiz:
  - id: mtperm-q1
    type: single
    topic: testing-user-permissions
    difficulty: intermediate
    prompt: A customer changes /orders/1001 to /orders/1002 in the URL and sees another customer's order. What kind of defect is this?
    options: ["Vertical privilege escalation", "Horizontal privilege escalation (broken object-level authorization)", "A usability defect", "Session fixation"]
    answer: [1]
    explanation: Both users have the same role; the defect lets one user reach another user's object. That is horizontal escalation. Vertical escalation would mean gaining a higher role's abilities.
  - id: mtperm-q2
    type: truefalse
    topic: testing-user-permissions
    difficulty: beginner
    prompt: If the Delete button is hidden for Viewers, the Viewer role cannot delete records.
    options: ["True", "False"]
    answer: [1]
    explanation: Hiding a button only changes the UI. A viewer can still send the delete request by URL, API client or browser tools. Only a server-side check prevents it.
  - id: mtperm-q3
    type: multiple
    topic: testing-user-permissions
    difficulty: intermediate
    prompt: Which tests belong in a permission test set? Select all that apply.
    options: ["Each role performs each allowed action", "Each role attempts each denied action through the UI", "Each denied action is attempted directly via URL or API", "Only the admin role is tested because it has all permissions", "Permissions are re-checked after a role is downgraded"]
    answer: [0, 1, 2, 4]
    explanation: Positive, negative UI, negative server-side and role-change tests are all needed. Testing only the admin role checks almost nothing about restrictions.
  - id: mtperm-q4
    type: single
    topic: testing-user-permissions
    difficulty: intermediate
    prompt: A logged-in user without permission calls an admin endpoint. Which response is most appropriate?
    options: ["200 OK with an empty body", "401 Unauthorized", "403 Forbidden", "500 Internal Server Error"]
    answer: [2]
    explanation: 403 means the server knows who you are but you are not allowed. 401 means you are not authenticated. Some APIs deliberately return 404 to hide that a resource exists, which is also acceptable if specified.
---

## Beginner-friendly explanation

Think of an office building with key cards. A visitor's card opens the lobby. An employee's card opens their floor. A manager's card opens the meeting rooms, and the security chief's card opens everything. Testing permissions is walking around with each card and checking two things: every door you **should** open does open, and every door you **should not** open stays shut — even if you try the back entrance.

In software, the "cards" are **roles** (Admin, Manager, Viewer, Customer) and the "doors" are **actions** (view, create, edit, delete, approve, export). The back entrance is anything other than the normal screen: typing a URL directly, or calling the API.

## Technical explanation

**Authentication** answers "who are you?" **Authorization** answers "what are you allowed to do?" Permission testing is authorization testing. Most business apps use **role-based access control (RBAC)**: permissions are attached to roles, and users get roles. Some add **attribute-based** rules, such as "a manager can approve expenses only for their own team" or "under ₹50,000".

Access control can fail in two directions:

- **Vertical:** a lower role performs a higher role's action (Viewer deletes a record).
- **Horizontal:** a user reaches another user's data at the same level (Customer A reads Customer B's invoice). In APIs this is called broken object-level authorization (BOLA).

Broken access control is the number one category in the OWASP Top 10 (2021), so this is not a niche concern.

Two layers must both be tested:

| Layer | What to check |
|---|---|
| UI | Denied actions are hidden or disabled; menus and pages match the role |
| Server | Every denied request is rejected (usually 403, or 404 to hide existence) regardless of how it is sent |

### The permission matrix

A matrix is a [decision table](/learn/manual-testing/decision-table-testing) of roles against actions. Example for an expense app:

| Action | Employee | Manager | Finance | Admin |
|---|---|---|---|---|
| Submit own expense | Yes | Yes | Yes | Yes |
| View own expenses | Yes | Yes | Yes | Yes |
| View team's expenses | No | Own team only | All | All |
| Approve expense | No | Own team, under ₹50,000 | Any | No |
| Export to payroll | No | No | Yes | No |
| Manage users | No | No | No | Yes |

Note the conditional cells and the fact that Admin cannot approve — that kind of separation-of-duties rule is easy to miss and must be confirmed.

```mermaid
flowchart TD
  R[Request arrives] --> A{Authenticated?}
  A -- No --> E401[401 Unauthorized]
  A -- Yes --> P{Role allows action?}
  P -- No --> E403[403 Forbidden]
  P -- Yes --> O{Owns or is scoped to this object?}
  O -- No --> E403b[403 or 404]
  O -- Yes --> OK[Perform action]
```

## Real-world example

An HR portal lets managers view leave requests for their team. Testing in the UI looks perfect: a manager only sees their own team in the list. A tester opens one request, notes the URL `/leave/5531`, then logs in as a manager of a different team and pastes the same URL. The full leave request, including a medical note, is displayed.

The list was filtered, but the detail endpoint only checked "is this user a manager?" and never "is this request in their team?". The fix added an ownership check on the server, and the tester added "open another team's record by URL" to every permission test set.

## Step-by-step walkthrough

1. **Collect roles and actions** from stories, the admin screens and existing documentation.
2. **Build the matrix** and get the product owner to confirm every cell, especially conditional ones.
3. **Create a test user per role** (and two users per role, for horizontal tests).
4. **Positive tests:** each role performs each allowed action successfully.
5. **Negative UI tests:** denied actions are hidden or disabled, and pages show a friendly "no access" message.
6. **Negative server tests:** while logged in as the low role, request the restricted URL directly, or replay the high role's API request with the low role's session (with an API client or DevTools).
7. **Horizontal tests:** user A tries to view, edit or delete user B's objects by changing IDs.
8. **Lifecycle tests:** role downgraded mid-session, user deactivated, logout then browser Back button, expired session.
9. **Check audit logs** if the requirement says sensitive actions are logged.

### Sample test cases

| ID | Role | Action | Route | Expected |
|---|---|---|---|---|
| PERM-01 | Manager | Approve own team's ₹20,000 expense | UI | Approved |
| PERM-02 | Manager | Approve own team's ₹60,000 expense | UI | Blocked with message |
| PERM-03 | Employee | Open /admin/users | Direct URL | 403 page |
| PERM-04 | Employee | POST approve request | API | 403, expense unchanged |
| PERM-05 | Manager A | Open team B's expense by ID | Direct URL | 403 or 404 |
| PERM-06 | Manager downgraded to Employee | Approve after downgrade | UI and API | Rejected |

## Common mistakes

- **Testing only with an admin account** because it is convenient. Admin hides every permission bug.
- **Trusting the UI.** A missing button proves nothing about the server.
- **Ignoring horizontal access.** Same role, different owner, is the most common real-world leak.
- **Not confirming the matrix.** Requirements often say what roles can do, never what they cannot.
- **Checking only the response code**, not that the data was actually unchanged after a rejected request.
- **Testing someone else's production system.** Access-control probing is only done on systems you are authorised to test.

## Key takeaways summary

Permission testing is systematic: confirm a role-by-action matrix, test every allowed and denied cell, prove denials on the server through URLs and APIs, and always try another user's data with the same role.
