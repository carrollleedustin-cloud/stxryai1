# Dependency Audit Report

**Date:** December 22, 2025  
**Audit Type:** Full dependency review

---

## Summary

| Category | Count |
|----------|-------|
| Safe to Update (minor/patch) | 8 |
| Breaking Changes (major) | 11 |
| Up to Date | Remaining |

---

## Safe Updates (Minor/Patch) - Can Update Now

These are backwards-compatible updates that should be applied:

| Package | Current | Wanted | Action |
|---------|---------|--------|--------|
| @netlify/plugin-nextjs | 5.15.2 | 5.15.3 | ✅ Update |
| @supabase/supabase-js | 2.88.0 | 2.89.0 | ✅ Update |
| @tailwindcss/forms | 0.5.10 | 0.5.11 | ✅ Update |
| @typescript-eslint/eslint-plugin | 8.50.0 | 8.50.1 | ✅ Update |
| @typescript-eslint/parser | 8.50.0 | 8.50.1 | ✅ Update |
| posthog-js | 1.308.0 | 1.310.0 | ✅ Update |

**Command to run:**
```bash
npm update @netlify/plugin-nextjs @supabase/supabase-js @tailwindcss/forms @typescript-eslint/eslint-plugin @typescript-eslint/parser posthog-js
```

---

## Major Version Updates - Requires Planning

### Critical Path Dependencies (Affects Core Functionality)

| Package | Current | Latest | Breaking Changes | Priority |
|---------|---------|--------|------------------|----------|
| **next** | 14.2.35 | 16.1.1 | Yes - React 19 required | High |
| **react** | 18.2.0 | 19.2.3 | Yes - New features, some deprecated APIs | High |
| **react-dom** | 18.2.0 | 19.2.3 | Yes - Must match React version | High |
| **tailwindcss** | 3.4.6 | 4.1.18 | Yes - Config changes, new syntax | Medium |

**Migration Plan:**
1. React 18 → 19: Wait for ecosystem maturity (Next.js 16 stable)
2. Next.js 14 → 16: Plan for Q1 2026 when stable
3. Tailwind 3 → 4: Can upgrade after testing

### Development Dependencies

| Package | Current | Latest | Breaking Changes | Priority |
|---------|---------|--------|------------------|----------|
| @storybook/* | 8.6.x | 10.1.10 | Yes - Major API changes | Low |
| @types/jest | 29.x | 30.0.0 | Minor - Jest 30 types | Low |
| jest | 29.7.0 | 30.2.0 | Minor - Some API changes | Low |
| @types/node | 20.x | 25.x | Yes - Node 25 types | Low |
| @types/react | 18.x | 19.x | Yes - React 19 types | Low |

### Business Logic Dependencies

| Package | Current | Latest | Breaking Changes | Priority |
|---------|---------|--------|------------------|----------|
| lucide-react | 0.268.0 | 0.562.0 | Possible icon renames | Medium |
| recharts | 2.15.4 | 3.6.0 | Yes - API changes | Medium |
| stripe | 17.7.0 | 20.1.0 | Yes - API changes | High |
| @stripe/stripe-js | 4.10.0 | 8.6.0 | Yes - API changes | High |
| resend | 4.8.0 | 6.6.0 | Yes - API changes | Medium |

---

## Recommended Update Schedule

### Immediate (This Sprint)
- [x] Safe minor/patch updates (listed above)
- [ ] Run `npm audit fix` for security patches

### Short-term (1-2 Sprints)
- [ ] lucide-react: Update to latest 0.5xx version, test icon usage
- [ ] resend: Update to v6 with email service testing

### Medium-term (1-2 Months)
- [ ] stripe & @stripe/stripe-js: Update together, test payment flows
- [ ] recharts: Update to v3, test all charts

### Long-term (Q1 2026)
- [ ] React 19 + Next.js 16 migration
- [ ] Tailwind CSS 4 migration
- [ ] Storybook 10 migration

---

## Security Audit

Run regularly:
```bash
npm audit
npm audit fix
```

---

## Scripts Added

### Check for outdated packages:
```bash
npm outdated
```

### Update safe packages:
```bash
npm update
```

### Check for security vulnerabilities:
```bash
npm audit
```

---

## Notes

1. **Lock file integrity**: Always commit `package-lock.json` after updates
2. **Testing**: Run full test suite after any updates
3. **Staging**: Deploy updates to staging before production
4. **Rollback plan**: Keep previous `package-lock.json` for quick rollback

