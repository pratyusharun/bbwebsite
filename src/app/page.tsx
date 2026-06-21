import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import MouseGlow from "@/components/MouseGlow";
import Hero from "@/components/Hero";
import About from "@/components/sections/About";
import Timeline from "@/components/sections/Timeline";
import Tracks from "@/components/sections/Tracks";
import Prizes from "@/components/sections/Prizes";
import Organizers from "@/components/sections/Organizers";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <MouseGlow />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <div className="hairline mx-auto max-w-container" />
        <About />
        <Timeline />
        <Tracks />
        <Prizes />
        <Organizers />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
