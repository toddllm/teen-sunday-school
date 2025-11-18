#!/bin/bash
set -e

# Teen Sunday School - AWS & GitHub Setup Script
# This script sets up S3, CloudFront, and GitHub secrets for deployment

echo "🚀 Teen Sunday School - AWS & GitHub Setup"
echo "=========================================="
echo ""

# Configuration
APP_NAME="teen-sunday-school"
AWS_REGION="us-east-1"
BUCKET_NAME="${APP_NAME}-prod"
REPO_OWNER="toddllm"
REPO_NAME="teen-sunday-school"

echo "📋 Configuration:"
echo "   App Name: $APP_NAME"
echo "   AWS Region: $AWS_REGION"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI not found. Install: brew install awscli"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "❌ GitHub CLI not found. Install: brew install gh"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq not found. Install: brew install jq"; exit 1; }

# Verify AWS credentials
echo "🔐 Verifying AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo "✅ AWS Account: $AWS_ACCOUNT_ID"

# Verify GitHub authentication
echo "🔐 Verifying GitHub authentication..."
gh auth status >/dev/null 2>&1 || { echo "❌ GitHub CLI not authenticated. Run: gh auth login"; exit 1; }
echo "✅ GitHub authenticated"
echo ""

# Step 1: Create S3 Bucket
echo "📦 Step 1: Creating S3 bucket..."
if aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
    echo "⚠️  Bucket $BUCKET_NAME already exists"
else
    aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
    echo "✅ Bucket created: $BUCKET_NAME"
fi

# Step 2: Configure bucket for static website hosting
echo "🌐 Step 2: Enabling static website hosting..."
aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html
echo "✅ Static website hosting enabled"

# Step 3: Set bucket policy for public access
echo "🔓 Step 3: Setting bucket policy for public read..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    }
  ]
}
EOF

# Disable block public access
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Apply bucket policy
aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file:///tmp/bucket-policy.json

echo "✅ Bucket policy applied"

# Step 4: Create CloudFront distribution
echo "☁️  Step 4: Creating CloudFront distribution..."
echo "   (This may take a few minutes...)"

# Check if distribution already exists
EXISTING_DIST=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='${APP_NAME}'].Id" --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_DIST" ]; then
    echo "⚠️  CloudFront distribution already exists: $EXISTING_DIST"
    DISTRIBUTION_ID="$EXISTING_DIST"
else
    # Create distribution config
    cat > /tmp/cf-config.json << EOF
{
  "CallerReference": "${APP_NAME}-$(date +%s)",
  "Comment": "${APP_NAME}",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-${BUCKET_NAME}",
        "DomainName": "${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-${BUCKET_NAME}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": { "Forward": "none" }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true
}
EOF

    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cf-config.json \
        --query 'Distribution.Id' \
        --output text)

    echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"
fi

# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.DomainName' --output text)
echo "✅ CloudFront URL: https://$CLOUDFRONT_DOMAIN"

# Step 5: Get AWS credentials for GitHub
echo "🔑 Step 5: Preparing AWS credentials..."
echo ""
echo "⚠️  We need AWS credentials for GitHub Actions."
echo "   Do you want to:"
echo "   1) Use current AWS credentials (if using IAM user)"
echo "   2) Create a new IAM user for deployments (recommended)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "2" ]; then
    echo "👤 Creating IAM user: ${APP_NAME}-deployer..."

    # Create IAM user
    aws iam create-user --user-name "${APP_NAME}-deployer" 2>/dev/null || echo "User may already exist"

    # Create and attach policy
    cat > /tmp/deploy-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::${BUCKET_NAME}",
        "arn:aws:s3:::${BUCKET_NAME}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::${AWS_ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}"
    }
  ]
}
EOF

    POLICY_ARN=$(aws iam create-policy \
        --policy-name "${APP_NAME}-deploy-policy" \
        --policy-document file:///tmp/deploy-policy.json \
        --query 'Policy.Arn' \
        --output text 2>/dev/null || \
        aws iam list-policies --query "Policies[?PolicyName=='${APP_NAME}-deploy-policy'].Arn" --output text)

    aws iam attach-user-policy \
        --user-name "${APP_NAME}-deployer" \
        --policy-arn "$POLICY_ARN"

    # Create access key
    echo "🔐 Creating access key..."
    ACCESS_KEY_JSON=$(aws iam create-access-key --user-name "${APP_NAME}-deployer")
    AWS_ACCESS_KEY_ID=$(echo "$ACCESS_KEY_JSON" | jq -r '.AccessKey.AccessKeyId')
    AWS_SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_JSON" | jq -r '.AccessKey.SecretAccessKey')

    echo "✅ IAM user created: ${APP_NAME}-deployer"
    echo "✅ Access key created"
else
    echo "⚠️  Using current AWS credentials"
    echo "   Please enter your AWS credentials:"
    read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -sp "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo ""
fi

# Step 6: Set GitHub secrets
echo ""
echo "🔒 Step 6: Setting GitHub secrets..."

gh secret set AWS_ACCESS_KEY_ID --body "$AWS_ACCESS_KEY_ID" --repo "$REPO_OWNER/$REPO_NAME"
echo "✅ Set AWS_ACCESS_KEY_ID"

gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY" --repo "$REPO_OWNER/$REPO_NAME"
echo "✅ Set AWS_SECRET_ACCESS_KEY"

# Step 7: Update deploy.yml
echo "📝 Step 7: Updating deploy.yml with actual values..."

sed -i.bak "s/S3_BUCKET: teen-sunday-school-PLACEHOLDER.*/S3_BUCKET: $BUCKET_NAME/" .github/workflows/deploy.yml
sed -i.bak "s/CLOUDFRONT_DISTRIBUTION_ID: PLACEHOLDER.*/CLOUDFRONT_DISTRIBUTION_ID: $DISTRIBUTION_ID/" .github/workflows/deploy.yml
sed -i.bak "s|https://PLACEHOLDER.cloudfront.net|https://$CLOUDFRONT_DOMAIN|" .github/workflows/deploy.yml

rm .github/workflows/deploy.yml.bak

echo "✅ Updated deploy.yml"

# Commit changes
git add .github/workflows/deploy.yml
git commit -m "Configure AWS deployment settings

- S3 Bucket: $BUCKET_NAME
- CloudFront ID: $DISTRIBUTION_ID
- Region: $AWS_REGION" || echo "No changes to commit"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "S3 Bucket:        $BUCKET_NAME"
echo "CloudFront ID:    $DISTRIBUTION_ID"
echo "CloudFront URL:   https://$CLOUDFRONT_DOMAIN"
echo "AWS Region:       $AWS_REGION"
echo "GitHub Secrets:   ✅ AWS_ACCESS_KEY_ID"
echo "                  ✅ AWS_SECRET_ACCESS_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next steps:"
echo "1. Push changes: git push origin main"
echo "2. Create a feature branch to test:"
echo "   git checkout -b feature/test-deployment"
echo "   git push origin feature/test-deployment"
echo ""
echo "3. The workflows will automatically:"
echo "   - Create a PR"
echo "   - Validate the code"
echo "   - Merge to main"
echo "   - Deploy to: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "⏱️  Note: CloudFront distribution may take 15-20 minutes to fully deploy"
echo ""

# Cleanup temp files
rm -f /tmp/bucket-policy.json /tmp/cf-config.json /tmp/deploy-policy.json
