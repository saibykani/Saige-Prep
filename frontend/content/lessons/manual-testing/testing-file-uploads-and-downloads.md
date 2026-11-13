---
slug: testing-file-uploads-and-downloads
title: Testing File Uploads and Downloads
summary: Uploads and downloads hide many defects - size limits, file types, names, interrupted transfers and security. Learn a structured checklist with boundary tests, negative files and download verification.
level: intermediate
duration: 35
tags: [real-world, file-upload, boundary-testing, security]
objectives:
  - Identify the input dimensions of a file upload (size, type, name, count, content)
  - Apply boundary value analysis to file size and file count limits
  - Design negative tests for disguised, empty, corrupt and oversized files
  - Verify downloaded files for content, name, type and access control
prerequisites:
  - Boundary value analysis
  - Equivalence partitioning
related: [boundary-value-analysis, equivalence-partitioning, testing-data-validation, testing-user-permissions, testing-multi-browser-and-network-issues]
references:
  - title: OWASP File Upload Cheat Sheet
    url: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
  - title: MDN Web Docs — input type="file"
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
  - title: MDN Web Docs — Content-Disposition header
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition
interview:
  - q: How would you test a profile-picture upload that accepts JPG and PNG up to 5 MB?
    a: I partition by type, size, name and content. For size I test just under, exactly at and just over 5 MB, plus a 0-byte file. For type I test JPG, PNG, uppercase extensions, a disallowed type like GIF or PDF, and a file renamed to .jpg that is really something else, to see whether the server checks content and not just the extension. I also test long and special-character file names, corrupt images, cancelling and re-uploading, network interruption, and that the stored image is shown correctly and cannot be accessed by other users if it should be private.
  - q: Why is checking the file extension in the browser not enough?
    a: The browser's accept attribute and JavaScript checks are conveniences that anyone can bypass with an API client or by renaming a file. The server must validate the type from the content, enforce the size limit, rename the stored file, and store it where it cannot be executed. As a tester I verify the server rejects bad files sent directly.
  - q: What do you check on a file download?
    a: That the file downloads with the expected name and extension, opens correctly, contains the right data (for example, an export matches the on-screen filter), handles special characters and large data sets, and that the download link is protected — another user or a logged-out user should not be able to fetch it by reusing the URL.
practice:
  - "A document portal accepts PDF, DOCX and XLSX, up to 10 files per upload, each up to 20 MB. Write the boundary and negative test cases."
  - "Export a report from any app you use to CSV and check: column headers, row count against the screen, date format and non-English characters."
  - "Write test cases for a download link that should expire after 15 minutes."
takeaways:
  - Treat a file as several inputs - size, type, name, count and content - and partition each.
  - Use BVA on size and count limits, including 0 bytes and 1 file.
  - The server must validate type by content and enforce limits; test it directly.
  - Downloads need content, naming, encoding and access-control checks.
  - Interrupted, cancelled and duplicate uploads are common sources of defects.
quiz:
  - id: mtfile-q1
    type: single
    topic: testing-file-uploads-and-downloads
    difficulty: beginner
    prompt: The upload limit is 5 MB (5,242,880 bytes). Which set best covers the size boundaries?
    options: ["1 MB and 4 MB", "5,242,879, 5,242,880 and 5,242,881 bytes", "10 MB and 100 MB", "Only a 5 MB file"]
    answer: [1]
    explanation: Three-value BVA around the exact limit finds off-by-one errors and MB/MiB confusion. Typical values like 1 MB or huge values miss the edge.
  - id: mtfile-q2
    type: scenario
    topic: testing-file-uploads-and-downloads
    difficulty: intermediate
    prompt: You rename a text file to photo.png and upload it. The app accepts it and later shows a broken image. What does this reveal?
    options: ["Nothing, renamed files are the user's problem", "The server checks only the extension, not the file content", "The browser cache is stale", "The file was too large"]
    answer: [1]
    explanation: Accepting a non-image as an image shows type validation relies on the name. Robust servers inspect the content (for example the file signature) and reject mismatches.
  - id: mtfile-q3
    type: multiple
    topic: testing-file-uploads-and-downloads
    difficulty: intermediate
    prompt: Which are valid negative tests for an upload? Select all that apply.
    options: ["A 0-byte file", "A file of a disallowed type", "A file name with 255 characters and Unicode", "A valid 1 MB JPG", "Uploading one file more than the maximum count"]
    answer: [0, 1, 2, 4]
    explanation: Empty, disallowed, unusual names and over-count are negative or edge cases. A valid 1 MB JPG is a positive test.
  - id: mtfile-q4
    type: truefalse
    topic: testing-file-uploads-and-downloads
    difficulty: intermediate
    prompt: A private invoice download link should still work if copied and opened by a different logged-in user.
    options: ["True", "False"]
    answer: [1]
    explanation: Unless the link is deliberately a shareable, time-limited token, the server must check that the requester is allowed to access that file. Otherwise anyone with the URL can read private data.
---

## Beginner-friendly explanation

Think of a post office counter. It accepts letters and parcels, but only up to a certain weight, only certain shapes, and nothing dangerous. A good counter clerk weighs the parcel, checks what is inside, writes a tracking label, and gives it back only to the right person.

