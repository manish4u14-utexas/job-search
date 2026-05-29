#!/bin/bash

echo "🧹 Cleaning up project..."

# Delete old documentation files
echo "Removing old documentation..."
rm -f CACHE_FIX.md DATABASE_FIXED.md DEBUG_PROFILE.md DEBUG_RATE_LIMIT.md
rm -f DEDUPLICATION_FIX.md DEDUPLICATION_IMPROVED.md FILE_UPLOAD_FIX.md
rm -f FIXED_AND_WORKING.md GROQ_COMPATIBILITY_FIX.md GROQ_FIX.md LLM_FIX.md
rm -f PROFILE_FIX_EXPLAINED.md SCHEMA_FIXED.md SETTINGS_UI_FIX.md SETUP_COMPLETE.md

rm -f AI_MATCHING_IMPLEMENTED.md ENHANCED_FEATURES.md FEATURES_COMPLETE.md
rm -f FINAL_FEATURES.md FINAL_STATUS.md IMPLEMENTATION_GUIDE.md
rm -f IMPLEMENTATION_SUMMARY.md JOBS_LIMIT_FEATURE_COMPLETE.md
rm -f MANUAL_REFRESH_FEATURE.md MULTI_LLM_FEATURE.md

rm -f JOBSPY_SETUP.md JOBSPY_WORKING.md JSEARCH_SETUP_GUIDE.md JSEARCH_WORKING.md
rm -f LINKEDIN_INTEGRATION_OPTIONS.md LINKEDIN_JOB_FEED_READY.md
rm -f LINKEDIN_JOBSPY_FREE.md LINKEDIN_SETUP_INSTRUCTIONS.md RAPIDAPI_CONFIG_HELP.md

rm -f QUICK_START.md QUICK_TEST.md QUICK_WORKAROUND.md START_HERE.md
rm -f TEST_NOW.md TROUBLESHOOTING_UPLOAD.md JOB_SCRAPING_GUIDE.md
rm -f CURRENT_STATUS.md PROJECT_SUMMARY.md USER_GUIDE.md
rm -f ERROR_HANDLING_FEATURE.md RATE_LIMIT_GUIDE.md RATE_LIMIT_UI_FIX.md
rm -f TAILOR_RESUME_FEATURE.md VISA_SPONSORSHIP_FEATURE.md

# Delete temporary files
echo "Removing temporary files..."
rm -f vite.config.ts.bak test-features.ts init-db.ts .gitkeep
rm -f template.json todo.md WHATS_NEW.md CLEANUP_GUIDE.md

# Delete development database
echo "Removing development database..."
rm -f dev.db

# Delete build artifacts
echo "Removing build artifacts..."
rm -rf dist/

# Delete logs
echo "Removing logs..."
rm -rf .manus-logs/

echo "✅ Cleanup complete!"
echo ""
echo "📋 Remaining documentation:"
echo "  ✅ README.md - Main documentation"
echo "  ✅ DEPLOY_NOW.md - Quick deployment guide"
echo "  ✅ DEPLOYMENT_GUIDE.md - Detailed deployment"
echo "  ✅ DEPLOYMENT_OPTIONS_EXPLAINED.md - Platform comparison"
echo "  ✅ CUSTOM_DOMAIN_SETUP.md - Domain setup"
echo "  ✅ RAILWAY_PRICING_EXPLAINED.md - Pricing info"
echo "  ✅ DAILY_WORKFLOW.md - Usage guide"
echo "  ✅ READY_TO_USE.md - Feature overview"
echo "  ✅ JOB_TRACKING_FEATURE.md - Tracking docs"
echo "  ✅ RATE_LIMIT_COMPLETE_FIX.md - Error handling"
echo ""
echo "🚀 Ready to push to GitHub!"
