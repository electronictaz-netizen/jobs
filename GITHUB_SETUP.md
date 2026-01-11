# GitHub Setup Instructions

Follow these steps to upload your project to GitHub.

## Prerequisites

Make sure Git is installed on your system:
- Download Git for Windows: https://git-scm.com/download/win
- After installation, restart your terminal/PowerShell

## Step 1: Initialize Git Repository

Open PowerShell in your project directory (`C:\Users\ericd\app`) and run:

```powershell
cd C:\Users\ericd\app
git init
```

## Step 2: Add All Files

```powershell
git add .
```

## Step 3: Create Initial Commit

```powershell
git commit -m "Initial commit: Aircrew Transportation Management System"
```

If this is your first time using Git, you may need to set your identity:
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Then try the commit again.

## Step 4: Create Repository on GitHub

1. Go to https://github.com/new
2. Create a new repository (e.g., "aircrew-transportation-system")
3. **DO NOT** initialize it with a README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 5: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands:

```powershell
# Replace <your-username> and <repo-name> with your actual values
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

For example, if your username is `john` and repo name is `aircrew-transportation-system`:
```powershell
git remote add origin https://github.com/john/aircrew-transportation-system.git
git branch -M main
git push -u origin main
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```powershell
gh repo create aircrew-transportation-system --public --source=. --remote=origin --push
```

## Troubleshooting

### Git is not recognized
- Install Git for Windows: https://git-scm.com/download/win
- Restart your terminal after installation
- Or use Git Bash instead of PowerShell

### Authentication Issues
If you're prompted for credentials:
- For HTTPS: Use a Personal Access Token instead of password
  - Go to GitHub Settings > Developer settings > Personal access tokens
  - Generate a new token with `repo` scope
- For SSH: Set up SSH keys with GitHub

### Large Files
If you encounter issues with large files in `node_modules`:
- Make sure `.gitignore` is properly configured (it should exclude `node_modules/`)
- Run `git status` to verify which files will be committed

## Quick Command Summary

```powershell
cd C:\Users\ericd\app
git init
git add .
git commit -m "Initial commit: Aircrew Transportation Management System"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.