# LLM Feature Discussion Meeting

## Meeting Details

| Field | Value |
|-------|-------|
| **Date** | 2026-02-12 |
| **Purpose** | Assess new high-priority requirement: LLM-powered line summaries with full lineage tracking |
| **Facilitator** | SM (Scrum Master) |
| **Triggered By** | User requirement for LLM insights on each code line |

---

## Attendees

| Role | Name | Present |
|------|------|---------|
| Product Manager | PM | ☑ |
| Scrum Master | SM | ☑ |
| Backend Engineer | BE | ☑ |
| Frontend Engineer | FE | ☑ |
| UX Designer | UX | ☑ |
| QA Engineer (Manual) | QA | ☑ |
| QA Engineer (Automation) | QAA | ☑ |
| Business Stakeholder | BIZ | ☑ |

---

## New Requirement Summary

**User Request:** Add LLM-powered summaries that explain "why" each line exists based on its FULL git history, including:
- When the line moved within the file
- When the file was renamed/moved
- When a method/function was extracted to a different file

**Constraints:**
- MVP, high-priority
- Use Anthropic API
- User provides their own API key
- Don't worry about costs yet

---

## Team Input

### BE (Backend Engineer)

#### Git Commands for Full Lineage Tracking
```bash
# Primary: blame with move/copy detection
git blame -w -M -C -C -C --line-porcelain <file>

# File rename tracking
git log --follow --name-status -- <file>

# Find commits that added/removed specific content
git log -p --follow -M -C -C -S"<line_content>" -- <file>
```

#### Data Model for LLM Context
```typescript
interface LLMLineageContext {
  currentLine: {
    content: string;
    lineNumber: number;
    file: string;
    surroundingContext: string; // ±5-10 lines
  };
  history: Array<{
    commitSha: string;
    commitMessage: string;
    author: string;
    date: string;
    diff: string;
  }>;
  movements: Array<{
    fromFile: string;
    toFile: string;
    commitMessage: string;
  }>;
}
```

#### Performance Concerns
| Concern | Impact | Mitigation |
|---------|--------|------------|
| `git blame -C -C -C` is slow | High - O(n²) | Cache blame results per commit SHA |
| Large repos (1M+ commits) | High | Pre-index, background jobs |
| LLM API latency | Medium - 1-3s | Aggressive caching, batch requests |

#### Caching Strategy
- **L1:** In-memory LRU cache (100 items, 5 min TTL)
- **L2:** localStorage for persistent LLM responses
- **Invalidation:** On new commits to file

#### Estimated Complexity
| Component | Points |
|-----------|--------|
| Git blame with -C -C -C integration | 5 |
| File rename/move tracking | 3 |
| Method move detection | 8 |
| LLM prompt engineering | 3 |
| Caching layer | 5 |
| API endpoints | 3 |

**MVP scope: ~13 points** (basic blame + LLM + caching)
**Full feature: ~40 points**

#### Technical Risks
- Git version compatibility (need 2.23+)
- Shallow clones miss move detection
- Binary files fail blame

---

### FE (Frontend Engineer)

#### API Key Handling
- Settings page with "AI Settings" section
- First-time modal prompt when LLM feature accessed
- Store in localStorage (never server-side)
- `<input type="password">` with show/hide toggle

#### LLM Summary UX Pattern
- **Streaming:** Use SSE for real-time response display
- **Skeleton:** Show placeholder while loading
- **Location:** Collapsible section in ChangePanel drawer
- **Label:** "AI Lineage Summary" with ✨ icon

#### Loading Strategy
1. Commit details load immediately (git data)
2. "Generate AI Summary" button triggers LLM call
3. Stream response word-by-word
4. Cache result for that commit

#### Error States
| Error | Treatment |
|-------|-----------|
| No API key | Banner with link to settings |
| Invalid key | Error message + retry |
| Rate limited | Warning with countdown |
| API failure | Error + retry button |

