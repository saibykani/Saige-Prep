---
slug: qa-qc-and-testing
title: QA, QC and testing
summary: Quality assurance, quality control and testing are related but not the same. Learn how ISTQB separates process-oriented QA from product-oriented QC, and where testing fits.
level: beginner
duration: 20
tags: [fundamentals, istqb, quality]
objectives:
  - Define quality assurance and quality control using ISTQB terminology
  - Explain why testing is a form of quality control
  - Classify everyday activities as QA, QC or testing
  - Explain how test results feed both QA and QC
prerequisites:
  - What is software testing?
related: [what-is-software-testing, why-testing-is-required, verification-vs-validation, root-cause-analysis, static-vs-dynamic-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 1.2.2, Testing and Quality Assurance)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISTQB Glossary of testing terms
    url: https://glossary.istqb.org/
interview:
  - q: What is the difference between QA and QC?
    a: Quality assurance is process-oriented and preventive. It focuses on establishing and improving the processes used to build software, on the basis that good processes produce good products. Quality control is product-oriented and corrective. It examines the product to check whether it meets the required quality and supports fixing what does not. Testing is a major form of quality control.
  - q: Your job title is QA Engineer, but you mostly execute tests. Are you doing QA?
    a: Strictly by ISTQB definitions, executing tests is quality control, because it examines the product. Industry job titles often use QA loosely to mean testing. A good QA engineer does both, for example by running tests and also feeding defect trends back into retrospectives, improving review checklists or proposing better definitions of done, which is genuine quality assurance.
  - q: How do test results support quality assurance?
    a: In QC, test results are used to fix defects in the product. In QA, the same results show how well the development and test processes are working. If many defects trace back to unclear requirements, that is evidence to improve the refinement process, which is a QA action.
practice:
  - "Classify each activity as QA, QC or both: a code review of a pull request, introducing a definition of done, running a regression suite, a retrospective on escaped defects, training developers on secure coding."
  - "Look at three job adverts titled 'QA Engineer'. List which duties are really QA and which are QC."
  - "Your team's last three releases each had defects caused by missing acceptance criteria. Propose one QA improvement and one QC activity that would help."
takeaways:
  - QA is process-oriented and preventive; QC is product-oriented and corrective.
  - Testing is a major form of quality control, alongside other activities such as formal methods and simulation.
  - Test results feed QC by finding defects to fix, and QA by revealing process weaknesses.
  - Quality is the responsibility of everyone on the project, not only the testers.
  - Industry job titles often blur these terms, so know the precise definitions for exams and interviews.
quiz:
  - id: qaqc-q1
    type: single
    topic: qa-qc-and-testing
    difficulty: beginner
    prompt: Which description matches quality assurance in ISTQB terms?
    options: ["Product-oriented and corrective, focused on finding defects in the product", "Process-oriented and preventive, focused on establishing and improving processes", "Executing test cases against a build", "Fixing defects reported by testers"]
    answer: [1]
    explanation: QA is process-oriented and preventive. The first option describes quality control, executing tests is a QC activity, and fixing defects is debugging.
  - id: qaqc-q2
    type: truefalse
    topic: qa-qc-and-testing
    difficulty: beginner
    prompt: Testing is a form of quality control.
    options: ["True", "False"]
    answer: [0]
    explanation: Testing examines the product to check whether it meets quality requirements, which makes it a product-oriented, corrective activity, that is, quality control.
  - id: qaqc-q3
    type: scenario
    topic: qa-qc-and-testing
    difficulty: intermediate
    prompt: After several releases, the team notices most escaped defects involve date handling. They add a date-handling checklist to code reviews and a short training session for developers. What kind of activity is this?
    options: ["Quality control, because it finds date defects in the current build", "Quality assurance, because it improves the process to prevent future defects", "Debugging, because it fixes date defects", "Neither, because it does not involve testing"]
    answer: [1]
    explanation: Changing the review process and training people prevents future defects, which is process-oriented QA. It does not examine the current build, so it is not QC, and it does not fix specific defects, so it is not debugging.
  - id: qaqc-q4
    type: multiple
    topic: qa-qc-and-testing
    difficulty: intermediate
    prompt: Which of these are quality control activities? Select all that apply.
    options: ["Executing a regression test suite", "Reviewing a pull request to find defects in the code", "Defining the team's definition of done", "Running static analysis on the code base", "Holding a process retrospective"]
    answer: [0, 1, 3]
    explanation: Regression testing, code review and static analysis all examine the product, so they are QC. Defining the definition of done and running a process retrospective improve the process, which is QA.
---

## Beginner-friendly explanation

Picture a bakery that wants every loaf to be perfect.

