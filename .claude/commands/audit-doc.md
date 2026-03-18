---
model: sonnet
---

# audit-doc

You are auditing the documentation file: **$ARGUMENTS**

Your job is to verify every claim in this document against the actual codebase and produce an updated, accurate version. Follow these 7 steps exactly.

---

## Step 1: DISCOVER DOCUMENT

Read the target `.md` file at the project root. Understand its structure: sections, headings, what it documents.

## Step 2: READ DOCUMENT

Parse **every verifiable claim** in the document. Verifiable claims include:
- File paths (e.g., `src/components/ui/button.tsx`)
- Component/function/hook names
- Counts (e.g., "52 components", "6 hooks")
- Props/interfaces (TypeScript types documented)
- Version numbers (e.g., "Next.js 16", "React 18.3")
- Status claims (e.g., "completed", "in progress")
- Relationship claims (e.g., "Used by ChartClient", "Imports DiamondChart")
- Directory structures (tree diagrams)
- Commands or procedures

Create a mental ledger of every claim to verify.

## Step 3: DISCOVER CODEBASE (doc-driven)

Using the document's claims as your guide, explore the codebase:

**For Entity claims** (file paths, component names):
- `glob` for every file path the doc references — does it exist?
- `glob` the directories the doc claims to cover — are there files it missed?

**For Configuration claims** (versions, tech stack):
- Read `package.json` — compare documented versions to actual
- Read config files (`tsconfig.json`, `next.config.*`, `.env.example`)

**For Status claims** (completed, in progress):
- `git log` — check if referenced features have commits
- Check if referenced code/files actually exist

**For Quantitative claims** (counts):
- Count actual files matching the patterns
- Compare to documented numbers

**For Relationship claims** (imports, usage):
- `grep` for import statements across `src/`
- Verify "used by X" claims

**For Procedural claims** (commands, setup steps):
- Verify commands exist and paths are valid

### Auto-detect Document Type

Based on the content, apply the appropriate profile:

- **Entity Catalog** (lists components/files with paths and props) → Full file existence + import tracing + prop verification
- **Architecture Overview** (describes tech stack, structure) → Version matching + directory tree verification
- **Progress Tracker** (tracks completion status) → git log verification + feature existence checks
- **Procedural Guide** (step-by-step instructions) → Command validity + path existence
- **Task Doc** (refactoring/improvement tasks) → Check if referenced patterns still exist

## Step 4: CREATE GAP DOCUMENT

Produce a structured gap analysis. Classify every verified claim as:

| Status | Meaning |
|--------|---------|
| **ACCURATE** | Claim matches reality |
| **PHANTOM** | Documented but file/feature does NOT exist |
| **MISSING** | Exists in codebase but NOT documented |
| **STALE** | Documented but details are wrong (wrong count, path, prop, version) |
| **UNVERIFIABLE** | Cannot be mechanically checked (subjective descriptions, future plans) |

Present this gap analysis as a table to the user. Example:

```
| # | Section | Claim | Status | Detail |
|---|---------|-------|--------|--------|
| 1 | UI Components | table.tsx exists | PHANTOM | File not found |
| 2 | Chart | SadeSatiTableView | MISSING | Exists but not documented |
| 3 | Stats | "28 UI components" | STALE | Actually 17 |
```

**PAUSE HERE** — Present the gap analysis to the user and wait for them to review before continuing.

## Step 5: RE-VERIFY & RATE ACCURACY

Self-audit your own gap analysis:

1. For each **PHANTOM** claim: Did you search correctly? Try alternate paths/names.
2. For each **MISSING** claim: Is it really absent from the doc? Check for alternate names.
3. For each **STALE** claim: Double-check your numbers.
4. Re-run targeted `grep`/`glob` for anything borderline.

Rate your gap analysis accuracy out of 10 using this rubric:

| Score | Meaning |
|-------|---------|
| **9-10** | Every finding independently verified with targeted searches. High confidence. |
| **7-8** | Most findings verified. A few relied on snapshot data without re-checking. |
| **5-6** | Mixed confidence. Some findings may have false positives/negatives. |
| **Below 5** | Low confidence. Re-run the audit before presenting. |

Fix any errors you find. Present corrections and the final accuracy rating to the user.

**This rating will be included in the email report so the reviewer knows how much to trust the output.**

## Step 6: REVERSE ENGINEERING (Deep Analysis)

Now go **beyond the document** — analyze the codebase independently:

1. For each entity file that exists, trace actual imports:
   ```
   grep -r "import.*ComponentName" src/
   ```

2. Classify every entity into two categories:
   - **Active (There and using it)** — imported and rendered somewhere in the app
   - **Dead code (There but not using anywhere)** — file exists but zero imports

3. Check if this deep analysis reveals anything the gap analysis missed.

Present the active vs dead code classification to the user.

## Step 7: GENERATE FINAL DOCUMENT

Produce the complete updated `.md` file:

1. **Preserve** the original document's structure, style, and tone
2. **Remove** phantom entries (or move to a "Removed" section)
3. **Add** missing entries with proper categorization and documentation
4. **Fix** stale information (counts, paths, props, versions)
5. **Flag dead code** in a dedicated section with recommendations
6. **Update metadata**: bump version, update date, fix counts
7. **Add "Audit Log"** at the bottom noting what changed

**PRESENT THE FULL DOCUMENT to the user for review.** Do NOT write to disk until the user explicitly approves.

---

## Important Rules

- NEVER write to the file without explicit user approval
- ALWAYS pause after Step 4 (gap analysis) for user review
- ALWAYS present the final document before writing
- If you find a codebase snapshot in memory (`codebase_snapshot.md`), use it to avoid redundant scanning
- Be thorough but efficient — use targeted searches, not brute force
- When in doubt about a claim, flag it as UNVERIFIABLE rather than guessing
