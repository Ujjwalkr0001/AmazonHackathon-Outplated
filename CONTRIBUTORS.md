# Contributors

Thanks goes to these wonderful people who have contributed to the **AI Codebase Doctor** project!

---

## ✨ Core Contributors

| Avatar | Name | GitHub | Role | Contributions |
| :---: | :---: | :---: | :---: | --- |
| <img src="https://avatars.githubusercontent.com/ujjwalkr0001" width="80" alt="Ujjwalkr0001" /> | **Ujjwal Kumar** | [@Ujjwalkr0001](https://github.com/Ujjwalkr0001) | Project Lead / Creator | Architecture, Backend services (AWS S3/DynamoDB/CloudWatch), Demo vulnerability repos, Deployment scripts, Generated patches |
| <img src="https://api.dicebear.com/7.x/bottts/svg?seed=trae-ai-assistant&backgroundColor=6366f1" width="80" alt="Trae AI Assistant" /> | **Trae AI Assistant** | [@trae-ai](https://github.com/) | Automated Contributor / Code Reviewer | Incremental commit strategy, AWS service layer TDD, PR orchestration, Deployment README documentation |

---

## 🛡️ Contributions Breakdown

### @Ujjwalkr0001
- 🏗️ Project architecture & initial scaffolding
- 🌩️ `backend/src/services/aws.ts` — Full S3 + DynamoDB + CloudWatch integration
- 🐍 `demo-repos/insecure-python-app/` — Intentional Flask security flaws for demo
- 🟢 `demo-repos/vulnerable-node-api/` — Node/Express vulnerabilities (SQLi, JWT, N+1)
- 🚀 `Deployment/` scripts: `deploy_aws.sh`, `deploy_aws.bat`, deployment guide
- 🔧 Generated unified-diff patches: SEC-001–004, DEP-001

### @trae-ai (Automated)
- 📝 Semantic, granular commit strategy (25+ commits)
- ✅ TDD-style incremental build of `AwsDoctorService` (10 atomic commits)
- 📚 `Deployment/README.md` — Full AWS SAM deployment guide
- 🔁 Pull-Request workflow orchestration & branch management

---

## 🤝 Want to contribute?

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request to `main` 🚀

---

*This CONTRIBUTORS file is auto-maintained. Last updated: 2026-09-20*
