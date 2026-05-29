#!/opt/homebrew/bin/python3.11
"""
Fetch jobs using JobSpy from Indeed, ZipRecruiter, and LinkedIn
Falls back to mock data if JobSpy is not available
"""

import sys
import json
import math
from datetime import datetime, timedelta

def is_valid_value(value):
    """Check if a value is valid (not NaN, not None, not empty string)"""
    if value is None:
        return False
    if isinstance(value, float) and math.isnan(value):
        return False
    if isinstance(value, str) and value.strip() == '':
        return False
    return True

def fetch_with_jobspy(search_term, location, results_wanted, hours_old, sites=None):
    """Fetch jobs using JobSpy library"""
    try:
        from jobspy import scrape_jobs
        
        # Default to Indeed and ZipRecruiter, optionally add LinkedIn
        if sites is None:
            sites = ["indeed", "zip_recruiter"]
        
        print(f"[JobSpy] Searching for: {search_term} in {location} from {sites}", file=sys.stderr)
        
        # Scrape jobs from specified sites
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            hours_old=hours_old,
            country_indeed='USA'
        )
        
        if jobs_df is None or len(jobs_df) == 0:
            print(f"[JobSpy] No jobs found", file=sys.stderr)
            return []
        
        print(f"[JobSpy] Found {len(jobs_df)} jobs", file=sys.stderr)
        
        # Log available columns for debugging
        if len(jobs_df) > 0:
            print(f"[JobSpy] Available columns: {list(jobs_df.columns)}", file=sys.stderr)
            # Log first job's data for debugging
            first_job = jobs_df.iloc[0]
            print(f"[JobSpy] Sample job data: title={first_job.get('title')}, has_description={is_valid_value(first_job.get('description'))}", file=sys.stderr)
        
        # Convert DataFrame to list of dicts
        jobs = []
        for idx, row in jobs_df.iterrows():
            # Generate a unique ID
            job_url = row.get('job_url_direct') or row.get('job_url', '')
            if not is_valid_value(job_url):
                job_url = ''
            job_id = f"{row.get('site', 'unknown')}-{abs(hash(job_url)) % 1000000000}"
            
            # Get basic fields with validation
            title = row.get('title', 'Unknown Title')
            if not is_valid_value(title):
                title = 'Unknown Title'
                
            company = row.get('company', 'Unknown Company')
            if not is_valid_value(company):
                company = 'Unknown Company'
                
            job_location = row.get('location', location)
            if not is_valid_value(job_location):
                job_location = location
                
            description = row.get('description', '')
            if not is_valid_value(description):
                # Try alternative description fields
                description = row.get('job_description', '') or row.get('desc', '') or ''
                if not is_valid_value(description):
                    print(f"[JobSpy] Warning: No description for job: {title} at {company}", file=sys.stderr)
                    description = f"Job Title: {title}\nCompany: {company}\nLocation: {job_location}\n\nNo detailed description available. Please visit the job URL for more information."
                
            date_posted = row.get('date_posted', '')
            if is_valid_value(date_posted):
                date_posted = str(date_posted)
            else:
                date_posted = datetime.now().strftime('%Y-%m-%d')
                
            site = row.get('site', 'unknown')
            if not is_valid_value(site):
                site = 'unknown'
                
            job_type = row.get('job_type', '')
            if is_valid_value(job_type):
                job_type = str(job_type)
            else:
                job_type = ''
            
            job = {
                "id": job_id,
                "title": title,
                "company": company,
                "location": job_location,
                "description": description,
                "job_url": job_url,
                "date_posted": date_posted,
                "site": site,
                "job_type": job_type,
            }
            
            # Add salary info if available and valid
            min_amount = row.get('min_amount')
            if is_valid_value(min_amount):
                try:
                    job['min_amount'] = float(min_amount)
                except (ValueError, TypeError):
                    pass
                    
            max_amount = row.get('max_amount')
            if is_valid_value(max_amount):
                try:
                    job['max_amount'] = float(max_amount)
                except (ValueError, TypeError):
                    pass
                    
            currency = row.get('currency')
            if is_valid_value(currency):
                job['currency'] = str(currency)
                
            interval = row.get('interval')
            if is_valid_value(interval):
                job['interval'] = str(interval)
                
            jobs.append(job)
        
        return jobs
        
    except ImportError:
        print("[JobSpy] Library not installed", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[JobSpy] Error: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None

def get_mock_jobs(search_term, location, results_wanted):
    """Return mock jobs for testing"""
    mock_jobs = [
        {
            "id": "indeed-mock-1",
            "title": f"{search_term}",
            "company": "Tech Innovations Inc",
            "location": location,
            "description": f"We are seeking an experienced {search_term} to join our dynamic team. This role involves leading product strategy, collaborating with cross-functional teams, and driving innovation.\n\nResponsibilities:\n- Lead product development initiatives\n- Work with engineering and design teams\n- Define product roadmap and strategy\n\nRequirements:\n- 5+ years of experience in product management\n- Strong technical background\n- Excellent communication skills\n- Bachelor's degree in Computer Science or related field\n\nWe offer competitive salary, health benefits, and H1B visa sponsorship for qualified candidates.",
            "job_url": "https://www.indeed.com/viewjob?jk=mock123456",
            "date_posted": "2024-05-26",
            "site": "indeed",
            "job_type": "fulltime",
            "min_amount": 120000,
            "max_amount": 160000,
            "currency": "USD",
            "interval": "yearly"
        },
        {
            "id": "ziprecruiter-mock-2",
            "title": f"Senior {search_term}",
            "company": "AI Solutions Corp",
            "location": location,
            "description": f"Senior {search_term} needed for exciting AI/ML projects. Work with cutting-edge technology and shape the future of our products.\n\nWhat You'll Do:\n- Build and scale AI-powered products\n- Collaborate with data science team\n- Drive product vision and execution\n\nQualifications:\n- 7+ years in product management\n- Experience with AI/ML products\n- Strong analytical skills\n\nBenefits:\n- Competitive compensation\n- Remote work options\n- Professional development\n- Visa sponsorship available (H1B, Green Card)",
            "job_url": "https://www.ziprecruiter.com/c/AI-Solutions/Job/mock-abc123",
            "date_posted": "2024-05-27",
            "site": "zip_recruiter",
            "job_type": "fulltime",
            "min_amount": 140000,
            "max_amount": 180000,
            "currency": "USD",
            "interval": "yearly"
        },
        {
            "id": "indeed-mock-3",
            "title": f"Lead {search_term}",
            "company": "Startup Ventures LLC",
            "location": "Remote",
            "description": f"Join our fast-growing startup as Lead {search_term}. Build products from scratch and work with an amazing team.\n\nKey Responsibilities:\n- Own product strategy end-to-end\n- Build and mentor product team\n- Work directly with founders\n\nRequirements:\n- 8+ years product management experience\n- Startup experience preferred\n- Strong leadership skills\n\nNote: Must have valid U.S. work authorization. We do not offer visa sponsorship at this time.",
            "job_url": "https://www.indeed.com/viewjob?jk=mock789012",
            "date_posted": "2024-05-28",
            "site": "indeed",
            "job_type": "fulltime",
            "min_amount": 150000,
            "max_amount": 200000,
            "currency": "USD",
            "interval": "yearly"
        },
        {
            "id": "ziprecruiter-mock-4",
            "title": f"{search_term} - Cloud Platform",
            "company": "CloudTech Systems",
            "location": location,
            "description": f"We're looking for a talented {search_term} to help build our cloud platform products.\n\nResponsibilities:\n- Define product requirements for cloud services\n- Work with distributed engineering teams\n- Analyze market trends and competition\n\nQualifications:\n- 5+ years in B2B product management\n- Cloud platform experience\n- Technical background required\n\nWe provide H1B sponsorship and support for international candidates.",
            "job_url": "https://www.ziprecruiter.com/c/CloudTech/Job/mock-def456",
            "date_posted": "2024-05-27",
            "site": "zip_recruiter",
            "job_type": "fulltime",
            "min_amount": 130000,
            "max_amount": 170000,
            "currency": "USD",
            "interval": "yearly"
        },
        {
            "id": "indeed-mock-5",
            "title": f"Principal {search_term}",
            "company": "Enterprise Software Inc",
            "location": location,
            "description": f"Principal {search_term} role for enterprise software company. Lead strategic initiatives and drive product excellence.\n\nWhat We're Looking For:\n- 10+ years product management experience\n- Enterprise software background\n- Proven track record of successful launches\n\nCompensation:\n- Base salary $180K-$220K\n- Equity package\n- Full benefits\n- Relocation assistance available\n\nVisa sponsorship considered for exceptional candidates.",
            "job_url": "https://www.indeed.com/viewjob?jk=mock345678",
            "date_posted": "2024-05-26",
            "site": "indeed",
            "job_type": "fulltime",
            "min_amount": 180000,
            "max_amount": 220000,
            "currency": "USD",
            "interval": "yearly"
        }
    ]
    
    return mock_jobs[:results_wanted]

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: fetch-jobs.py <search_term> <location> [results_wanted] [hours_old] [sites]"}))
        sys.exit(1)
    
    search_term = sys.argv[1]
    location = sys.argv[2]
    results_wanted = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    hours_old = int(sys.argv[4]) if len(sys.argv) > 4 else 48
    sites_arg = sys.argv[5] if len(sys.argv) > 5 else None
    
    # Parse sites argument (comma-separated list)
    sites = None
    if sites_arg:
        sites = [s.strip() for s in sites_arg.split(',')]
    
    # Try JobSpy first
    jobs = fetch_with_jobspy(search_term, location, results_wanted, hours_old, sites)
    
    # Fall back to mock data if JobSpy fails or returns no results
    if jobs is None or len(jobs) == 0:
        print(json.dumps({"warning": "Using mock data - JobSpy not available or returned no results"}), file=sys.stderr)
        jobs = get_mock_jobs(search_term, location, results_wanted)
    
    print(json.dumps(jobs))

if __name__ == "__main__":
    main()
