#!/usr/bin/env python3
"""
Fetch jobs using JobSpy from Indeed and ZipRecruiter
"""

import sys
import json
import math
from datetime import datetime

def is_valid_value(value):
    """Check if a value is valid (not NaN, not None, not empty string)"""
    if value is None:
        return False
    if isinstance(value, float) and math.isnan(value):
        return False
    if isinstance(value, str) and value.strip() == '':
        return False
    return True

def fetch_with_jobspy(search_term, location, results_wanted, hours_old, sites=None, country='USA'):
    """Fetch jobs using JobSpy library"""
    try:
        from jobspy import scrape_jobs
        
        if sites is None:
            sites = ["indeed", "zip_recruiter"]
        
        print(f"[JobSpy] Searching for: {search_term} in {location} from {sites} (country: {country})", file=sys.stderr)
        
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            hours_old=hours_old,
            country_indeed=country  # Support India, USA, UK, etc.
        )
        
        if jobs_df is None or len(jobs_df) == 0:
            print(f"[JobSpy] No jobs found", file=sys.stderr)
            return []
        
        print(f"[JobSpy] Found {len(jobs_df)} jobs", file=sys.stderr)
        
        jobs = []
        for idx, row in jobs_df.iterrows():
            job_url = row.get('job_url_direct') or row.get('job_url', '')
            if not is_valid_value(job_url):
                job_url = ''
            job_id = f"{row.get('site', 'unknown')}-{abs(hash(job_url)) % 1000000000}"
            
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
                description = f"Job Title: {title}\nCompany: {company}\nLocation: {job_location}"
                
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
        
    except Exception as e:
        print(f"[JobSpy] Error: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: fetch-jobs.py <search_term> <location> [results_wanted] [hours_old] [sites] [country]"}))
        sys.exit(1)
    
    search_term = sys.argv[1]
    location = sys.argv[2]
    results_wanted = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    hours_old = int(sys.argv[4]) if len(sys.argv) > 4 else 48
    sites_arg = sys.argv[5] if len(sys.argv) > 5 else None
    country = sys.argv[6] if len(sys.argv) > 6 else 'USA'  # Default to USA
    
    sites = None
    if sites_arg:
        sites = [s.strip() for s in sites_arg.split(',')]
    
    jobs = fetch_with_jobspy(search_term, location, results_wanted, hours_old, sites, country)
    print(json.dumps(jobs))

if __name__ == "__main__":
    main()
