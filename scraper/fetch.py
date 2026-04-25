import requests

# The two JSON endpoints that power the IRCC processing times tool
PROCESSING_TIMES_URL = "https://www.canada.ca/content/dam/ircc/documents/json/data-ptime-en.json"
COUNTRY_NAMES_URL = "https://www.canada.ca/content/dam/ircc/documents/json/data-country-name-en.json"

def fetch_processing_times():
    """
    Fetches the raw processing times JSON from IRCC.
    Returns a dict of visa_type -> {country_code -> processing_time}
    or None if the request fails.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }

    try:
        response = requests.get(PROCESSING_TIMES_URL, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Fetched processing times. Found {len(data)} visa categories.")
        return data

    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return None

    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return None

    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP error: {e}")
        return None


def fetch_country_names():
    """
    Fetches the country code -> country name mapping.
    Returns a dict like {"AF": "Afghanistan", "AL": "Albania", ...}
    or None if the request fails.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    }

    try:
        response = requests.get(COUNTRY_NAMES_URL, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Fetched country names. Found {len(data)} countries.")
        return data

    except Exception as e:
        print(f"❌ Error fetching country names: {e}")
        return None