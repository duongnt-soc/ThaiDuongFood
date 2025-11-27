## 📌 Purpose of this Pull Request

<!-- Briefly explain the purpose of this PR: feature, bug fix, refactor, etc. -->

- [ ] New feature
- [ ] Bug fix
- [ ] Code refactor
- [ ] Documentation update
- [ ] Style/Formatting
- [ ] Other: ****\_\_\_****

**Short Description**:

<!-- Provide a concise description of what this PR is about -->

> e.g. Implemented Google OAuth login integration and UI updates on the login page.

---

## ✅ Summary of Changes

<!-- List all the major changes made in this PR -->

- Added `/api/auth/google` endpoint for login
- Updated login page UI to include a "Sign in with Google" button
- Added unit tests for the OAuth middleware

---

## 🧪 How to Test

<!-- Provide steps or instructions for reviewers to test this PR -->

1. Run the development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. Confirm that you're redirected after a successful login

---

## 🔗 Related Issues / Dependencies

<!-- Link related issues or dependent PRs -->

- Related Issue: #123
- Depends on: #456

---

## 📸 Screenshots / Video (If UI changes)

<!-- Upload screenshots or gifs here if applicable -->
<!-- Example: ![Login UI](https://example.com/login-preview.png) -->

---

## 📝 Checklist

<!-- Make sure all necessary items are covered -->

- [ ] The code works as expected locally
- [ ] Tests were added/updated (if applicable)
- [ ] ESLint/Prettier checks passed
- [ ] Documentation was updated (if needed)
- [ ] This PR is ready for review and merge

---

## 👀 Reviewer Notes

<!-- Optional: Add any additional context or notes for reviewers -->

> e.g. Please pay extra attention to the token refresh logic.

---

## 👥 Reviewers

<!-- Mention team members you’d like to review this PR -->

cc @team-lead @backend-dev @frontend-dev
