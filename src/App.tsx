import { MotionConfig } from "framer-motion";

import { ContentProvider } from "./lib/content";

import About from "./components/About";
import Capabilities from "./components/Capabilities";
import ClientMarks from "./components/ClientMarks";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Lab from "./components/Lab";
import Work from "./components/Work";
import Writing from "./components/Writing";

/**
 * Ordered so client work comes first, then the self-directed work, then who
 * I am. The previous build had eight nav entries, three of which pointed at
 * duplicated content.
 */
export default function App() {
  return (
    /* reducedMotion="user" makes Framer Motion itself honour the OS setting.
       The CSS @media block cannot: these animations are JS-driven inline
       styles, so a duration override in CSS never reaches them. With this,
       reduced-motion visitors get the end state immediately. */
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <Header />
        <main>
          <Hero />
          <ClientMarks />
          <Work />
          <Lab />
          <About />
          <Experience />
          <Capabilities />
          <Writing />
          <Contact />
        </main>
        <Footer />
      </ContentProvider>
    </MotionConfig>
  );
}
