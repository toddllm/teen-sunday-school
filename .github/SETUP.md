# GitHub Actions & AWS Deployment Setup

This repository includes automated workflows for PR management and AWS deployment.

## Required GitHub Secrets

Configure these secrets in your repository settings (`Settings` > `Secrets and variables` > `Actions`):

### 1. PAT_TOKEN (Personal Access Token)
**Purpose**: Used by auto-PR workflow to create and manage pull requests

**How to create**:
1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: `teen-sunday-school-auto-pr`
4. Set expiration (recommend: 1 year)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click "Generate token"
7. Copy the token
8. Add to repository: Settings > Secrets > New repository secret
   - Name: `PAT_TOKEN`
   - Value: (paste your token)

### 2. AWS_ACCESS_KEY_ID
**Purpose**: AWS credentials for S3/CloudFront deployment

**How to create**:
1. Log into AWS Console
2. Go to IAM > Users
3. Create new user (or use existing): `teen-sunday-school-deployer`
4. Attach policy: `AmazonS3FullAccess` and `CloudFrontFullAccess`
5. Create access key (Application running outside AWS)
6. Copy the Access Key ID
7. Add to repository secrets as `AWS_ACCESS_KEY_ID`

### 3. AWS_SECRET_ACCESS_KEY
**Purpose**: AWS credentials (secret key)

**How to get**:
- When you create the access key, AWS shows the secret key once
- Copy it immediately
- Add to repository secrets as `AWS_SECRET_ACCESS_KEY`

## AWS Infrastructure Setup

### S3 Bucket Configuration
1. Create S3 bucket (e.g., `teen-sunday-school-prod`)
2. Enable static website hosting
3. Set index document: `index.html`
4. Set error document: `index.html` (for React Router)
5. Update bucket policy for public read:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::teen-sunday-school-prod/*"
    }
  ]
}
```

### CloudFront Distribution
1. Create CloudFront distribution
2. Origin: Your S3 bucket endpoint
3. Default root object: `index.html`
4. Error pages: Add custom error response
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200
   - TTL: 0
5. Copy the Distribution ID
6. Copy the CloudFront domain name

### Update Workflow Configuration
Edit `.github/workflows/deploy.yml`:

```yaml
env:
  S3_BUCKET: teen-sunday-school-prod  # Your bucket name
  CLOUDFRONT_DISTRIBUTION_ID: E1234567890ABC  # Your distribution ID
```

## Workflows Overview

### 1. Auto Create PR (`auto-pr.yml`)
- **Triggers**: Push to `claude/**`, `feature/**`, `fix/**`, `refactor/**` branches
- **What it does**: Automatically creates a PR to main
- **Requires**: `PAT_TOKEN` secret

### 2. PR Check (`pr-check.yml`)
- **Triggers**: Pull request to main
- **What it does**: Validates code, builds React app, checks dependencies
- **Requires**: No secrets (uses GITHUB_TOKEN)

### 3. Auto Merge (`auto-merge.yml`)
- **Triggers**: After PR Check succeeds
- **What it does**: Automatically merges PRs that pass all checks
- **Requires**: No secrets (uses GITHUB_TOKEN)

### 4. Deploy (`deploy.yml`)
- **Triggers**: Push to main (after merge)
- **What it does**: Builds React app and deploys to AWS S3/CloudFront
- **Requires**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## Usage Examples

### Creating a Feature
```bash
git checkout -b feature/add-game-component
# Make your changes
git add .
git commit -m "Add word scramble game component"
git push origin feature/add-game-component
```

**What happens**:
1. Auto-PR workflow creates a PR to main
2. PR Check workflow validates the code
3. If checks pass, Auto Merge merges the PR
4. Deploy workflow builds and deploys to AWS

### Manual Deployment
You can manually trigger deployment:
1. Go to Actions tab
2. Select "Deploy to AWS"
3. Click "Run workflow"
4. Select branch: main
5. Click "Run workflow"

## Troubleshooting

### PAT Token Issues
- Error: "Resource not accessible by integration"
- Solution: Ensure PAT_TOKEN has `repo` and `workflow` scopes

### AWS Deployment Fails
- Check AWS credentials are valid
- Verify IAM user has S3 and CloudFront permissions
- Ensure S3 bucket name and CloudFront ID are correct in deploy.yml

### Auto-merge Not Working
- Ensure branch protection rules don't conflict
- Check that PR Check workflow completed successfully
- Verify GITHUB_TOKEN has required permissions

## Branch Protection (Optional)

For additional safety, configure branch protection for `main`:
1. Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Select: "Validate PR"
   - ❌ Do NOT require review (for auto-merge to work)

## Testing the Workflows

### Test Auto-PR
```bash
git checkout -b claude/test-pr
echo "test" > test.txt
git add test.txt
git commit -m "Test auto-PR workflow"
git push origin claude/test-pr
```

Check Actions tab for "Auto Create PR" workflow.

### Test Deployment (After AWS Setup)
```bash
# Make a small change
git checkout main
echo "# Update" >> README.md
git commit -am "Test deployment"
git push origin main
```

Check Actions tab for "Deploy to AWS" workflow.

## Security Notes

- **Never commit secrets** to the repository
- Rotate PAT tokens regularly (every 6-12 months)
- Use minimal IAM permissions for AWS user
- Monitor CloudWatch for unusual S3/CloudFront activity
- Enable MFA on AWS account

## Cost Optimization

- S3: ~$0.023 per GB stored
- CloudFront: ~$0.085 per GB transferred (first 10 TB)
- Estimated monthly cost for low-traffic site: $1-5
- Use CloudFront caching to reduce S3 requests
- Set proper cache headers (see deploy.yml)