#### Estimated Complexity
| Component | Points |
|-----------|--------|
| API key settings + modal | 3 |
| LLM API route | 2 |
| Streaming response handler | 3 |
| Summary section in panel | 2 |
| Error states | 2 |

**Total FE estimate: 13-15 points**

---

### UX (UI/UX Designer)

#### Visual Hierarchy
| Element | Treatment |
|---------|-----------|
| LLM Summary | Primary - large type, high contrast |
| Confidence Indicator | Secondary - subtle badge |
| Quick Stats | Tertiary - muted, small (e.g., "5 commits · 2 moves") |
| Raw Git Data | Collapsed by default |

#### Summary Format
- 1-2 sentences, max 140 characters
- Start with action verb
- Focus on "why" not "what"

**Good:** "Prevents race condition in concurrent API calls. Originally a hotfix for #2341."
**Bad:** "This line was added by John on March 5th..."

#### Lineage Visualization
```
●━━━━━●══════●━━━●━━━●
│     │      │   │   │
Created  Moved  │  Now
Mar '23  Jan '24│
utils.js  api/ │
         [Significant refactor]
```

#### Trust Building
- Show confidence indicators (high/medium/low)
- Source attribution: "Based on 5 commits, 2 file moves"
- One-click verification to source commit
- "Was this helpful?" feedback

#### Panel Wireframe
```
┌──────────────────────────────────────────┐
│ LINE 42 CONTEXT                    [✕]   │
├──────────────────────────────────────────┤
│ 💡 WHY THIS EXISTS                       │
│                                          │
│ Prevents race condition in concurrent    │
│ API calls. Originally a hotfix for       │
│ production incident #2341.               │
│                                 [👍][👎] │
├──────────────────────────────────────────┤
│ LINEAGE · 5 commits · 2 moves            │
│                                          │
│ ●━━━●══════●━━━●━━━●                     │
│ Created  Moved    Now                    │
├──────────────────────────────────────────┤
│ ▶ RAW GIT DATA                           │
└──────────────────────────────────────────┘
```

---

### QAA (Quality Engineer - Automation)

#### Test Strategy

**Test Pyramid:**
```
E2E (1-2 smoke tests with real API) - nightly only
Integration (mocked API responses) - every PR
Unit (prompt construction, parsing) - every commit
```

#### Test Fixtures Needed
| Scenario | Purpose |
|----------|---------|
| Simple rename | A.ts → B.ts |
| Directory move | src/A.ts → lib/A.ts |
| Method extraction | Function moved to new file |
| Rename chain | A → B → C → D |
| Merge resolution | Conflicting changes resolved |

#### LLM Output Validation
- Verify referenced commit SHAs exist in lineage
- Verify mentioned issues appear in commit messages
- Verify file references are valid
- Check summary length constraints

#### Security Testing
- API key not in localStorage (or encrypted)
- Key not in request body (only headers)
- Key not logged in errors
- Key not bundled in client code

#### Estimated Test Effort: 25 points

---

### PM (Product Manager)

#### Recommended Approach: Phased Delivery
| Phase | Scope | Timeline |
|-------|-------|----------|
| Phase 1 (Sprint 1-2) | Current MVP - git history without LLM | No change |
| Phase 2 (Sprint 3) | Add LLM summaries | +1 sprint |

**Rationale:** Lineage tracking delivers value independently. Ship separately to reduce risk.

#### New Stories Required
| Story | Title | Priority | Points |
|-------|-------|----------|--------|
| STORY-008 | Track line history across file renames | P1 | 5 |
| STORY-009 | Track line movement within file | P1 | 3 |
| STORY-010 | Track method moves between files | P2 | 8 |
| STORY-011 | Configure Anthropic API key | P1 | 2 |
| STORY-012 | Generate LLM summary of line history | P1 | 5 |

#### Minimum Viable LLM Feature
- "Explain History" button in commit panel
- User provides Anthropic API key
- LLM receives lineage context
- Returns 2-3 sentence summary

