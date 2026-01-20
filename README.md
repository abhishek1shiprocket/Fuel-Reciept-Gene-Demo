# Fuel Receipt Generator

A web-based fuel receipt generator that allows you to create and customize fuel receipts similar to IndianOil thermal printer receipts. Built with Python (Flask) and vanilla JavaScript.

## Features

- **Editable Form**: Input all receipt details including station information, transaction details, vehicle information, and payment mode
- **Live Preview**: See the receipt update in real-time as you type
- **Auto-calculation**: Automatically calculates volume when you enter amount and rate
- **Print Support**: Print the receipt directly from the browser
- **Responsive Design**: Works on desktop and mobile devices
- **Thermal Printer Style**: Styled to look like a real thermal printer receipt

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd /opt/homebrew/var/www/fuel-recipt-generator
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

3. **Fill in the receipt details:**
   - Station name and address
   - Transaction details (receipt number, tel no, etc.)
   - Product information (rate, amount, volume)
   - Vehicle and customer information
   - Date, time, and payment mode

4. **Generate and Print:**
   - Click "Generate Receipt" to update the preview
   - Click "Print Receipt" to print the receipt
   - Use "Clear All" to reset all fields

## Features in Detail

### Auto-calculation
When you enter the amount and rate per liter, the volume is automatically calculated and displayed.

### Real-time Preview
The receipt preview updates automatically as you type in any field, so you can see changes immediately.

### Print Functionality
The print button opens the browser's print dialog. The receipt is optimized for printing with proper page breaks and styling.

## Project Structure

```
fuel-recipt-generator/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── style.css         # CSS styling
    └── script.js         # JavaScript functionality
```

## Customization

You can customize the receipt by:
- Modifying the CSS in `static/style.css` to change colors, fonts, or layout
- Updating the HTML template in `templates/index.html` to add/remove fields
- Adjusting the JavaScript in `static/script.js` to change behavior or add features

## Technologies Used

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with thermal printer receipt styling

## License

This project is open source and available for personal and commercial use.

## Notes

- The receipt is styled to match IndianOil thermal printer receipts
- All calculations are done client-side for fast performance
- The receipt can be printed directly from the browser
- Form data is validated on the client side