A file upload is that counter. The "parcel" is the file, and it has a weight (size), a label (file name and extension), contents (the actual bytes), and an owner. Testing uploads means sending all sorts of parcels — tiny, huge, mislabelled, broken — and checking the counter handles each correctly. Testing downloads means checking you get the right parcel back, undamaged, and that nobody else can collect it.

## Technical explanation

In a browser, an upload uses `input type="file"` and is usually sent as a `multipart/form-data` HTTP request. The `accept` attribute only filters the file picker; it does not stop other files being sent. Real validation must happen on the server.

Treat one upload as several independent inputs and apply [equivalence partitioning](/learn/manual-testing/equivalence-partitioning) and [boundary value analysis](/learn/manual-testing/boundary-value-analysis) to each:

| Dimension | Valid partitions | Invalid / edge partitions |
|---|---|---|
| Size | 1 byte to limit | 0 bytes, limit + 1 byte, very large |
| Type | Allowed extensions and content | Disallowed type, renamed file, uppercase extension `.PNG`, double extension `invoice.pdf.exe` |
| Name | Normal names | Spaces, Unicode, very long names, `../` path characters, same name as an existing file |
| Count | 1 to max | 0 files, max + 1 |
| Content | Well-formed file | Corrupt, password-protected, empty spreadsheet, image with huge dimensions |

**Watch the unit.** "5 MB" may mean 5,000,000 bytes or 5 × 1,024 × 1,024 = 5,242,880 bytes. Ask, and test both edges if unclear.

Server-side behaviour to verify (from the OWASP File Upload Cheat Sheet): allow-list of types, content-type validation beyond the extension, size limits, renaming stored files, storing outside the web root, and malware scanning where required.

For downloads, the server sets `Content-Type` and usually `Content-Disposition: attachment; filename="report.csv"`. Check name, extension, encoding (for example UTF-8 in CSV opened in a spreadsheet), and content accuracy.

```mermaid
sequenceDiagram
  participant U as User
  participant B as Browser
  participant S as Server
  U->>B: Choose file
  B->>B: Client checks (type, size) - convenience only
  B->>S: POST multipart/form-data
  S->>S: Validate size, type by content, name, permissions
  alt valid
    S-->>B: 201 Created + file id
  else invalid
    S-->>B: 400, 413 or 415 with a clear message
  end
```

## Real-world example

An insurance claims portal accepts photos of damage. Testing in Chrome on a laptop goes well. A tester then uploads photos straight from an iPhone, which saves photos in HEIC format by default in many configurations. The upload succeeds but the claims handler sees a broken image. A second defect appears with a 9.8 MB photo: the limit was 10 MB on the page but 8 MB on the server, so the user saw a generic "Something went wrong".

Both were found by thinking about real users' files, not just neat test files on a laptop, and by testing exactly around the limit.

## Step-by-step walkthrough

1. **Read the rules:** allowed types, size limit and unit, max count, where files are shown and who can see them.
2. **Prepare a test-file kit:** 0-byte file, files at limit − 1, limit and limit + 1 bytes, each allowed type, a disallowed type, a renamed file, a corrupt file, long and Unicode names.
3. **Positive tests:** each allowed type uploads, displays and downloads correctly.
4. **Boundary tests:** size and count edges.
5. **Negative tests:** each invalid file shows a clear, specific error and nothing is stored.
6. **Interruption tests:** cancel mid-upload, lose network (DevTools offline), refresh during upload, double-click Upload.
7. **Download tests:** name, type, content matches source, large exports, special characters.
8. **Access tests:** open another user's file URL, log out and reuse a download link, check expiry of signed links.

### Sample test cases

| ID | Input | Expected |
|---|---|---|
| UP-01 | `photo.jpg`, 2 MB | Uploaded, thumbnail shown |
| UP-02 | Exactly at limit | Uploaded |
| UP-03 | Limit + 1 byte | Rejected: "File must be 5 MB or smaller" |
| UP-04 | 0-byte `.png` | Rejected with clear message |
| UP-05 | `notes.txt` renamed to `notes.png` | Rejected as invalid image |
| UP-06 | `résumé final (2).PDF` | Uploaded, name shown correctly |
| UP-07 | Network off at 50% | Clear failure, retry possible, no partial file stored |
| DL-01 | Export 10,000 rows to CSV | Row count matches; accents display correctly |
| DL-02 | Other user opens DL link | 403 or 404 |

## Common mistakes

- **Using only small, perfect test files.** Real users upload phone photos, scanned PDFs and huge spreadsheets.
- **Ignoring the MB versus MiB difference** at the limit.
- **Trusting the browser's file picker filter** as the validation.
- **Not checking what was stored** after a rejected upload (orphan or partial files).
- **Forgetting downloads entirely**, or opening the file without checking the content.
- **Uploading real malware to test scanning.** Use the standard, harmless EICAR test file, and only on systems you are authorised to test.

## Key takeaways summary

A file is several inputs at once. Partition and boundary-test size, type, name, count and content; prove the server validates independently of the browser; and verify downloads for correctness and access control.
