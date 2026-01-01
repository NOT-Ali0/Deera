📦 Merchant Mini Program
A modern, high-performance Mini Program built with a focus on simplicity and local usability. This application serves as a product management and shopping platform, featuring a clean user interface and localized features for the Iraqi market.

🚀 Key Features
Svelte 5 Powered: Built using the latest Svelte 5 (Runes) for highly reactive and lightweight UI performance.

18 Governorates Integration: Built-in support for all Iraqi Governorates, allowing sellers to specify their location for better logistics.

Conditional Rendering Navigation: A fast, Single Page Application (SPA) feel using conditional rendering for seamless transitions between Home and Product views.

Localized Pricing: Automatic formatting for Iraqi Dinar (IQD) with thousand separators (e.g., 25,000 د.ع).

Smart Clipboard Integration: Instead of complex external redirects, the app allows users to copy the Google Maps location directly to their clipboard for easy sharing and navigation.

Minimalist UI:

Clean product cards with subtle location labels.

Simplified image navigation within the product details.

Custom manual "Back" navigation for a smooth user flow.

🛠️ Tech Stack
Framework: Svelte 5

Environment: Mini Program Webview

Styling: Modern CSS3 (Flexbox, Grid, and Backdrop-filter effects)

State Management: Svelte Runes ($state, $props)
------------------------------------------------------------------------------
📂 Project Structure
Plaintext

├── src
│   ├── components       # Reusable UI components (ProductCard, Navbar, etc.)
│   ├── pages            # Conditional views (Home, ProductDetail, AddProduct)
│   └── App.svelte       # Main logic, State management & Conditional Router
├── public               # Static assets (Icons, Images)
└── package.json         # Project dependencies


------------------------------------------------------------------------------
📝 Key Logic Implementation
Price Formatting
The app uses a clean utility to ensure all prices are readable and localized:

JavaScript

// Example: 50000 -> 50,000 د.ع
const formatPrice = (amount) => new Intl.NumberFormat('en-US').format(amount) + " د.ع";
Location Handling
Each product is tagged with one of the 18 Iraqi Governorates, displayed clearly under the price to help buyers identify the seller's location instantly.



------------------------------------------------------------------------------
