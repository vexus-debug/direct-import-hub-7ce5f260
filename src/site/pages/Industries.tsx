import Layout from "@/site/components/Layout";
import PageHero from "@/site/components/PageHero";
import IndustryIllustration from "@/site/components/IndustryIllustration";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Heart, Eye, Stethoscope, CheckCircle2, ArrowRight,
  Baby, Bone, Brain, Scissors, Smile, Ear, Syringe,
  Activity, Sparkles
} from "lucide-react";

const industries = [
  {
    icon: Smile,
    learnMore: "/industries/dental-clinics",
    title: "Dental Clinics",
    tagline: "Because managing teeth shouldn't give you a headache.",
    description: "You're juggling treatment plans, recall schedules, X-ray files, and billing for multi-step procedures, all while trying to keep your chairs full. Clinexus was purpose-built for the chaos of a busy dental practice.",
    painPoints: [
"Track treatments, procedures & dental charting digitally",
"Automate recall reminders so patients don't disappear",
"Bill accurately for multi-visit procedures (root canals, implants)",
"Organize X-rays, panoramic scans & intraoral images per patient",
"Manage dental supply inventory with expiry tracking",
    ],
  },
  {
    icon: Eye,
    learnMore: "/industries/eye-clinics",
    title: "Eye Care & Optometry Clinics",
    tagline: "See your practice clearly, for the first time.",
    description: "Between visual acuity records, prescription histories, lens inventory, and specialist referrals, optometry practices have unique data management challenges. Clinexus understands every one of them.",
    painPoints: [
"Record visual acuity, refraction data & prescription history",
"Manage lens & frame inventory with vendor price tracking",
"Coordinate specialist referrals & follow-ups seamlessly",
"Store retinal scans, OCT results & imaging securely",
"Track contact lens orders and patient reorder cycles",
    ],
  },
  {
    icon: Stethoscope,
    title: "General Practice & Family Clinics",
    tagline: "The backbone of healthcare deserves better tools.",
    description: "You see everything, from flu to chronic conditions, from newborns to the elderly. You need a system as versatile as you are, not one that forces you into rigid workflows designed for someone else.",
    painPoints: [
"Streamline patient intake, triage & consultations",
"Manage lab orders, results & e-prescriptions in one place",
"Track chronic conditions with ongoing care plans",
"Generate compliance reports and complete audit trails",
"Handle walk-ins and appointments side by side",
    ],
  },
  {
    icon: Baby,
    title: "Pediatric Clinics",
    tagline: "They grow fast. Your records should keep up.",
    description: "Growth charts, vaccination schedules, developmental milestones, pediatric care demands tracking that evolves with every child. Parents expect modern communication. Clinexus delivers both.",
    painPoints: [
"Automated vaccination schedule tracking & reminders",
"Growth chart integration with milestone monitoring",
"Parent communication via SMS & email for appointments",
"Age-appropriate consultation templates",
"Sibling & family record linking",
    ],
  },
  {
    icon: Bone,
    title: "Orthopedic & Physiotherapy Clinics",
    tagline: "Fix bodies. We'll fix your workflow.",
    description: "Long treatment cycles, therapy sessions, imaging follow-ups, and equipment tracking make ortho/physio practices uniquely complex. Clinexus keeps every session, scan, and progress note connected.",
    painPoints: [
"Track multi-session treatment plans & progress notes",
"Schedule recurring physiotherapy appointments easily",
"Store & compare imaging (X-ray, MRI) across visits",
"Manage therapy equipment & consumable inventory",
"Generate treatment progress reports for referrals",
    ],
  },
  {
    icon: Scissors,
    title: "Dermatology & Aesthetic Clinics",
    tagline: "Beautiful results start with beautiful systems.",
    description: "Before-and-after photos, product inventory, recurring treatments, consent forms, aesthetic practices run on detail. Clinexus organizes it all so you can focus on transformations.",
    painPoints: [
"Before/after photo storage linked to patient records",
"Track aesthetic product inventory & batch numbers",
"Schedule recurring treatments (Botox, fillers, peels)",
"Digital consent forms with e-signatures",
"Revenue tracking by procedure type & provider",
    ],
  },
  {
    icon: Heart,
    title: "Cardiology Clinics",
    tagline: "Your patients' hearts are in good hands. So is your data.",
    description: "ECG records, chronic medication management, follow-up scheduling for high-risk patients, cardiology demands precision in both care and administration. Clinexus handles the latter.",
    painPoints: [
"Store ECG, echo & stress test results per patient",
"Chronic medication tracking with refill alerts",
"Risk stratification & follow-up scheduling",
"Integration-ready for diagnostic equipment data",
"Detailed visit summaries for specialist referrals",
    ],
  },
  {
    icon: Ear,
    title: "ENT Clinics",
    tagline: "We hear you. Your admin burden is real.",
    description: "Audiometry results, surgical follow-ups, allergy tracking, and procedure-heavy billing make ENT practices a unique challenge. Clinexus adapts to your specialty's specific needs.",
    painPoints: [
"Store audiometry & endoscopy results per patient",
"Track allergy test results & immunotherapy schedules",
"Manage surgical pre-op & post-op workflows",
"Procedure-based billing with CPT/ICD support",
"Equipment sterilization & maintenance logging",
    ],
  },
  {
    icon: Brain,
    title: "Neurology & Psychiatry Clinics",
    tagline: "Complex care. Simple management.",
    description: "Long consultations, detailed psychometric assessments, medication adjustments, and sensitive patient data, mental health and neurology practices need a system built for depth and discretion.",
    painPoints: [
"Extended consultation note templates (30–60 min sessions)",
"Psychometric assessment tracking & scoring",
"Medication history with interaction warnings",
"Enhanced privacy controls for sensitive records",
"Session-based billing & insurance claim support",
    ],
  },
  {
    icon: Syringe,
    title: "Diagnostic & Lab Centers",
    tagline: "Process more samples. Lose fewer results.",
    description: "High volume, fast turnaround, and zero tolerance for errors. Diagnostic centers need bulletproof tracking from sample collection to result delivery. Clinexus keeps every step visible.",
    painPoints: [
"Sample collection tracking with barcode support",
"Automated result delivery to referring physicians",
"Abnormal value flagging & critical alerts",
"Batch processing & high-volume workflow support",
"Revenue analytics by test type & referral source",
    ],
  },
  {
    icon: Sparkles,
    title: "Wellness & Integrative Medicine",
    tagline: "Holistic care deserves a holistic system.",
    description: "Acupuncture, nutrition counseling, chiropractic adjustments, and holistic therapies, your practice doesn't fit into a cookie-cutter EMR. Clinexus is flexible enough to support your unique modalities.",
    painPoints: [
"Custom treatment modality tracking",
"Package-based billing for treatment bundles",
"Wellness goal tracking & progress journaling",
"Supplement & product inventory management",
"Client communication & retention campaigns",
    ],
  },
];

