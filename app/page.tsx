import { Chapters } from "@/components/chapters";
import { Credits } from "@/components/credits";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Launch } from "@/components/launch";
import { MarkerLibrary } from "@/components/marker-library";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Statement } from "@/components/statement";
import { TechnicalDetails } from "@/components/technical-details";

export default function HomePage() {
    return (
        <>
            <SiteHeader />
            <main id="main-content">
                <Hero />
                <Statement />
                <HowItWorks />
                <Chapters />
                <MarkerLibrary />
                <TechnicalDetails />
                <Credits />
                <Launch />
            </main>
            <SiteFooter />
        </>
    );
}
