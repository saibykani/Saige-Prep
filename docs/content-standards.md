# Content standards

Lessons are Markdown files with YAML front matter under `backend/content/<track>/`. They are seeded into MongoDB by an idempotent script (Phase 2) and checked by `scripts/validate_content.py`.

## Lesson contract
Each lesson contains these sections where relevant (the validator enforces the ones marked required):

1. Title and learning objectives (**required**)
2. Prerequisites (**required**)
3. Beginner-friendly explanation (**required**)
4. Technical explanation (**required**)
5. Real-world example (**required**)
6. Architecture or workflow diagram (Mermaid)
7. Step-by-step walkthrough
8. Code examples
9. Expected output
10. Screenshots or annotated visuals (genuine only)
11. Common mistakes (**required**)
12. Troubleshooting
13. Interview questions (**required**)
14. Practice tasks (**required**)
15. Quiz with answer explanations (**required**)
16. Key takeaways (**required**)
17. Related lessons
18. Reference links (official documentation preferred)

## Integrity rules
- Never invent screenshots, citations, videos or links. Every external link must point to a real, official or well-known source and is checked in Phase 9.
- Diagrams are original (Mermaid or SVG).
- Third-party material is linked, not redistributed, unless its licence allows it. Attribution goes in the resource metadata.
- Mark each skill as **essential**, **role-specific** or **optional**. Roles do not all have identical requirements.
- Security and performance exercises target local or explicitly authorized systems only.
