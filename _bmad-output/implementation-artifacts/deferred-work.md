# Deferred Work

## Deferred from: Core Asset Control System

### Automated Verification & Testing (FR25-FR28)

- Snapshot checks verifying expected kept/removed assets per context
- Smoke tests for core admin actions on all supported contexts
- Upgrade flow coverage verification through cache bridge bootstrap
- Third-party plugin jQuery compatibility verification

**Source:** PRD `_bmad-output/planning-artifacts/prd.md`, Functional Requirements FR25-FR28

### Settings CSRF Hardening (Pre-existing)

- `settings_page.php`: `yourls_verify_nonce()` return value is not checked defensively
- `utils.php`: `$_POST['responsive_color_scheme']` is read without nonce validation context

**Source:** Edge case hunter review, findings #9 and #10 (pre-existing, not caused by core asset control change)
