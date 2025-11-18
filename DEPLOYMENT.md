# Teen Sunday School - Deployment Guide

## 🎯 Quick Start

The repository now has the same auto-merge and AWS deployment setup as captain-arcsis.

### ⚡ What's Automated

1. **Feature Branch → Auto PR**: Push to `claude/**`, `feature/**`, `fix/**`, `refactor/**` creates a PR automatically
2. **PR Validation**: Runs code checks, builds React app, validates structure
3. **Auto-Merge**: PRs that pass validation merge automatically to main
4. **Auto-Deploy**: Merged PRs trigger build and deployment to AWS

## 🔐 Required Secrets

Configure these in GitHub repository settings (`Settings` > `Secrets and variables` > `Actions`):

### 1. PAT_TOKEN (Required for Auto-PR)
```
Name: PAT_TOKEN
Value: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Create at**: https://github.com/settings/tokens
- Scope needed: `repo`, `workflow`
- Expiration: 1 year recommended

### 2. AWS_ACCESS_KEY_ID (Required for Deployment)
```
Name: AWS_ACCESS_KEY_ID
Value: AKIAIOSFODNN7EXAMPLE
```

### 3. AWS_SECRET_ACCESS_KEY (Required for Deployment)
```
Name: AWS_SECRET_ACCESS_KEY
Value: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## 📦 AWS Setup (Before Deployment)

### 1. Create S3 Bucket
```bash
aws s3 mb s3://teen-sunday-school-prod --region us-east-1
```

### 2. Enable Static Website Hosting
```bash
aws s3 website s3://teen-sunday-school-prod \
  --index-document index.html \
  --error-document index.html
```

### 3. Set Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::teen-sunday-school-prod/*"
  }]
}
```

### 4. Create CloudFront Distribution
```bash
aws cloudfront create-distribution \
  --origin-domain-name teen-sunday-school-prod.s3.amazonaws.com \
  --default-root-object index.html
```

Save the **Distribution ID** (e.g., `E1234567890ABC`)

### 5. Update Workflow Configuration
Edit `.github/workflows/deploy.yml`:

```yaml
env:
  S3_BUCKET: teen-sunday-school-prod  # ← Your bucket name
  CLOUDFRONT_DISTRIBUTION_ID: E1234567890ABC  # ← Your distribution ID
```

## 🚀 Usage

### Create a Feature
```bash
git checkout -b feature/add-bible-project-integration
# Make changes...
git add .
git commit -m "Add Bible Project API integration"
git push origin feature/add-bible-project-integration
```

**What happens automatically**:
1. ✅ Auto-PR creates PR #123
2. ✅ PR Check validates code
3. ✅ Auto-Merge merges to main
4. ✅ Deploy builds and pushes to AWS
5. 🌐 Live at CloudFront URL

### Manual Deployment
Go to: https://github.com/toddllm/teen-sunday-school/actions/workflows/deploy.yml
- Click "Run workflow"
- Select branch: `main`
- Click "Run workflow"

## 📊 Workflow Status

| Workflow | Status |
|----------|--------|
| Auto Create PR | Triggers on feature branches |
| PR Check | Validates on all PRs |
| Auto Merge | Merges passing PRs |
| Deploy to AWS | Deploys from main |

## 🔍 Monitoring

- **GitHub Actions**: https://github.com/toddllm/teen-sunday-school/actions
- **S3 Bucket**: AWS Console > S3 > teen-sunday-school-prod
- **CloudFront**: AWS Console > CloudFront > Your Distribution

## 💰 Estimated AWS Costs

- S3 Storage: ~$0.023/GB/month
- CloudFront Transfer: ~$0.085/GB (first 10TB)
- **Total**: $1-5/month for typical traffic

## ⚙️ Configuration Files

```
teen-sunday-school/
├── .github/
│   ├── SETUP.md           ← Detailed setup instructions
│   └── workflows/
│       ├── auto-pr.yml     ← Auto-create PRs
│       ├── pr-check.yml    ← Validate PRs
│       ├── auto-merge.yml  ← Auto-merge passing PRs
│       └── deploy.yml      ← Deploy to AWS
└── DEPLOYMENT.md          ← This file
```

## 🐛 Troubleshooting

### PAT Token Not Working
```bash
# Check token has correct scopes
gh auth status
```

### Deployment Fails
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check S3 bucket exists
aws s3 ls s3://teen-sunday-school-prod
```

### Auto-Merge Not Triggering
- Ensure PR Check workflow completed successfully
- Check branch protection rules don't conflict
- Verify GITHUB_TOKEN permissions

## 📚 Next Steps

1. ✅ Create PAT_TOKEN (Required)
2. ✅ Add AWS credentials
3. ✅ Set up S3 bucket and CloudFront
4. ✅ Update deploy.yml with bucket/distribution info
5. ✅ Test with a feature branch
6. ✅ Deploy to production

## 🔗 Resources

- Setup Guide: `.github/SETUP.md`
- Repository: https://github.com/toddllm/teen-sunday-school
- Based on: captain-arcsis deployment patterns
