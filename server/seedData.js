const bcrypt = require('bcryptjs')

const realisticServices = [
  // ------------------- HOSPITALS -------------------
  {
    name: 'Apollo Hospitals – Jubilee Hills',
    category: 'Hospital',
    prefix: 'APH',
    avg_minutes: 8,
    counters: 4,
    location: 'Road No. 72, Film Nagar, Jubilee Hills, Hyderabad, Telangana 500033',
    hours: 'Mon – Sat: 08:00 AM – 08:00 PM (Emergency 24x7)',
    phone: '+91 40 2360 7777',
    email: 'jubilee@apollohospitals.com',
    description: 'Premier multi-specialty tertiary hospital with world-class faculty in Cardiology, Neurology, Oncology, and Comprehensive Health Screening.',
    services_offered: JSON.stringify([
      'Cardiology OPD',
      'Neurology Consultation',
      'Full Body Health Check',
      'Diagnostic Imaging & MRI',
      '24x7 Emergency Triage'
    ]),
    docs_required: JSON.stringify([
      'Government Photo ID (Aadhaar / Voter ID / Passport)',
      'Past Medical Records & Prior Prescriptions',
      'Health Insurance / TPA Card (for cashless claims)'
    ]),
    fee_info: 'OPD Consultation: ₹800. Diagnostic imaging as per CGHS / NABH standard tariff.'
  },
  {
    name: 'AIIMS Outpatient Specialty Clinics',
    category: 'Hospital',
    prefix: 'AIM',
    avg_minutes: 8,
    counters: 5,
    location: 'Main Medical Complex, Sector 4, Hyderabad, Telangana 500085',
    hours: 'Mon – Fri: 08:30 AM – 03:30 PM, Sat: 08:30 AM – 01:00 PM',
    phone: '+91 40 2999 1000',
    email: 'opd.desk@aiims.edu.in',
    description: 'National institute of healthcare excellence providing specialist consultations, expert clinical diagnostics, and subsidized pathology investigations.',
    services_offered: JSON.stringify([
      'General Medicine OPD',
      'Orthopedics & Joint Care',
      'Pediatrics & Neonatology',
      'Pathology & Central Labs',
      'Subsidized Pharmacy Counter'
    ]),
    docs_required: JSON.stringify([
      'AIIMS UHID Card (if previously registered)',
      'National ID Proof (Aadhaar / Voter ID)',
      'Ayushman Bharat / White Ration Card (for fee concessions)'
    ]),
    fee_info: 'OPD Registration: ₹20. Specialist consultations free of cost; Subsidized nominal lab charges.'
  },
  {
    name: 'Care Hospitals – Banjara Hills',
    category: 'Hospital',
    prefix: 'CRH',
    avg_minutes: 7,
    counters: 3,
    location: 'Road No. 1, Banjara Hills, Hyderabad, Telangana 500034',
    hours: 'Mon – Sat: 08:30 AM – 07:00 PM',
    phone: '+91 40 6165 6565',
    email: 'banjara@carehospitals.com',
    description: 'Renowned cardiac and multi-organ transplant hospital featuring fast-track outpatient clinics, diabetic center, and advanced vascular care.',
    services_offered: JSON.stringify([
      'Cardiac & Vascular Clinic',
      'Nephrology & Dialysis Desk',
      'Diabetic Care Center',
      'Ultrasound & 2D Echo Desk',
      'Pharmacy & Insurance Pre-Auth'
    ]),
    docs_required: JSON.stringify([
      'Valid Photo ID',
      'Previous Lab Reports & Medication List',
      'Corporate / Insurance Health Card'
    ]),
    fee_info: 'Specialist OPD Consultation: ₹700. Executive cardiac screening packages available.'
  },
  {
    name: 'Rainbow Children’s Hospital & BirthRight',
    category: 'Hospital',
    prefix: 'RCH',
    avg_minutes: 6,
    counters: 3,
    location: 'Road No. 2, Banjara Hills, Hyderabad, Telangana 500034',
    hours: 'Mon – Sat: 09:00 AM – 07:30 PM (Pediatric ER 24x7)',
    phone: '1800 2122',
    email: 'care@rainbowhospitals.in',
    description: 'Dedicated pediatric, neonatal, and maternity hospital ensuring child-friendly care, pediatric surgery, developmental therapy, and child wellness.',
    services_offered: JSON.stringify([
      'Pediatric General OPD',
      'Newborn Immunization & Vaccines',
      'Pediatric Ophthalmology & ENT',
      'Maternal Care Consultations',
      'Child Growth & Nutrition Counseling'
    ]),
    docs_required: JSON.stringify([
      'Child Birth Certificate / Mother ID',
      'Child Vaccination Record Card',
      'Prior Pediatric Growth Chart'
    ]),
    fee_info: 'Pediatric OPD: ₹750. Vaccination charges as per national schedule.'
  },
  {
    name: 'Max Super Speciality Hospital',
    category: 'Hospital',
    prefix: 'MAX',
    avg_minutes: 8,
    counters: 3,
    location: 'Outer Ring Road, Sector 11, Hyderabad, Telangana 500081',
    hours: 'Mon – Sat: 08:00 AM – 06:30 PM',
    phone: '+91 40 4011 2233',
    email: 'info@maxhealthcare.com',
    description: 'Leading quaternary care hospital renowned for robotic joint replacement, pulmonology, oncology day-care, and executive wellness screening.',
    services_offered: JSON.stringify([
      'Orthopedics & Sports Medicine',
      'Pulmonology & Asthma Clinic',
      'Dermatology & Skin Care',
      'Radiology / CT Scan Desk',
      'Day Care Admission Desk'
    ]),
    docs_required: JSON.stringify([
      'Photo ID Proof',
      'Corporate Referral Letter / Insurance Card',
      'Recent X-Rays / Imaging Discs'
    ]),
    fee_info: 'Consultation: ₹850. In-house pharmacy 10% discount.'
  },
  {
    name: 'Fortis Healthcare – Specialty Clinic & Day Care',
    category: 'Hospital',
    prefix: 'FTH',
    avg_minutes: 6,
    counters: 2,
    location: 'Central Avenue, Tech Zone, Hyderabad, Telangana 500081',
    hours: 'Mon – Sat: 09:00 AM – 06:00 PM',
    phone: '+91 40 4919 7777',
    email: 'support@fortishealthcare.com',
    description: 'Modern ambulatory center offering gastroenterology, ENT, audiology, physiotherapy rehabilitation, and preventive health screenings.',
    services_offered: JSON.stringify([
      'ENT & Audiology Desk',
      'Gastroenterology OPD',
      'Preventive Health Screening',
      'Physiotherapy & Rehab Desk',
      'Pathology Sample Collection'
    ]),
    docs_required: JSON.stringify([
      'Government ID Proof',
      'Previous Discharge Summaries (if relevant)',
      'Fasting blood sample instructions (if test booked)'
    ]),
    fee_info: 'Specialist OPD: ₹800. Preventive check packages start from ₹1,999.'
  },

  // ------------------- BANKS -------------------
  {
    name: 'State Bank of India (SBI) – Main Branch',
    category: 'Bank',
    prefix: 'SBI',
    avg_minutes: 6,
    counters: 5,
    location: 'Bank Street, Koti, Hyderabad, Telangana 500095',
    hours: 'Mon – Fri: 10:00 AM – 04:00 PM (Closed 2nd & 4th Sat)',
    phone: '1800 1234',
    email: 'customercare.koti@sbi.co.in',
    description: 'Premier public banking branch offering high-value teller cash services, central government pension processing, PPF schemes, and RTGS transfers.',
    services_offered: JSON.stringify([
      'Cash Deposits & High-Value Withdrawals',
      'Cheque Clearing & RTGS/NEFT Counter',
      'Pension Processing & Life Certificate',
      'PPF & Senior Citizen Savings',
      'Passbook Printing & ATM Helpdesk'
    ]),
    docs_required: JSON.stringify([
      'Original Aadhaar Card',
      'PAN Card',
      'Original Bank Passbook / Cheque Leaf',
      'Life Certificate Token (for pensioners)'
    ]),
    fee_info: 'Zero charges for regular teller transactions. Free passbook printing.'
  },
  {
    name: 'HDFC Bank – Financial District Branch',
    category: 'Bank',
    prefix: 'HDF',
    avg_minutes: 5,
    counters: 4,
    location: 'Tower 2, WaveRock SEZ, Nanakramguda, Hyderabad, Telangana 500032',
    hours: 'Mon – Fri: 09:30 AM – 04:30 PM (Open 1st, 3rd & 5th Sat)',
    phone: '1800 202 6161',
    email: 'support@hdfcbank.com',
    description: 'Modern corporate & retail branch with specialized counters for foreign exchange, international remittances, salary accounts, and commercial credit.',
    services_offered: JSON.stringify([
      'Forex Currency & Multi-Currency Cards',
      'Salary Account & Priority Banking Desk',
      'Trade Finance & Letter of Credit',
      'Commercial Loans & Overdraft Help',
      'NetBanking & Token Authentication'
    ]),
    docs_required: JSON.stringify([
      'Passport & Visa (for Forex / Remittance)',
      'PAN & Aadhaar Cards',
      'Company ID & 3 Months Salary Slips (for Corporate Accounts)'
    ]),
    fee_info: 'Standard RBI tariff. Zero card issuance fee for corporate salary holders.'
  },
  {
    name: 'ICICI Bank – Cyber City Branch',
    category: 'Bank',
    prefix: 'ICI',
    avg_minutes: 5,
    counters: 3,
    location: 'Mindspace Tech Park, Ground Floor, Madhapur, Hyderabad, Telangana 500081',
    hours: 'Mon – Fri: 09:30 AM – 04:30 PM, Open 1st & 3rd Sat',
    phone: '1800 1080',
    email: 'cybercity@icicibank.com',
    description: 'Digital-first branch specializing in Home Loans, NRI banking desks, wealth management, demat services, and instant biometric KYC.',
    services_offered: JSON.stringify([
      'Home Loan & Car Loan Documentation',
      'NRI Banking Desk & Wire Transfers',
      'Wealth Management & Mutual Funds',
      'KYC Re-verification & Biometric Link',
      'Demat Account & Trading Services'
    ]),
    docs_required: JSON.stringify([
      'Aadhaar / Passport',
      'PAN Card',
      '3 Months Bank Statements',
      'Property Agreement & Sale Deed (for Home Loan)'
    ]),
    fee_info: 'Complimentary financial and mortgage consultation; Free biometric KYC.'
  },
  {
    name: 'Axis Bank – Commercial Plaza Branch',
    category: 'Bank',
    prefix: 'AXI',
    avg_minutes: 5,
    counters: 3,
    location: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    hours: 'Mon – Fri: 09:30 AM – 04:00 PM',
    phone: '1860 419 5555',
    email: 'jubilee.axis@axisbank.com',
    description: 'Full-service retail banking center offering safe deposit lockers, SME working capital desks, credit card dispute resolution, and term deposits.',
    services_offered: JSON.stringify([
      'Safe Deposit Locker Operations',
      'Credit Card Support & Limit Enhancement',
      'Current Account & GST Banking',
      'Fixed Deposits & Term Schemes',
      'Cheque Book & DD Issuance'
    ]),
    docs_required: JSON.stringify([
      'Locker Key & Customer ID Card',
      'Original PAN Card',
      'Proof of Address (Utility bill/Rent deed)'
    ]),
    fee_info: 'Free locker operations up to 12 visits/year; Zero charge for online DD requests.'
  },
  {
    name: 'Punjab National Bank (PNB) – Regional Branch',
    category: 'Bank',
    prefix: 'PNB',
    avg_minutes: 6,
    counters: 4,
    location: 'Station Road, Abids, Hyderabad, Telangana 500001',
    hours: 'Mon – Fri: 10:00 AM – 04:00 PM',
    phone: '1800 180 2222',
    email: 'abids.care@pnb.co.in',
    description: 'Trusted national bank delivering agricultural credit, Kisan Credit Cards (KCC), MSME Mudra financing, and senior citizen pensions.',
    services_offered: JSON.stringify([
      'Mudra & MSME Loan Inquiries',
      'Kisan Credit Card (KCC) Processing',
      'Senior Citizen Pension Services',
      'Deposit Schemes & Gold Loans',
      'Govt Subsidy Disbursals'
    ]),
    docs_required: JSON.stringify([
      'Aadhaar Card',
      'PAN Card / Form 60',
      'Land Ownership Record / Pattadar Passbook (for KCC)',
      '2 Passport Photos'
    ]),
    fee_info: 'Nil processing charges for micro Mudra loans up to ₹50,000.'
  },
  {
    name: 'Kotak Mahindra Bank – Business Hub',
    category: 'Bank',
    prefix: 'KTK',
    avg_minutes: 4,
    counters: 3,
    location: 'Somajiguda Circle, Raj Bhavan Road, Hyderabad, Telangana 500082',
    hours: 'Mon – Sat: 09:30 AM – 04:00 PM (2nd & 4th Sat closed)',
    phone: '1860 266 2666',
    email: 'service@kotak.com',
    description: 'Fast digital onboarding hub for Kotak 811 video/in-person full KYC completion, signature updates, and commercial business accounts.',
    services_offered: JSON.stringify([
      'Kotak 811 Full KYC Verification Desk',
      'Signature Update & Account Upgrade',
      'Debit/Credit PIN Generation Help',
      'Working Capital Loan Counter',
      'Tax Saving FD Consultation'
    ]),
    docs_required: JSON.stringify([
      'Original Physical PAN Card',
      'Aadhaar Card (linked with active phone)',
      'Signature specimen on paper'
    ]),
    fee_info: 'Zero balance 811 account upgrade is 100% free of charge.'
  },

  // ------------------- GOVERNMENT -------------------
  {
    name: 'Regional Transport Office (RTO) – Central',
    category: 'Government',
    prefix: 'RTO',
    avg_minutes: 8,
    counters: 6,
    location: 'Opp. Police Stadium, Begumpet, Hyderabad, Telangana 500016',
    hours: 'Mon – Sat: 10:00 AM – 04:30 PM (Closed 2nd Sat & Public Holidays)',
    phone: '+91 40 2331 1234',
    email: 'rto-central@transport.gov.in',
    description: 'Motor vehicle licensing and registration authority for permanent driving tests, international permits, RC transfers, and commercial fitness.',
    services_offered: JSON.stringify([
      'Driving Licence Test & Permanent DL',
      'International Driving Permit (IDP)',
      'Vehicle Ownership Transfer (RC Transfer)',
      'High Security Registration Plate (HSRP) Desk',
      'Hypothecation Addition / Removal'
    ]),
    docs_required: JSON.stringify([
      'Parivahan Application Form Printout',
      'Fee Payment Challan / Receipt',
      'Existing Learner Licence / Old DL',
      'Medical Certificate Form 1A (for Commercial / Age 40+)',
      'Vehicle Insurance & Valid PUC Certificate'
    ]),
    fee_info: 'Stated statutory government fees; 100% digital payment (no cash at counter).'
  },
  {
    name: 'Passport Seva Kendra (PSK) – Regional Hub',
    category: 'Government',
    prefix: 'PSK',
    avg_minutes: 9,
    counters: 6,
    location: 'D.No 8-2-215, Begumpet Main Road, Hyderabad, Telangana 500016',
    hours: 'Mon – Fri: 09:00 AM – 05:00 PM',
    phone: '1800 258 1800',
    email: 'rpo.hyderabad@mea.gov.in',
    description: 'Ministry of External Affairs biometric enrollment center for fresh passports, Tatkaal re-issues, minors\' passports, and police clearances (PCC).',
    services_offered: JSON.stringify([
      'Fresh Passport Application Verification',
      'Passport Re-issue & Renewal',
      'Tatkaal Fast-Track Desk',
      'Police Clearance Certificate (PCC)',
      'Minor / Child Passport Verification'
    ]),
    docs_required: JSON.stringify([
      'Original 10th Standard / Matriculation Certificate (DOB Proof)',
      'Original Aadhaar Card & Voter ID',
      'Current Proof of Address (utility bill or registered rent agreement)',
      'Passport ARN Printout',
      'Old Passport Booklet (if renewal)'
    ]),
    fee_info: 'Normal 36-page: ₹1,500; Tatkaal additional ₹2,000 pre-paid online.'
  },
  {
    name: 'Aadhaar Seva Kendra (UIDAI) – Mega Centre',
    category: 'Government',
    prefix: 'UID',
    avg_minutes: 5,
    counters: 6,
    location: 'Metro Pillar A1045, Ameerpet, Hyderabad, Telangana 500038',
    hours: 'Mon – Sun: 09:30 AM – 05:30 PM (Open 7 Days a week)',
    phone: '1947',
    email: 'help@uidai.gov.in',
    description: 'Official UIDAI operated center offering new Aadhaar enrollment, mandatory biometric updates for children (ages 5 & 15), and mobile/address corrections.',
    services_offered: JSON.stringify([
      'Mandatory Biometric Update (Age 5 & 15)',
      'Mobile Number & Email Linking',
      'Address & Demographic Correction',
      'New Child Aadhaar (Baal Aadhaar)',
      'Biometric Lock / Unlock Support'
    ]),
    docs_required: JSON.stringify([
      'Valid Proof of Identity (POI)',
      'Valid Proof of Address (POA)',
      'Child Birth Certificate (for minors)',
      'Active mobile phone for OTP confirmation'
    ]),
    fee_info: 'Mandatory Child Biometrics: Free; Demographic Update: ₹50; Biometrics: ₹100.'
  },
  {
    name: 'Greater Municipal Corporation (GHMC / Civic Centre)',
    category: 'Government',
    prefix: 'GMC',
    avg_minutes: 7,
    counters: 4,
    location: 'Tank Bund Road, Lower Tank Bund, Hyderabad, Telangana 500029',
    hours: 'Mon – Sat: 10:00 AM – 04:30 PM',
    phone: '+91 40 2111 1111',
    email: 'citizen@ghmc.gov.in',
    description: 'Civic governance hub handling property tax assessments, birth & death certificate issuance/corrections, trade licenses, and municipal grievances.',
    services_offered: JSON.stringify([
      'Property Tax Assessment & Revision',
      'Birth & Death Certificate Issuance / Correction',
      'Trade License Application & Renewal',
      'Building Permission Inquiries',
      'Civic Grievance & Water Services'
    ]),
    docs_required: JSON.stringify([
      'Property PTI Number / Document',
      'Hospital Birth/Death Record / Form 1',
      'Applicant Government ID Proof (Aadhaar)',
      'Lease Deed / NOC (for Trade License)'
    ]),
    fee_info: 'Certified certificate: ₹50 - ₹100; Property tax payment accepts debit/credit card.'
  },
  {
    name: 'Sub-Registrar Office (Registration & Stamps)',
    category: 'Government',
    prefix: 'SRO',
    avg_minutes: 12,
    counters: 3,
    location: 'Mini Secretariat Complex, Saroornagar, Hyderabad, Telangana 500035',
    hours: 'Mon – Sat: 10:30 AM – 05:00 PM',
    phone: '1800 599 4788',
    email: 'igrs-support@telangana.gov.in',
    description: 'Revenue department office for registering sale deeds, gift deeds, encumbrance certificates (EC), certified copies, and marriage registrations.',
    services_offered: JSON.stringify([
      'Sale Deed & Apartment Registration',
      'Gift & Settlement Deed Stamping',
      'Encumbrance Certificate (EC) Issuance',
      'Certified Copy of Registered Deeds',
      'Special Marriage Registration Desk'
    ]),
    docs_required: JSON.stringify([
      'Original Sale Deed with e-Challan payment proof',
      'Buyer & Seller Aadhaar and PAN Cards',
      'Two Witnesses with Original Government IDs',
      'Pattadar Passbook / Mutation Copy / RERA Certificate'
    ]),
    fee_info: 'Stamp duty and registration fees as per government market value slot receipt.'
  },

  // ------------------- COLLEGES -------------------
  {
    name: 'Central State University – Registrar & Examination Wing',
    category: 'College',
    prefix: 'UNI',
    avg_minutes: 6,
    counters: 4,
    location: 'Administrative Block, University Campus, Hyderabad, Telangana 500007',
    hours: 'Mon – Fri: 10:00 AM – 04:00 PM',
    phone: '+91 40 2709 8043',
    email: 'registrar@stateuni.ac.in',
    description: 'Academic administration center for degree certificates, official transcripts for overseas evaluation (WES), migration certificates, and grade sheet corrections.',
    services_offered: JSON.stringify([
      'Official Transcripts for WES / Overseas Studies',
      'Convocation Degree & Diploma Collection',
      'Migration & Transfer Certificate Desk',
      'Correction in Grade Card / Marksheet',
      'Semester Re-evaluation & Verification'
    ]),
    docs_required: JSON.stringify([
      'Student ID Card & Hall Ticket / Roll Number',
      'All Semester Original Consolidated Marksheets',
      'Government Photo ID (Aadhaar / Passport)',
      'University Fee Challan Receipt'
    ]),
    fee_info: 'Transcript: ₹300 per attested set; Migration Certificate: ₹250.'
  },
  {
    name: 'National Institute of Technology (NIT) – Academic Affairs Desk',
    category: 'College',
    prefix: 'NIT',
    avg_minutes: 4,
    counters: 3,
    location: 'Student Senate Building, Main Campus, Telangana 506004',
    hours: 'Mon – Fri: 09:30 AM – 04:30 PM',
    phone: '+91 870 245 9191',
    email: 'academics@nit.edu.in',
    description: 'Academic section for course registrations, National Scholarship Portal (NSP) verification, bonafide letters, hostel no-dues clearance, and internship NOCs.',
    services_offered: JSON.stringify([
      'Semester Fee Receipt & Course Registration',
      'National Scholarship Portal (NSP) Verification',
      'Bonafide & Character Certificate Issuance',
      'Hostel Allotment & Mess Clearance',
      'Internship NOC & Recommendation Letters'
    ]),
    docs_required: JSON.stringify([
      'Institute Roll Number / Student Smart Card',
      'Hostel & Library Clearance Slips',
      'Scholarship Application Printout'
    ]),
    fee_info: 'All certificates and bonafide letters are free of charge for enrolled students.'
  },
  {
    name: 'City Medical College – Academic Council & Verifications',
    category: 'College',
    prefix: 'CMC',
    avg_minutes: 5,
    counters: 2,
    location: 'Medical College Enclave, Koti, Hyderabad, Telangana 500095',
    hours: 'Mon – Fri: 10:00 AM – 03:30 PM',
    phone: '+91 40 2460 0121',
    email: 'dean@citymedcollege.ac.in',
    description: 'Medical college secretariat handling compulsory rotatory internship completion certificates, State Medical Council registrations, and PG credentials.',
    services_offered: JSON.stringify([
      'Internship Completion Certificate Desk',
      'State Medical Council Verification',
      'Elective Rotation & Clinical Postings NOC',
      'PG Stipend & Attendance Validation',
      'Alumni Credential Verification'
    ]),
    docs_required: JSON.stringify([
      'MBBS Final Year Marksheet',
      'Provisional Degree Certificate',
      'Logbook signed by Unit HODs',
      'College ID Card'
    ]),
    fee_info: 'Verification services free for students; Nominal archival retrieval fee for alumni.'
  },

  // ------------------- SUPPORT & UTILITIES -------------------
  {
    name: 'Telecom Flagship Experience Centre (5G & Fiber Hub)',
    category: 'Support',
    prefix: 'TEL',
    avg_minutes: 4,
    counters: 4,
    location: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
    hours: 'Mon – Sun: 10:00 AM – 08:30 PM (Open 7 days)',
    phone: '198',
    email: 'flagship.store@telecom.in',
    description: 'Flagship telecom experience center for instant physical SIM swap, eSIM profile downloads, broadband fiber booking, and postpaid billing disputes.',
    services_offered: JSON.stringify([
      'Instant SIM Swap & Lost SIM Replacement',
      'Physical SIM to eSIM Conversion Desk',
      'Fiber Broadband Booking & Router Swap',
      'Postpaid Plan Optimization & Bill Disputes',
      'International Roaming Activation'
    ]),
    docs_required: JSON.stringify([
      'Original Aadhaar Card for Biometric KYC',
      'Handset device for eSIM QR scan',
      'Previous bill copy (for billing disputes)'
    ]),
    fee_info: 'SIM replacement ₹50 (free for 5G upgrades); Free eSIM profile generation.'
  },
  {
    name: 'Apple Authorized Service Provider (iStore Care)',
    category: 'Support',
    prefix: 'APP',
    avg_minutes: 5,
    counters: 3,
    location: 'Level 1, Inorbit Mall, Hitec City, Hyderabad, Telangana 500081',
    hours: 'Mon – Sun: 11:00 AM – 08:00 PM',
    phone: '+91 40 4015 6789',
    email: 'support@istorecare.com',
    description: 'Certified Apple service center equipped with official diagnostics, genuine screen/battery replacements, and AppleCare+ warranty claim fulfillment.',
    services_offered: JSON.stringify([
      'iPhone Screen & Battery Replacement',
      'MacBook Hardware Diagnostics & Battery Service',
      'AppleCare+ Warranty Claims',
      'Audio / AirPods Acoustic Check',
      'Device Trade-in Assessment'
    ]),
    docs_required: JSON.stringify([
      'Device with \'Find My\' turned off (Apple ID password needed)',
      'Original Purchase Invoice (for warranty claims)',
      'Valid Photo ID'
    ]),
    fee_info: 'Free diagnostic check for active AppleCare+; Transparent parts estimate given upfront.'
  },
  {
    name: 'Samsung Smart Care Center',
    category: 'Support',
    prefix: 'SAM',
    avg_minutes: 5,
    counters: 4,
    location: 'Near Paradise Circle, MG Road, Secunderabad, Telangana 500003',
    hours: 'Mon – Sat: 10:00 AM – 07:00 PM',
    phone: '1800 40 7267864',
    email: 'support.secunderabad@samsungcare.com',
    description: 'Authorized service hub for Samsung Galaxy phones, smartwatches, tablets, and consumer audio with express same-day repair counters.',
    services_offered: JSON.stringify([
      'Galaxy Screen & Motherboard Repair',
      'Software Flashing & OS Upgrade',
      'Galaxy Watch & Buds Inspection',
      'Warranty Claim & Replacement Authorization',
      '1-Hour Express Service Counter'
    ]),
    docs_required: JSON.stringify([
      'Galaxy Device (data backup recommended)',
      'Purchase Bill / Warranty Card',
      'Government Photo ID'
    ]),
    fee_info: 'In-warranty repairs free; Standard labor schedule for out-of-warranty units.'
  },
  {
    name: 'Electricity Distribution Board (Discom Customer Center)',
    category: 'Support',
    prefix: 'ELE',
    avg_minutes: 6,
    counters: 4,
    location: 'Substation Compound, Greenlands, Begumpet, Hyderabad, Telangana 500016',
    hours: 'Mon – Sat: 09:30 AM – 04:30 PM',
    phone: '1912',
    email: 'consumergrievance@discom.gov.in',
    description: 'Power distribution company customer desk for abnormal billing disputes, meter testing requests, new domestic/commercial loads, and solar net-metering.',
    services_offered: JSON.stringify([
      'Abnormal Bill Dispute & Correction',
      'Faulty / Burnt Meter Replacement Request',
      'New Domestic & Commercial Service Connection',
      'Contracted Load Enhancement / Name Transfer',
      'Solar Net-metering Inspection Desk'
    ]),
    docs_required: JSON.stringify([
      'Latest Electricity Bill (Unique Service Number - USC)',
      'Proof of Property Ownership (Sale Deed / Municipal Tax Receipt)',
      'Applicant Aadhaar Card',
      'Wiring Test Certificate (for load enhancement)'
    ]),
    fee_info: 'Bill inspection free; Nominal meter test fee refunded if meter is found faulty.'
  },
  {
    name: 'Metro Rail Smart Card & Transit Service Hub',
    category: 'Support',
    prefix: 'MET',
    avg_minutes: 3,
    counters: 3,
    location: 'Concourse Level, Ameerpet Interchange Metro Station, Hyderabad, Telangana 500038',
    hours: 'Mon – Sun: 06:30 AM – 10:00 PM (Open Every Day)',
    phone: '+91 40 2333 2555',
    email: 'metrocare@ltmetro.com',
    description: 'Rapid transit customer service counter for metro smart cards, student concession passes, auto-topup setup, lost-and-found belongings, and card refunds.',
    services_offered: JSON.stringify([
      'Nebula Smart Card Issuance & Refund',
      'Student / Monthly Concession Pass Desk',
      'Damaged / Unreadable Card Balance Transfer',
      'Lost & Found Property Desk',
      'Metro QR & WhatsApp Ticket Support'
    ]),
    docs_required: JSON.stringify([
      'Valid Student ID with Institution Bonafide (for concessions)',
      'Damaged card (for balance transfer)',
      'Photo ID Proof'
    ]),
    fee_info: 'Smart card deposit ₹50 + ₹50 initial balance; Student monthly pass 20% discount.'
  },
  {
    name: 'Indane & Bharat LPG Gas Agency – Customer Desk',
    category: 'Support',
    prefix: 'LPG',
    avg_minutes: 4,
    counters: 3,
    location: 'Plot 45, Main Road, Dilsukhnagar, Hyderabad, Telangana 500060',
    hours: 'Mon – Sat: 09:00 AM – 05:30 PM',
    phone: '1906',
    email: 'care@indanelpg.in',
    description: 'Authorized cooking gas customer hub handling new domestic Ujjwala/regular connections, transfer vouchers (SV), biometric e-KYC, and regulator swaps.',
    services_offered: JSON.stringify([
      'New Domestic LPG Connection (Single/Double Cylinder)',
      'Address Transfer & Subscription Voucher (SV) Transfer',
      'Mandatory Biometric e-KYC Linkage',
      'Defective Regulator & Hose Replacement',
      'Direct Benefit Transfer (DBTL / PAHAL) Subsidy Desk'
    ]),
    docs_required: JSON.stringify([
      'Aadhaar Card of Applicant & Family Members',
      'Proof of Address (Electricity bill / Rent deed)',
      'Bank Passbook / Cancelled Cheque (for subsidy)',
      'Old SV Voucher (for transfers)'
    ]),
    fee_info: 'Security deposit per cylinder as per IOCL official rates; Biometric e-KYC is 100% free.'
  }
]