- The owner writes a standard recipe, trains new bakers, calibrates the ovens every morning and reviews why last week's batch came out flat. None of that looks at a specific loaf. It improves *the way bread is made*, so that good loaves are the normal result. That is **quality assurance (QA)**.
- At the end of each batch, someone cuts open a loaf, checks the crumb, weighs it and tastes it. If it is wrong, the batch is not sold. That looks at *the bread itself*. That is **quality control (QC)**.
- The cutting, weighing and tasting are the bakery's **testing**: the specific checks that make quality control possible.

Both matter. A great recipe does not guarantee every loaf is good, and checking every loaf does not fix a broken recipe.

## Technical explanation

The ISTQB syllabus (v4.0, section 1.2.2) explains that testing and quality assurance are often confused, but are not the same. It frames both inside **quality management**, which includes QA and QC.

| Aspect | Quality assurance (QA) | Quality control (QC) |
|---|---|---|
| Focus | Processes | Product |
| Orientation | Preventive | Corrective |
| Underlying idea | A good process produces a good product | The product is checked against the required quality |
| Typical activities | Process definition, standards, training, audits, retrospectives, process improvement | Testing, reviews of work products, static analysis, and other techniques such as formal methods or simulation |
| Applies to | Development and testing processes | Work products and the system |
| Who | Everyone on the project | Everyone, with testers playing a central role |

**Testing is a major form of quality control.** It is not the only one; ISTQB mentions others such as formal methods (for example model checking and proof of correctness), simulation and prototyping.

### How test results are used

The same test results serve two purposes:

```mermaid
flowchart LR
  T["Test results"] --> QC["QC: fix defects in this product"]
  T --> QA["QA: learn how well the processes work"]
  QA --> PI["Process improvement, for example better reviews or clearer acceptance criteria"]
  PI -. "fewer defects introduced next time" .-> T
```

- In **QC**, results are used to fix defects in the product.
- In **QA**, results provide feedback on how well development and test processes are performing, which drives process improvement.

### A note on job titles

Many organisations call their testers "QA engineers" or the test team "QA". That is a naming convention, not the ISTQB definition. In practice a strong tester does both kinds of work: they test the product (QC) and help improve how the team works (QA), for example by analysing defect trends or improving the definition of done.

## Real-world example

A generic insurance-quotes team notices that customers keep reporting wrong premiums after releases.

**QC response:** testers add more test cases for premium calculation, run them on every build and log defects for wrong results. Developers fix those defects. The current product gets better.

**QA response:** the test lead groups the last two quarters of premium defects by root cause. Most trace back to rating rules being copied by hand from a spreadsheet into code. The team introduces a process change: rating rules are reviewed by an actuary as part of each story's acceptance criteria, and a shared table of examples becomes the test basis. Future products get better.

Both responses used the same evidence. One fixed *this* product; the other changed *how* products are built.

## Step-by-step walkthrough

To classify any activity, ask these questions in order:

1. **Does it examine a specific work product or the system?** If yes, it is QC (and if it involves checking against expectations, it is likely testing).
2. **Does it change how work is done in future?** If yes, it is QA.
3. **Does it fix a specific defect?** That is debugging or rework, which follows QC.
4. **Does it do more than one of these?** Many activities do. A retrospective that reviews defect data is QA informed by QC results.

## Common mistakes

- **Using QA and testing as synonyms in exams.** ISTQB treats QA as process-oriented and testing as part of product-oriented QC.
- **Thinking QA belongs to the test team.** Quality assurance is everyone's responsibility; process improvements usually need developers, product owners and managers.
- **Treating QC as enough.** Finding the same kind of defect release after release, without changing the process, wastes effort.
- **Treating QA as enough.** Even an excellent process produces defects; the product still needs checking.
- **Throwing away test results after a release.** Defect data is valuable QA input for retrospectives and root cause analysis.

## Troubleshooting

- **Your team expects "QA" to own quality on its own.** Share defect data showing where defects are introduced, such as unclear stories or missing unit tests, and propose whole-team actions. Quality assurance only works when the people who own the process take part.
- **Retrospectives never discuss defects.** Bring a short summary of escaped and late-found defects grouped by cause. Patterns turn individual QC findings into QA improvements.
- **Process changes are proposed but never stick.** Make each improvement small and measurable, for example "every story has at least one negative acceptance criterion", and check in the next retrospective whether it reduced the defects it targeted.
- **An interviewer asks about QA versus QC and your title says QA.** Give the ISTQB definitions first, then explain honestly which of your activities were QC and which were QA.

## Key takeaways summary

Quality assurance improves the processes that produce software and aims to prevent defects. Quality control examines the product and aims to find and correct them. Testing is a major form of quality control, and its results also feed quality assurance by showing where processes need to improve. Good testers understand the difference and contribute to both.
