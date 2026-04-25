from datetime import date

VISA_CATEGORY_NAMES = {
    'visitor-outside-canada': 'Visitor Visa (Outside Canada)',
    'supervisa':              'Super Visa (Parents & Grandparents)',
    'study':                  'Study Permit',
    'work':                   'Work Permit',
    'child_dependent':        'Dependent Child',
    'child_adopted':          'Adopted Child',
    'refugees_gov':           'Government-Assisted Refugees',
    'refugees_private':       'Privately Sponsored Refugees',
}

VISA_CATEGORIES = {
    'visitor-outside-canada': 'Temporary Residence',
    'supervisa':              'Temporary Residence',
    'study':                  'Temporary Residence',
    'work':                   'Temporary Residence',
    'child_dependent':        'Permanent Residence',
    'child_adopted':          'Permanent Residence',
    'refugees_gov':           'Permanent Residence',
    'refugees_private':       'Permanent Residence',
}


def parse_processing_days(time_string):
    """
    Converts a time string into an integer number of days.
    Handles multiple formats:
        "37 days"  -> 37
        "1 day"    -> 1
        "1 week"   -> 7
        "2 weeks"  -> 14
        "1 month"  -> 30
        "No processing time available" -> None
        "Not enough data" -> None
    """
    if not time_string:
        return None

    # Lowercase for easy comparison
    s = time_string.strip().lower()

    # Skip unavailable values
    if any(phrase in s for phrase in ['no processing', 'not enough', 'n/a']):
        return None

    try:
        parts = s.split()
        number = int(parts[0])
        unit = parts[1] if len(parts) > 1 else 'days'

        if 'week' in unit:
            return number * 7
        elif 'month' in unit:
            return number * 30
        else:
            # Default: treat as days
            return number

    except (ValueError, IndexError):
        return None


def flatten_country_data(visa_code, country_data):
    """
    Handles both flat and nested structures.

    Flat:   {"IN": "56 days", "CA": "10 days"}
    Nested: {"IN": {"sponsor": "10 days", "refugee": "5 days"}}

    For nested, we average the sub-values into one number.
    Returns a flat dict: {country_code: days_int_or_none}
    """
    flat = {}

    for country_code, value in country_data.items():

        if isinstance(value, str):
            # Simple case - just a string like "37 days"
            flat[country_code] = parse_processing_days(value)

        elif isinstance(value, dict):
            # Nested case like refugees_private
            # Average all valid sub-values
            sub_days = []
            for sub_value in value.values():
                days = parse_processing_days(sub_value)
                if days is not None:
                    sub_days.append(days)

            flat[country_code] = int(sum(sub_days) / len(sub_days)) if sub_days else None

    return flat


def parse_processing_times(raw_data):
    """
    Takes the raw JSON from IRCC and returns a clean list of dicts
    ready to save to the database.
    """
    results = []
    today = date.today()

    for visa_code, country_data in raw_data.items():

        if visa_code not in VISA_CATEGORY_NAMES:
            print(f"⚠️  Unknown visa code skipped: {visa_code}")
            continue

        visa_name = VISA_CATEGORY_NAMES[visa_code]
        category  = VISA_CATEGORIES[visa_code]

        # Flatten nested structures into simple {country_code: days}
        flat_data = flatten_country_data(visa_code, country_data)

        for country_code, days in flat_data.items():

            if days is None:
                continue

            results.append({
                'visa_code':       visa_code,
                'visa_name':       visa_name,
                'category':        category,
                'country_code':    country_code,
                'processing_days': days,
                'scraped_date':    today,
            })

    print(f"✅ Parsed {len(results)} valid processing time records.")
    return results