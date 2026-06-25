# Fizyon — Competitive & Market Landscape

> Document 03 of the pre-development package.
> Synthesized from dedicated web research (June 2026). Sources are linked inline. Where data is uncertain or missing, it is flagged — don't treat flagged claims as settled.

This doc exists to answer three questions: **Is the problem real?** **Who else is solving it and how?** **Where is our wedge?**

---

## 1. The problem is real and well-documented (adherence science)

Home-exercise-program (HEP) adherence is genuinely broken — this is not a hypothesis, it's a measured crisis:

- HEP non-adherence runs **50–70%** across musculoskeletal conditions; one meta-analysis found only **33% full adherence** ([ResearchGate](https://www.researchgate.net/publication/333517423_Adherence_to_Home_Exercise_Programmes_and_its_Associated_Factors_among_Patients_Receiving_Physiotherapy)). A physiotherapy-patient study found **75.5% non-adherent** ([PMC5938081](https://pmc.ncbi.nlm.nih.gov/articles/PMC5938081/)). A 2024 review cites adherence "as low as **30%**" ([PMC12070003](https://pmc.ncbi.nlm.nih.gov/articles/PMC12070003/)).

**What the evidence says actually moves adherence** (this directly shapes Fizyon's bets):

| Lever | Evidence | Implication for Fizyon |
|---|---|---|
| Mobile app + push notifications | RCT (whiplash, n=59): significantly higher adherence (p=0.005), 31% drop in pain catastrophizing ([PMC11640009](https://pmc.ncbi.nlm.nih.gov/articles/PMC11640009/)) | Validates the core app + gentle reminders |
| **Real-time movement feedback** | Feedback group played exercise videos **~1.5× longer** ([PMC12385635](https://pmc.ncbi.nlm.nih.gov/articles/PMC12385635/)) | **Validates the camera-verification thesis** |
| **Therapeutic relationship quality** | The **single strongest predictor** of adherence; personalization to the individual beats delivery method ([PMC5938081](https://pmc.ncbi.nlm.nih.gov/articles/PMC5938081/)) | **The clinician relationship is the moat** — our two-sided design and "your physiotherapist" framing is the right bet |
| Reminder timing | Generic reminders felt "disruptive" by ~half of users; user-customized timing works | Reminders must be configurable + gentle (FR-27) |
| Gamification | ~20% adherence lift in *medication* apps; rehab-specific evidence is **weak** (small, low-quality studies) ([Dovepress](https://www.dovepress.com/a-gamification-mhealth-intervention-to-enhance-adherence-to-personaliz-peer-reviewed-fulltext-article-PPA)) | Keep gamification **opt-in and gentle** — don't bet the product on it |

⚠️ **The most important nuance:** digitizing alone does **not** fix adherence. A stroke RCT (n=62) found **only a 2% (non-significant) difference** between video HEP + automated reminders vs paper ([PubMed 27920262](https://pubmed.ncbi.nlm.nih.gov/27920262/)). **A prettier exercise video is not a product.** What works is the *combination* of a real clinician relationship + personalization + real-time feedback + the patient feeling seen. Fizyon must win on the **closed loop**, not on "we put the handout on a phone."

**Barriers to design out:** pain perceived as worsening, forgetting, exercises perceived as pointless, fatigue. **Strongest positive predictor: social/family support** → supports our social-sharing and clinician-visibility features.

---

## 2. Competitive landscape

### Who does on-device/real-time camera form analysis?

| Platform | Camera form analysis | Notes |
|---|---|---|
| **Kemtai** | ✅ markerless CV | B2B white-label infra; 2,000+ exercises; cloud-vs-on-device **unconfirmed** |
| **Exer Health** | ✅ 24 body points | Clinic-distributed; 100+ exercise types; enterprise pricing |
| **Kaia Health** | ✅ "Motion Coach" | **Acquired by SWORD Jan 2026 ($285M)**; was B2B + €/$ B2C; DiGA-reimbursed in Germany |
| **SWORD Health** | ✅ (+ sensors) | Employer/health-plan B2B; consumer $150–300/mo |
| **Hinge Health** | ✅ (+ FDA-cleared wearable) | US employer-funded; ~$432M revenue; IPO'd 2025 |
| **Reflexion VERA** | ✅ depth sensor | **Ships dedicated tablet hardware** — high friction |
| **Physimax / DarioHealth** | ✅ cloud | MSK assessment; employer/health-plan |
| OneStep | ❌ (IMU gait, not guided HEP) | Smartphone gait analysis |
| **Physitrack / PhysiApp** | ❌ | **18,000+** filmed exercises; full clinician suite; **$22/mo or £194/yr**; two-way messaging |
| VALD TeleHab | ❌ (manual video review) | **Free** for clinicians; 6,000+ videos; tied to VALD hardware |
| Rehab Guru | ❌ | 6,000+ exercises; clinic management; pricing not public |
| **Medbridge GO** | ❌ | **Explicit gamification** (points, streaks, reminders); ~$169/seat/yr |

Sources: [physitrack.com](https://www.physitrack.com/), [kemtai.com](https://kemtai.com/product/), [exer.ai](https://www.exer.ai/), [swordhealth.com](https://swordhealth.com/), [hingehealth.com](https://www.hingehealth.com/), [valdhealth.com/telehab](https://valdhealth.com/telehab/), [medbridge.com](https://www.medbridge.com/).

### What this tells us
- **Camera form-feedback is proven and adopted** by the most serious, best-funded players — it's where the category is heading. We're not betting on an unproven idea.
- **But the camera leaders are built for US/EU healthcare economics** — employer-funded, health-plan-reimbursed, enterprise-priced, English/German. **None of these models map onto Türkiye's market**, where there's no large employer-funded MSK-benefit market.
- **The affordable, clinician-pays players (Physitrack, Rehab Guru, VALD) have NO camera verification.** So there's a structural gap: *affordable + clinician-pays + real camera verification* is largely unoccupied — and that's exactly Fizyon's slot.
- **Exercise-library size is a real competitive axis** (Physitrack 18k, Kemtai 2k, VALD 6k). Our 100+ is an MVP starting point, not parity. → **Implication:** compete on *quality, Turkish relevance, and verifiability* first, grow the library over time (see roadmap [10](10-roadmap-and-phasing.md) and OQ-3).

---

## 3. Türkiye market

- **Workforce:** ~**39,000 practicing physiotherapists** ([World Physiotherapy](https://world.physio/membership/turkey)); 114 university programs, 25k+ students — a large, growing serviceable market. Most independent/small clinics still use paper.
- **Digital health momentum:** market **$4.86B (2025) → $13.2B (2034)**, ~11.4% CAGR ([IMARC](https://www.imarcgroup.com/turkey-digital-health-market)). Post-COVID telehealth normalization + government digitalization.
- **e-Nabız:** national personal health record with **~80–82% population adoption** (68M+ users) ([PMC10175887](https://pmc.ncbi.nlm.nih.gov/articles/PMC10175887/)). **Opportunity (later):** pushing completed-exercise logs to e-Nabız would be a strong credibility signal for B2B — but requires Ministry of Health partnership; complexity unknown. **Roadmap signal, not v1** (NG-2).
- **Local players:** **XRVERY** (Turkish VR/XR physio — requires headsets/sensors, higher cost, *not phone-first*), **NOTET** (clinic appointment SaaS, not HEP), Physiotutors (clinician education, not a patient HEP tool). **No Turkish-built two-sided physio HEP app with camera analysis exists — a validated gap.**

### KVKK (this shapes architecture, not just legal)
- KVKK No. 6698 closely mirrors GDPR ([kvkk.gov.tr](https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law)).
- **Exercise video + health data = "special category personal data"** (Art. 6) — same tier as medical records.
- Requirements: **explicit, specific, informed consent** before processing; **VERBIS** registration for processing special-category data; cross-border transfer rules (matters if using non-TR cloud); breach notification; access/deletion rights.
- 🟢 **On-device processing is a structural KVKK advantage:** if camera frames never leave the phone, our exposure for *video* data collapses — we only handle derived health-outcome data going to the clinician (still requires consent). This is both compliance and **marketing**. Detailed handling in [08](08-technical-architecture.md) and [12](12-risks-and-open-questions.md).

### Payments (Türkiye-first)
- **iyzico** = primary gateway; supports cards, FAST instant transfer, Korumalı Havale/EFT, and **native subscription billing** — ideal for clinic subscriptions ([iyzico.com](https://www.iyzico.com/)).
- **Havale/EFT / FAST** is ubiquitous (~2B transactions/yr) and clinics are comfortable paying by bank transfer; **110M+ active cards**.
- → **Implication:** support card subscriptions via iyzico **and** havale/EFT-by-invoice for larger clinics. TRY-denominated pricing (survives lira volatility; matches local tax/withholding).

---

## 4. Gamification — evidence-based design rails ("Oyunlaştır")

**What works:** task-completion rewards, **progress visualization** (especially for 6–12mo recovery), patient-controlled social sharing, **adaptive difficulty**, audio-visual feedback, streaks **with grace periods**.

**What to avoid (these are requirements, not opinions):**
- ❌ **Competitive leaderboards between patients** — shaming for slower/severe cases.
- ❌ **Punitive streaks** — losing a streak after a pain flare causes dropout → mandatory **grace/freeze** rules.
- ❌ **Infantilizing/cartoon UI** — older patients (a core physio demographic) reject it and disengage → prefer **subtle** mechanics (progress rings, milestone certificates) over childish badges.
- ❌ **Compulsive loops / FOMO / artificial urgency** — inappropriate and trust-breaking in pain recovery.
- ❌ **Pain-blind difficulty** — integrate a "how's the pain today?" check-in that can soften the day.

⚠️ **Reality check:** only **~28% of adults 50–80 use any health-tracking app, and ~16% abandon after first use** ([PMC12070003](https://pmc.ncbi.nlm.nih.gov/articles/PMC12070003/)). Rehab gamification evidence is **weak** (83% of studies poor/fair quality, mean n≈20) ([PMC12396673](https://pmc.ncbi.nlm.nih.gov/articles/PMC12396673/)). → **Default experience must be calm and friction-free; gamification is an opt-in layer for those it helps, never the core bet.** This is exactly the Ahmet-vs-Deniz split in [01](01-personas-and-jtbd.md).

---

## 5. Fizyon's differentiation (the wedge)

| Differentiator | Why it's defensible |
|---|---|
| **Türkiye-native, Turkish-first** | Every camera competitor is US/EU/English/German. No TR two-sided camera HEP app exists. |
| **Offline, on-device camera verification** | Privacy by architecture + KVKK advantage + works on poor connections. Kemtai/Kaia are cloud-ish/unclear; we're unambiguously on-device. |
| **Affordable, clinician-pays, TRY pricing** | The camera leaders are employer/health-plan funded (no TR equivalent). The affordable players have no camera. We occupy the empty slot. |
| **Built two-sided from the ground up** | Most camera tools are patient gadgets bolted onto a portal. Our prescribe → verify → monitor → adapt loop is the product. |
| **Designed for the 6–12 month recovery arc** | Competitors optimize short engagement loops; we design for the long, fluctuating-pain trajectory (gentle re-engagement, mercy streaks). |
| **Havale/EFT + iyzico** | Removes a real payment-friction barrier global tools can't match. |
| **e-Nabız pathway (later)** | A credibility moat in government/university-hospital channels no global competitor has. |
| **Freemium for solo physiotherapists** | VALD is free-but-no-camera; Physitrack is $22/mo. A camera-enabled free tier for solo practices drives bottom-up adoption in a fragmented market. |

### Risks to validate (carry into [12](12-risks-and-open-questions.md))
- **Willingness-to-pay** of Turkish physiotherapists may be below Western SaaS norms — validate the ARPU ceiling before over-investing.
- **On-device accuracy** must be "good enough to trust" — this is the core technical bet (feasibility is promising; see [08](08-technical-architecture.md)).
- **Library depth** vs incumbents — plan the path from 100+ to thousands.

---

### Next
- Can we actually build the camera verification? → [08-technical-architecture.md](08-technical-architecture.md)
- How it's organized → [05-information-architecture.md](05-information-architecture.md)
- The requirements these insights shaped → [04-prd.md](04-prd.md)
