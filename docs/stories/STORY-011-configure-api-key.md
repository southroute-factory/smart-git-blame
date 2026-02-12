# STORY-011: Configure Anthropic API Key

## Story

**As a** developer,
**I want** to enter my Anthropic API key to enable LLM features,
**So that** I can get AI-powered summaries using my own account.

---

## Details

| Field | Value |
|-------|-------|
| **Story ID** | STORY-011 |
| **Epic** | Semantic Source Code Viewer |
| **Priority** | P1 |
| **Sprint** | Sprint 3 |
| **Estimated Points** | 2 |

---

## Acceptance Criteria

### AC1: Access settings
**Given** I am using the application
**When** I click on the settings icon
**Then** I see an "API Keys" or "AI Settings" section
**And** there is a field for "Anthropic API Key"

### AC2: Save key locally
**Given** I am on the API settings page
**When** I enter a valid API key and click Save
**Then** the key is stored in browser localStorage
**And** I see a confirmation message "API key saved"
**And** the key is NOT sent to any server

### AC3: Validate key format
**Given** I enter an API key
**When** the key does not match expected format (sk-ant-*)
**Then** I see a warning "This doesn't look like a valid Anthropic API key"
**And** I can still save it (soft validation only)

### AC4: Mask saved key
**Given** I have saved an API key
**When** I return to settings
**Then** the key is masked (shows only last 4 characters)
**And** I can reveal full key with a "show" toggle

### AC5: Clear key
**Given** I have a saved API key
**When** I click "Remove Key"
**Then** the key is deleted from localStorage
**And** LLM features show "API key required" state

---

## Technical Notes

- Store in localStorage with key `anthropic_api_key`
- Never send key to backend server
- Use `<input type="password">` with visibility toggle
- Consider session-only storage option for shared machines

## Team Input

### BE (Backend Engineer)
- **Estimate:** 0 points - no backend work
- **Notes:** API calls made directly from browser to Anthropic

### FE (Frontend Engineer)
- **Estimate:** 2 points
- **Components:**
  - Settings page or modal
  - API key input with mask/reveal
  - Save/clear buttons
  - Context provider for key access
- **Security:** Never log key, use password input type

### UX (UI/UX Designer)
- **Recommendations:**
  - First-time modal when user tries LLM feature without key
  - Clear privacy messaging: "Your key is stored locally and never sent to our servers"
  - Link to Anthropic docs for getting API key

### QAA (Quality Engineer - Automation)
- **Test Cases:**
  - Key saved to localStorage
  - Key not in network requests to our server
  - Key cleared on remove
  - Masked display works correctly

---

## Dependencies

- None (can be built independently)

---

## Out of Scope

- Server-side key validation
- Multiple API key support
- Key encryption in localStorage
- Usage tracking/billing display
