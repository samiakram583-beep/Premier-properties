import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Layout } from './components/Layout.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { PropertiesPage } from './pages/PropertiesPage.tsx';
import { PropertyDetailPage } from './pages/PropertyDetailPage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { AdminPage } from './pages/admin/AdminPage.tsx';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/properties"
              element={
                <Layout>
                  <PropertiesPage />
                </Layout>
              }
            />
            <Route
              path="/properties/:slug"
              element={
                <Layout>
                  <PropertyDetailPage />
                </Layout>
              }
            />
            <Route
              path="/gallery"
              element={
                <Layout>
                  <GalleryPage />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />
            <Route
              path="/services"
              element={
                <Layout>
                  <ServicesPage />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <ContactPage />
                </Layout>
              }
            />
            <Route
              path="*"
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