const artFor = (title: string) => {
  const map: Record<string, string> = {"Dental": "dental", "Eye Care": "eye", "General Practice": "stethoscope", "Pediatric": "baby", "Orthopedic": "bone", "Dermatology": "derma", "Cardiology": "heart", "ENT": "ear", "Neurology": "brain", "Diagnostic": "lab", "Wellness": "wellness"};
  const key = Object.keys(map).find((k) => title.startsWith(k));
  return key ? map[key] : "stethoscope";
};

const Industries = () => {
  return (
    <Layout>
      {/* Hero */}
      <PageHero
        eyebrow="Industries we serve"
        title="Built for your kind of clinic."
        description="We know every specialty is different. That's why Clinexus adapts to your workflows, not the other way around. Find your practice below."
        primaryCta={{ label: "Get Started", href: "https://wa.me/2349017758165", external: true }}
        points={[
          { value: "11+", label: "Specialties supported out of the box" },
          { value: "24 hrs", label: "From signup to a live clinic workspace" },
          { value: "1", label: "System for patients, billing, stock and staff" },
        ]}
      />

      {/* Industries Grid */}
      <section className="relative site-section-light overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 bg-background" />

        <div className="container relative z-10 space-y-20">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`flex flex-col items-center gap-12 md:flex-row ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="flex-1 space-y-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <ind.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{ind.title}</h3>
                <p className="text-sm font-medium italic text-primary">{ind.tagline}</p>
                <p className="leading-relaxed text-muted-foreground">{ind.description}</p>
                <ul className="space-y-2.5">
                  {ind.painPoints.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a href="https://wa.me/2349017758165" target="_blank" rel="noopener noreferrer">
                    <Button className="gap-2 rounded-md bg-primary px-8 text-white shadow-md hover:opacity-90">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  {"learnMore" in ind && ind.learnMore && (
                    <Link to={ind.learnMore as string}>
                      <Button
                        variant="outline"
                        className="gap-2 rounded-full border-primary px-8 text-primary hover:bg-primary/10"
                      >
                        Know more <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-lg">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                  <IndustryIllustration variant={artFor(ind.title)} className="relative mx-auto h-64 w-full max-w-sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[hsl(var(--medical-blue-dark))] py-20">
        <div className="pointer-events-none absolute inset-0 " />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold text-white">Don't See Your Specialty?</h2>
            <p className="mx-auto mb-8 max-w-xl text-white/60">
              Clinexus is flexible enough to support virtually any healthcare practice. If you don't see your specialty listed, reach out, we'll show you exactly how it fits.
            </p>
            <Link to="/contact">
              <Button size="lg" className="gap-2 rounded-md bg-primary px-10 text-white shadow-lg hover:opacity-90">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Industries;
