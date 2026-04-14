# Contributing to SmartHire AI

Thank you for your interest in contributing to SmartHire AI! 🎉

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a new branch** for your feature: `git checkout -b feature/your-feature-name`
4. **Make changes** following the project structure
5. **Test** your changes thoroughly
6. **Commit** with clear messages: `git commit -m "Add feature: description"`
7. **Push** to your fork: `git push origin feature/your-feature-name`
8. **Create a Pull Request** against the main repository

## Development Setup

### Backend Development
```bash
cd server
cp .env.example .env
# Fill in your MongoDB URI and API keys
npm install
npm run dev
```

### Frontend Development
```bash
cd client
npm install
npm run dev
```

## Code Standards

- Use **ESLint** configuration provided
- Write meaningful commit messages
- Keep components small and focused
- Add comments for complex logic
- Follow existing code style

## Testing

Before submitting a PR:

1. Test all features locally
2. Check for console errors/warnings
3. Verify environment variables are properly configured
4. Test both frontend and backend

## Reporting Issues

- Use **GitHub Issues** for bug reports
- Provide clear reproduction steps
- Include screenshots/logs if applicable
- Mention your environment (OS, Node version, etc.)

## Feature Requests

- Create an issue with the label `enhancement`
- Describe the feature and its benefits
- Examples/use cases are appreciated

## Questions?

Feel free to open a discussion or issue. We're here to help! 😊

---

Happy Contributing! 🚀
