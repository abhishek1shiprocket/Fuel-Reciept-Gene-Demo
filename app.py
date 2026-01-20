from flask import Flask, render_template, jsonify, request
from datetime import datetime, date as date_cls
import calendar
import random
from typing import List, Tuple

import requests

app = Flask(__name__)

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/generate-receipt', methods=['POST'])
def generate_receipt():
    """API endpoint to generate receipt data"""
    data = request.json
    
    # Add current date/time if not provided
    if not data.get('date'):
        data['date'] = datetime.now().strftime('%Y-%m-%d %H:%M')
    
    return jsonify(data)


@app.route('/api/generate-yearly-receipts', methods=['POST'])
def generate_yearly_receipts():
    """
    Generate randomized fuel receipts for a financial year (April–March).

    Request JSON:
    {
        "year": 2026,  # financial year ending year (Apr 2025–Mar 2026)
        "monthly_cap": 25000,
        "min_amount": 3000,
        "max_amount": 7000,
        "location": "delhi",
        "fuel_api_key": "<your-api-key>",
        "telNo": "0123456789",
        "vehNo": "DL01AB1234",
        "customerName": "John Doe"
    }
    """
    payload = request.json or {}

    year = int(payload.get("year", datetime.now().year))
    monthly_cap = float(payload.get("monthly_cap", 25000))
    min_amount = float(payload.get("min_amount", 3000))
    max_amount = float(payload.get("max_amount", 7000))
    location = (payload.get("location") or "delhi").strip() or "delhi"
    fuel_api_key = (payload.get("fuel_api_key") or "").strip()
    tel_no = (payload.get("telNo") or "1503339").strip()
    veh_no = (payload.get("vehNo") or "").strip()
    customer_name = (payload.get("customerName") or "").strip()

    # Basic validation and normalisation
    if min_amount <= 0 or max_amount <= 0 or max_amount < min_amount:
        return jsonify({"error": "Invalid min/max amount range"}), 400

    if monthly_cap <= 0:
        return jsonify({"error": "Monthly cap must be positive"}), 400

    if not fuel_api_key:
        return jsonify({"error": "fuel_api_key is required"}), 400

    # Fetch historical daily fuel prices from external API.
    # If anything goes wrong, fall back to a constant default rate so that
    # receipt generation still works instead of returning 502.
    default_rate = 94.72
    daily_prices: List[Tuple[date_cls, float]] = []
    try:
        resp = requests.get(
            "https://fuel.indianapi.in/historical_fuel_price",
            params={"location": location, "n": 400},
            headers={"X-Api-Key": fuel_api_key},
            timeout=15,
        )
        if resp.status_code == 200:
            prices_data = resp.json()
            if isinstance(prices_data, list):
                for item in prices_data:
                    try:
                        d_str = str(item.get("date", ""))[:10]
                        if not d_str:
                            continue
                        d_obj = datetime.strptime(d_str, "%Y-%m-%d").date()
                    except Exception:
                        continue

                    name = str(item.get("name", "")).lower()
                    # Prefer Petrol entries; if name is empty we still allow it
                    if "petrol" not in name and name:
                        continue

                    try:
                        price_val = float(item.get("price"))
                    except (TypeError, ValueError):
                        continue

                    if price_val <= 0:
                        continue

                    daily_prices.append((d_obj, price_val))
            else:
                print("Fuel API response was not a list; using default rate.")
        else:
            print(f"Fuel API returned status {resp.status_code}; using default rate.")
    except Exception as exc:
        print(f"Error calling fuel price API: {exc}. Using default rate.")

    if not daily_prices:
        # Fallback: single default entry so lookups still work
        daily_prices.append((date_cls(year - 1, 4, 1), default_rate))
    else:
        daily_prices.sort(key=lambda x: x[0])

    def get_rate_for_date(target: date_cls) -> float:
        """Return the latest known price on or before the target date."""
        # Iterate from the end for simplicity; list is small (<=400)
        for d, price in reversed(daily_prices):
            if d <= target:
                return price
        # Fallback to earliest known price if nothing before
        return daily_prices[0][1]

    # Example pool of fuel stations with addresses
    stations = [
        {
            "name": "Rajasthan Rajpath Filling Station",
            "address": "Lock No 349, NH 8, Samalkha, New Delhi - 110037",
        },
        {
            "name": "IndianOil Smart Fuel Station",
            "address": "Plot 21, Ring Road, Sector 18, Gurgaon - 122015",
        },
        {
            "name": "Highway Service Station",
            "address": "NH 48, Near Toll Plaza, Manesar, Haryana - 122051",
        },
        {
            "name": "City Point Fuel Centre",
            "address": "23 MG Road, Connaught Place, New Delhi - 110001",
        },
        {
            "name": "Metro Petro Pump",
            "address": "Plot 5, Outer Ring Road, Rohini, New Delhi - 110085",
        },
    ]

    all_receipts = []

    # Financial year: April (year-1) to March (year)
    start_year = year - 1
    financial_months = [(start_year, m) for m in range(4, 13)] + [
        (year, m) for m in range(1, 4)
    ]

    for y, month in financial_months:
        month_receipts = []
        month_total = 0.0

        # Get a valid day range for the month
        _, last_day = calendar.monthrange(y, month)

        # Keep generating random receipts until we are close to the cap
        # Ensure at least one receipt if min_amount <= monthly_cap
        safety_counter = 0
        while month_total + min_amount <= monthly_cap and safety_counter < 100:
            safety_counter += 1

            # Random amount in rupees, including random paise
            amount = random.uniform(min_amount, max_amount)

            # Do not exceed cap
            if month_total + amount > monthly_cap:
                # If remaining is still >= min_amount, clamp amount to remaining; else stop
                remaining = monthly_cap - month_total
                if remaining < min_amount:
                    break
                amount = remaining

            amount = round(amount, 2)

            # Random date and time in this month
            day = random.randint(1, last_day)
            hour = random.randint(0, 23)
            minute = random.randint(0, 59)
            dt_obj = datetime(y, month, day, hour, minute)
            date_str = dt_obj.strftime("%Y-%m-%d %H:%M")

            # Fuel price for that day
            rate = float(get_rate_for_date(dt_obj.date()))

            # Random station
            station = random.choice(stations)

            # Calculate volume from rate
            volume_ltr = 0.0
            if rate > 0:
                volume_ltr = round(amount / rate, 2)

            receipt = {
                "year": y,
                "month": month,
                "date": date_str,
                "stationName": station["name"],
                "address": station["address"],
                "telNo": tel_no,
                "receiptNo": str(random.randint(100000, 999999)),
                "fccId": "",
                "fipNo": "",
                "nozzleNo": "",
                "product": "Petrol",
                "ratePerLtr": f"{rate:.2f}",
                "amount": f"{amount:.2f}",
                "volume": f"{volume_ltr:.2f}L",
                "vehType": "Petrol",
                "vehNo": veh_no,
                "customerName": customer_name,
                "mode": "Cash",
                "lstNo": "",
                "vatNo": "",
                "attendantId": "not available",
            }

            month_receipts.append(receipt)
            month_total += amount

        all_receipts.extend(month_receipts)

    return jsonify(
        {
            "financial_year_end": year,
            "financial_year_start": start_year,
            "monthly_cap": monthly_cap,
            "receipts": all_receipts,
        }
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
