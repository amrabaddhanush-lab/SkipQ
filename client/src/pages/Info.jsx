import { Link, Navigate, useParams } from 'react-router-dom'
import { Mail, Phone, Clock, MessageCircle } from 'lucide-react'
import { Card } from '../components/ui'
import { SITE } from '../lib/site'

const H = ({ children }) => <h2 className="mb-1 mt-6 font-display text-xl font-extrabold text-slate-900">{children}</h2>
const P = ({ children }) => <p className="mb-2 text-slate-600 leading-relaxed text-sm">{children}</p>

const faqs = [
  ['How do I book a token?', 'Open Book, choose a service centre (such as Apollo Hospitals, SBI Main Branch, or Passport Seva Kendra) and press Book token. You can also use direct voice booking without needing any confirmation prompts.'],
  ['What documents do I need to bring?', 'Every centre in SkipQ includes an interactive “Documents to Bring” checklist on its info card and on your live ticket screen. For banks, bring original PAN and Aadhaar. For hospital OPD, bring your previous prescriptions and insurance/TPA card. For Passport or RTO, bring original birth proof / mark sheet and your printed appointment form.'],
  ['Do I need to be at the centre while I wait?', 'No! Watch your live queue position and estimated wait on My token from anywhere. Head to the centre when you are 1-2 tokens away. We send alerts when it is your turn.'],
  ['Can I book tokens for specialty hospital departments?', 'Yes. You can search directly for specialty desks including Cardiology, Orthopedics, Pediatrics & Vaccinations, Diagnostics, and MRI. Each department details its available consultations and operating hours.'],
  ['Which banking services are supported?', 'Participating bank branches (such as SBI, HDFC, ICICI, Axis, PNB, and Kotak) feature counter-level queues for Cash Deposits, Foreign Exchange (Forex), Safe Deposit Lockers, Pension Processing, and Biometric KYC.'],
  ['What if I miss my turn?', 'Staff may skip your token if you are not at the assigned counter when called. You will receive an alert and can book a fresh token when ready.'],
  ['How do WhatsApp and browser alerts work?', 'Add your WhatsApp phone number when you register. SkipQ messages you when your token is booked, when you are next in line, and when your counter is ready.'],
  ['Can I cancel a token?', 'Yes. Open My token and press Cancel token while your status is Waiting, or simply say “Cancel my token” into the voice assistant.'],
  ['Which languages does the voice assistant support?', 'English, Hindi (हिन्दी) and Telugu (తెలుగు) with automatic real-time language detection.'],
  ['How do I rate a visit?', 'After staff complete your visit, a rating card appears on your Dashboard and in History so you can leave feedback and help other citizens.']
]

const pages = {
  help: {
    title: 'Help Centre & Guide',
    body: (
      <>
        <P>New to SkipQ? These steps cover everything you need to navigate queues effortlessly.</P>
        <H>Getting started</H>
        <ol className="mb-2 list-decimal space-y-1.5 pl-5 text-slate-600 text-sm">
          <li>Create an account with your name, email and WhatsApp phone number.</li>
          <li>Open <Link to="/book" className="font-semibold text-orange-600 hover:underline">Book</Link> and browse over 25 verified hospitals, banks, and citizen centres.</li>
          <li>Click “Info & Docs” on any centre to review required documents, operating hours, and consultation tariffs.</li>
          <li>Press Book token. Your live ticket and QR code appear instantly on My token.</li>
          <li>Watch your position update in real time from home, office, or transit.</li>
          <li>When called, proceed to the counter shown and show your QR code.</li>
        </ol>
        <H>Using direct voice commands</H>
        <P>Tap the floating mic assistant in the bottom right corner. You can speak naturally in English, Hindi, or Telugu without needing to confirm. Simply say: “Book token at Apollo hospital”, “Book SBI”, or “What is my position?”.</P>
        <H>Still have questions?</H>
        <P>Explore our <Link to="/p/faq" className="font-semibold text-orange-600 hover:underline">FAQs</Link> or reach out directly via <Link to="/p/contact" className="font-semibold text-orange-600 hover:underline">contact us</Link>.</P>
      </>
    ),
  },
  faq: {
    title: 'Frequently asked questions',
    body: (
      <div className="mt-4 space-y-2.5">
        {faqs.map(([q, a]) => (
          <details key={q} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition open:border-orange-300 open:bg-orange-50/20">
            <summary className="cursor-pointer font-bold text-slate-900 text-sm select-none">{q}</summary>
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    ),
  },
  contact: {
    title: 'Contact us',
    body: (
      <>
        <P>Our support and customer operations teams are available to assist with bookings, counter directions, alerts, and verified centre onboarding.</P>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            [Phone, 'Toll-free Helpline', SITE.phone, `tel:${SITE.phone.replace(/[^\d+]/g, '')}`],
            [Mail, 'Support Email', SITE.email, `mailto:${SITE.email}`],
            [Clock, 'Operating Hours', SITE.hours, null],
            [MessageCircle, 'Reporting a problem?', 'Email us with your token number and centre name.', `mailto:${SITE.email}?subject=Problem%20report`],
          ].map(([Icon, label, value, href]) => (
            <div key={label} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-600"><Icon size={18} /></span>
              <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                {href ? <a href={href} className="font-semibold text-slate-900 hover:text-orange-600 text-sm">{value}</a> : <p className="font-semibold text-slate-900 text-sm">{value}</p>}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-400">{SITE.company} · {SITE.address}</p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    body: (
      <>
        <P>Last updated: November 2026</P>
        <H>What we collect</H>
        <P>Your name, email address, WhatsApp number, token booking history, ratings, and basic device metrics required to calculate live queue wait estimates.</P>
        <H>How we use it</H>
        <P>To hold your place in virtual queues, update estimated wait times, send turn alerts, and help healthcare and banking providers maintain fair service queues.</P>
        <H>Who sees it</H>
        <P>Counter staff see your token number and name only for the specific centre and queue you joined. We never share or sell personal information.</P>
        <H>Security</H>
        <P>Authentication tokens and credentials are securely encrypted and all communications occur over secure protocols.</P>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    body: (
      <>
        <P>Last updated: November 2026</P>
        <H>Using SkipQ</H>
        <P>SkipQ enables real-time virtual queueing. Estimated wait times are dynamic calculations based on counter throughput and may adjust based on urgent walk-ins.</P>
        <H>User responsibilities</H>
        <P>Hold only active tokens for visits you plan to make. Be present with required documents when your token is called to prevent queue cancellation.</P>
        <H>Feedback and ratings</H>
        <P>Ratings and reviews should be fair, constructive, and based on authentic visits.</P>
        <H>Contact</H>
        <P>Questions? Write to {SITE.email}.</P>
      </>
    ),
  },
}

export default function Info() {
  const { slug } = useParams()
  const page = pages[slug]
  if (!page) return <Navigate to="/" replace />
  return (
    <section className="mx-auto max-w-2xl animate-fadeIn">
      <h1 className="mb-4 font-display text-3xl font-extrabold text-slate-900 tracking-tight">{page.title}</h1>
      <Card>{page.body}</Card>
    </section>
  )
}
