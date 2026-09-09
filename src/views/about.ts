import { html } from "../lib/html.ts";
import { renderPage } from "./layout.ts";
import type { SiteSettings } from "../types/index.ts";

export function renderAbout(settings: SiteSettings): string {
  const body = html`
    <div class="about-page">
      <!-- High-impact bold red/orange personal statement section -->
      <section class="about-hero-section">
        <div class="about-hero-container">
          <div class="traits-list" data-reveal>
            <div class="trait-line">PLANT DADDY</div>
            <div class="trait-line">GOONER SINCE THE INVINCIBLES</div>
            <div class="trait-line">MARRIED TO A BEAUTIFUL KNITTER</div>
            <div class="trait-line">3 CATS CALL HIM DAD</div>
            <div class="trait-line">BLACKBERRY COLLECTOR</div>
            <div class="trait-line">POOL PLAYER BUT CHICKEN LEVEL</div>
            <div class="trait-line">INTO WATCHES NOW...</div>
          </div>

          <div class="and-label" data-reveal>AND</div>

          <div class="mission-statement" data-reveal>
            SHAPING DIGITAL EXPERIENCES WITH CLARITY, INTENTION, CHARACTER, AND BEING A GOOD FRIEND WITH DIGITAL AGENCIES, DESIGN STUDIOS, STARTUPS, AND BUSINESSES AROUND THE WORLD SINCE 2018.
          </div>
        </div>

        <!-- Giant background watermark numerals 19 & 96 -->
        <div class="watermark-wrap" aria-hidden="true">
          <span class="watermark-num">19</span>
        </div>

        <!-- Character Avatar with comic speech bubble -->
        <div class="avatar-feature" data-reveal>
          <div class="speech-bubble">
            <span>EVER WONDERED WHAT'S GOING ON INSIDE MY HEAD?</span>
          </div>
          <div class="avatar-illustration-wrap">
            <img
              src="/media/projects/about_1.png"
              alt="Huy Phan Illustrated Avatar"
              class="avatar-img"
              width="360"
              height="360"
            />
          </div>
        </div>

        <div class="watermark-wrap watermark-bottom" aria-hidden="true">
          <span class="watermark-num">96</span>
        </div>
      </section>

      <!-- Trusted by Section -->
      <section class="trusted-by-section">
        <div class="trusted-container">
          <span class="section-tag">Trusted by</span>
          <div class="clients-grid">
            <span class="client-pill">Unilever</span>
            <span class="client-pill">VinPearl</span>
            <span class="client-pill">Autonomous</span>
            <span class="client-pill">Soravia</span>
            <span class="client-pill">NanoTemper</span>
            <span class="client-pill">Arvid Nordquist</span>
            <span class="client-pill">Soluis Group</span>
            <span class="client-pill">Klingit</span>
            <span class="client-pill">ToyFight</span>
            <span class="client-pill">Stockfiller</span>
            <span class="client-pill">Serious Business</span>
            <span class="client-pill">and many more</span>
          </div>
        </div>
      </section>

      <!-- Recognitions, Capabilities & Publications 3-Column Grid -->
      <section class="about-details-section">
        <div class="details-container">
          <!-- Column 1: Capabilities -->
          <div class="details-col" data-reveal>
            <h3 class="col-title">Capabilities</h3>
            <ul class="clean-list">
              <li>Digital Art Direction</li>
              <li>Website Design</li>
              <li>Application Design</li>
              <li>Interactive Storytelling</li>
              <li>Website Motion & Animation</li>
              <li>Design System</li>
              <li>User Experience</li>
              <li>Process & Approach</li>
            </ul>
          </div>

          <!-- Column 2: Recognitions -->
          <div class="details-col" data-reveal>
            <h3 class="col-title">Awards & Recognitions</h3>
            <ul class="clean-list">
              <li>Awwwards Independent of the Year Nominee (4)</li>
              <li>CSSDA Designer of the Year Nominee (3)</li>
              <li>Webby Nominee (2)</li>
              <li>Webby Honoree (2)</li>
              <li>Awwwards Site of the Month Nominees (4)</li>
              <li>Awwwards Site of the Day (13)</li>
              <li>CSSDA Website of the Month (2)</li>
              <li>CSSDA Website of the Day (14)</li>
              <li>FWA of the Day (12)</li>
              <li>Behance Feature (17)</li>
              <li>Good Design Awards</li>
              <li>Best Awards</li>
            </ul>
          </div>

          <!-- Column 3: Publications -->
          <div class="details-col" data-reveal>
            <h3 class="col-title">Talk, Interview & Publications</h3>
            <ul class="clean-list">
              <li>Codrops - Designer Spotlight</li>
              <li>Sandu Publishing | Interactive Design for Screen</li>
              <li>Pint of Design | December 2024</li>
              <li>Commarts | Mat Voyce</li>
              <li>Commarts | Iventions</li>
              <li>Commarts | Won J. You Studios</li>
              <li>Awwwards Case Study | Serious Business</li>
              <li>Awwwards Case Study | Mat Voyce</li>
              <li>Awwwards Case Study | Fromanother</li>
              <li>Abduzeedo | RLY Network</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Credits Footer -->
      <section class="about-credits-section">
        <div class="credits-container">
          <div class="credit-item">
            <span>Development & Rive</span>
            <a href="https://x.com/BausPjam" target="_blank" rel="noopener noreferrer">Chien Pham</a>
          </div>
          <div class="credit-item">
            <span>Illustration</span>
            <a href="https://dribbble.com/yupnguyen" target="_blank" rel="noopener noreferrer">Yup Nguyen</a>
          </div>
          <div class="credit-item">
            <span>Fonts</span>
            <span>BT Glyphius & BT Grotesk</span>
          </div>
          <div class="credit-item">
            <span>Copywriting</span>
            <a href="https://www.youtube.com/@theimpulsivestitch" target="_blank" rel="noopener noreferrer">Ha Nguyen (the wife)</a>
          </div>
        </div>
      </section>
    </div>
  `;

  return renderPage({
    meta: {
      title: "About - Huy Phan",
      description: "Huy Phan (Huyml) is an award-winning designer and art director based in Ho Chi Minh city, Vietnam.",
      path: "/about",
      ogImage: "/media/projects/about_1.png",
    },
    settings,
    body,
    bodyClass: "page-about",
  });
}