const sampleUsers = [
  { name: 'Rohan Sharma', email: 'rohan.sharma@example.com', phone: '+919876543210', role: 'customer' },
  { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+919876543211', role: 'customer' },
  { name: 'Aditya Reddy', email: 'aditya.reddy@example.com', phone: '+919876543212', role: 'customer' },
  { name: 'Sneha Rao', email: 'sneha.rao@example.com', phone: '+919876543213', role: 'customer' },
  { name: 'Vikram Patel', email: 'vikram.patel@example.com', phone: '+919876543214', role: 'customer' },
  { name: 'Ananya Verma', email: 'ananya.verma@example.com', phone: '+919876543215', role: 'customer' },
  { name: 'Mohammed Farhan', email: 'm.farhan@example.com', phone: '+919876543216', role: 'customer' },
  { name: 'Divya Krishnan', email: 'divya.k@example.com', phone: '+919876543217', role: 'customer' }
]

const sampleFeedback = [
  {
    servicePrefix: 'APH',
    userEmail: 'rohan.sharma@example.com',
    stars: 5,
    comment: 'OPD queue system worked wonders. Dr. Rao called me right on schedule, and ECG diagnostics took only 20 minutes.'
  },
  {
    servicePrefix: 'SBI',
    userEmail: 'priya.nair@example.com',
    stars: 5,
    comment: 'Usually SBI is super crowded, but getting a token through SkipQ made Counter 3 cash deposit a breeze!'
  },
  {
    servicePrefix: 'PSK',
    userEmail: 'aditya.reddy@example.com',
    stars: 5,
    comment: 'Tatkaal verification went smoothly. Biometrics desk was well organized and staff were courteous.'
  },
  {
    servicePrefix: 'UID',
    userEmail: 'sneha.rao@example.com',
    stars: 4,
    comment: 'Updated mobile number and biometrics for my daughter. Counter 4 was very efficient.'
  },
  {
    servicePrefix: 'HDF',
    userEmail: 'vikram.patel@example.com',
    stars: 5,
    comment: 'Forex card pickup took under 10 minutes at Counter 2. Excellent priority banking desk.'
  },
  {
    servicePrefix: 'APP',
    userEmail: 'ananya.verma@example.com',
    stars: 5,
    comment: 'Genuine iPhone battery replacement completed in 45 minutes with proper diagnostic receipt.'
  },
  {
    servicePrefix: 'CRH',
    userEmail: 'm.farhan@example.com',
    stars: 4,
    comment: 'Cardiology consultation was prompt. The digital token alert on WhatsApp was super helpful.'
  },
  {
    servicePrefix: 'RTO',
    userEmail: 'divya.krishnan@example.com',
    stars: 4,
    comment: 'Driving licence test slot called on time. Staff were helpful at Counter 2.'
  },
  {
    servicePrefix: 'UNI',
    userEmail: 'rohan.sharma@example.com',
    stars: 5,
    comment: 'Got my official transcripts attested for WES. No waiting around in long university lines.'
  },
  {
    servicePrefix: 'TEL',
    userEmail: 'priya.nair@example.com',
    stars: 5,
    comment: 'eSIM conversion took literally 3 minutes after my token was called at Counter 1.'
  },
  {
    servicePrefix: 'MET',
    userEmail: 'aditya.reddy@example.com',
    stars: 5,
    comment: 'Recharged my smart card and linked auto-debit in minutes at Ameerpet station.'
  },
  {
    servicePrefix: 'AIM',
    userEmail: 'sneha.rao@example.com',
    stars: 5,
    comment: 'AIIMS specialty clinic doctor was very thorough and pathology lab charges were virtually free.'
  },
  {
    servicePrefix: 'SAM',
    userEmail: 'vikram.patel@example.com',
    stars: 5,
    comment: 'Galaxy watch screen inspection done within 30 minutes. Express counter is very convenient.'
  },
  {
    servicePrefix: 'GMC',
    userEmail: 'ananya.verma@example.com',
    stars: 4,
    comment: 'Property tax PTI correction resolved in one visit without any bureaucratic hassle.'
  },
  {
    servicePrefix: 'RCH',
    userEmail: 'm.farhan@example.com',
    stars: 5,
    comment: 'Pediatric vaccination desk was gentle with my infant and wait time was under 10 minutes.'
  },
  {
    servicePrefix: 'ICI',
    userEmail: 'divya.krishnan@example.com',
    stars: 5,
    comment: 'Home loan documentation desk explained all stamp charges clearly. Great experience.'
  }
]

// Realistic waiting walk-in customer names to seed active queues
const sampleWalkins = [
  { prefix: 'APH', names: ['Karthik N.', 'Meera S.', 'Sunita P.'] },
  { prefix: 'AIM', names: ['Rajesh K.', 'Babu Rao', 'Laxmi T.', 'Mahesh G.'] },
  { prefix: 'CRH', names: ['Venkatesh B.', 'Anita D.'] },
  { prefix: 'SBI', names: ['Srinivas M.', 'Padma K.', 'Narasimha V.', 'Kavitha R.'] },
  { prefix: 'HDF', names: ['Abhishek G.', 'Sonia M.'] },
  { prefix: 'PSK', names: ['Tariq A.', 'Kalyan C.', 'Deepa N.', 'Siddharth R.', 'Pooja J.'] },
  { prefix: 'UID', names: ['Harish B.', 'Swapna L.', 'Naveen K.'] },
  { prefix: 'RTO', names: ['Santosh E.', 'Varun P.', 'Chaitanya D.'] },
  { prefix: 'UNI', names: ['Rahul V.', 'Divya S.'] },
  { prefix: 'TEL', names: ['Praveen T.', 'Sai Kumar'] },
  { prefix: 'APP', names: ['Akash M.'] },
  { prefix: 'MET', names: ['Tarun B.', 'Gowri K.'] }
]

module.exports = {
  realisticServices,
  sampleUsers,
  sampleFeedback,
  sampleWalkins
}