#### Risk Mitigations
| Risk | Mitigation |
|------|------------|
| Tracking too slow | Progressive disclosure, caching, timeout |
| Tracking inaccurate | Confidence indicators, fallback to raw history |

---

## Key Decisions

| Decision | Rationale | Owner |
|----------|-----------|-------|
| Use Anthropic API | User requirement | User |
| User provides own API key | No backend cost/complexity | User |
| Phased delivery recommended | Reduce risk, ship value incrementally | PM |
| Separate lineage and LLM stories | Independent value, testability | PM |
| On-demand LLM (not pre-fetch) | Cost control, rate limits | FE |
| Store API key in localStorage | Client-side only, never server | FE |

---

## New Stories Created

### STORY-008: Track Line History Across File Renames

**As a** developer,
**I want** to see the full history of a line including when its file was renamed,
**So that** I can trace code changes even after refactoring.

**Acceptance Criteria:**

**AC1:** Given a file was renamed, when I view blame, then lineage shows the rename commit with old/new paths.

**AC2:** Given multiple renames, when I view lineage, then events shown chronologically with all paths.

**AC3:** Given large repo (10k+ commits), when I click a line, then lineage loads within 3 seconds.

**Points:** 5 | **Priority:** P1

---

### STORY-011: Configure Anthropic API Key

**As a** developer,
**I want** to enter my Anthropic API key,
**So that** I can use LLM features with my own account.

**Acceptance Criteria:**

**AC1:** Given I'm in settings, then I see "Anthropic API Key" field.

**AC2:** Given I enter a key and save, then it's stored in localStorage (never sent to server).

**AC3:** Given I click "Remove Key", then key is deleted and LLM features show "key required".

**Points:** 2 | **Priority:** P1

---

### STORY-012: Generate LLM Summary of Line History

**As a** developer,
**I want** an AI-generated explanation of why a line exists,
**So that** I can understand context without reading all commits.

**Acceptance Criteria:**

**AC1:** Given I have an API key, when I click "Explain History", then LLM request initiates with loading indicator.

**AC2:** Given LLM completes, then I see 2-4 sentence explanation referencing specific commits.

**AC3:** Given no API key, when I click "Explain History", then I see message with link to settings.

**AC4:** Given API error, then I see error message and full commit history remains visible.

**Points:** 5 | **Priority:** P1

---

## Updated Estimates

### Sprint Impact

| Original Sprint 1 | Points |
|-------------------|--------|
| STORY-001 to STORY-005 | 17 |

| New Stories for LLM (Sprint 2-3) | Points |
|----------------------------------|--------|
| STORY-008: File rename tracking | 5 |
| STORY-009: Line movement tracking | 3 |
| STORY-010: Method move detection | 8 |
| STORY-011: API key config | 2 |
| STORY-012: LLM summary | 5 |
| Test automation | 10 |
| **Total new work** | **33** |

### Revised Timeline
- **Sprint 1:** Original MVP (17 pts) - blame + commit + merge
- **Sprint 2:** Lineage tracking (16 pts) - STORY-006, 007, 008, 009
- **Sprint 3:** LLM integration (15 pts) - STORY-010, 011, 012

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Create STORY-008, 009, 010, 011, 012 files | PM | Today |
| Update EPIC-001 with new stories | PM | Today |
| Add lineage tracking tasks to sprint backlog | SM | Sprint 2 planning |
| Technical spike: validate cross-file move detection | BE | Sprint 1 |
| Design lineage visualization component | UX | Sprint 2 |
| Create test fixtures for rename/move scenarios | QAA | Sprint 2 |

---

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Where does "Explain History" button live in UI? | UX | Pending mockup |
| Is cross-file method detection reliable enough? | BE | Needs spike |
| Token limits for large lineage histories? | BE | TBD |

---

*Meeting notes by: SM*
