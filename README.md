# RiteaseApp

## Overview
RiteaseApp is a Next.js-based application that utilizes various libraries for UI components, form handling, and PDF viewing. The project is designed to be modern, responsive, and efficient with a strong focus on usability.

## Setup and Running Instructions

### Prerequisites
Ensure you have the following installed:
- Node.js (latest LTS version recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/livinusonyenso/ugwuja_livinus_frontend-test
   cd RiteaseApp
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Run the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. Open the application in your browser:
   ```sh
   http://localhost:3000
   ```
5. To build the project for production:
   ```sh
   npm run build
   ```
6. To start the production server:
   ```sh
   npm run start
   ```

## Libraries and Tools Used
- **Next.js** (15.1.0) - Framework for React applications
- **React** (19) - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **react-hook-form** - Form management
- **Zod** - Schema validation
- **react-pdf** & **pdfjs-dist** - PDF viewing
- **Lucide React** - Icon set
- **Recharts** - Charting library
- **React Dropzone** - File uploads

## Challenges Faced
### CORS Issue with PDF.js
When attempting to load a PDF using `pdfjs-dist`, a CORS error occurred due to the following line:
```js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
```
**Cause:** The external worker file could not be fetched due to CORS restrictions.

**Possible Solutions:**
1. Serve the worker file locally instead of using an external URL.
2. Use a different PDF rendering approach.
3. Modify server headers to allow cross-origin requests.

Due to time constraints, this issue was not fully resolved but is noted for future improvement.

## Future Improvements
- Resolve the PDF.js CORS issue
- Optimize performance for large PDFs
- Implement better error handling and UI feedback

## Contributing
If you’d like to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to your branch (`git push origin feature-branch`)
5. Open a pull request

## License
This project is licensed under the MIT License.

---

**Filename:** `README.md`
