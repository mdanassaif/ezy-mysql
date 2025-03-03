// App.jsx - Main application component
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import MainPage from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <>
    <Helmet>
      {/* Primary Meta Tags */}
      <title>SQL Playground - Interactive SQL Learning Tool</title>
      <meta name="title" content="SQL Playground - Interactive SQL Learning Tool" />
      <meta name="description" content="Practice SQL commands in a safe environment. Interactive SQL editor with real-time results, perfect for learning and experimenting with databases." />
      <meta name="keywords" content="SQL, database, learning, playground, interactive, tutorial, MySQL, practice, SQL editor, database management" />
      <meta name="author" content="mdanassaid" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://ezy-mysql.vercel.app/" />
      <meta property="og:title" content="SQL Playground - Interactive SQL Learning Tool" />
      <meta property="og:description" content="Master SQL with our interactive playground. Practice queries, manage databases, and learn SQL commands in real-time." />
      <meta property="og:image" content="/og-image.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://ezy-mysql.vercel.app/" />
      <meta property="twitter:title" content="SQL Playground - Interactive SQL Learning" />
      <meta property="twitter:description" content="Practice SQL commands in a safe environment. Interactive SQL editor with real-time results." />
      <meta property="twitter:image" content="/og-image.png" />
      <meta name="twitter:creator" content="@mdanassaid" />

      {/* Favicon and App Icons */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Additional Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <meta name="theme-color" content="#14b8a6" />
      <link rel="canonical" href="https://ezy-mysql.vercel.app/" />
    </Helmet>

    <Toaster position="top-right" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;