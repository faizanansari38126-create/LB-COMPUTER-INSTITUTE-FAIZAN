# LB Computer Institute API configuration

## Local Windows testing

Run `START-LB-INSTITUTE.bat` and open:

`http://127.0.0.1:5000/`

The admin login uses the backend automatically on port 5000.

## GitHub Pages

GitHub Pages hosts static frontend files only. A real Node.js/Express backend must be deployed separately for database-backed features such as students, certificates and enquiries.

The admin login page includes a safe static-host fallback so the configured initial administrator can sign in on GitHub Pages. This local/static mode stores its session in the browser and should not be treated as a production security boundary.

When a backend is deployed, set the frontend API base to the backend's `/api` URL before using database-backed admin features.
