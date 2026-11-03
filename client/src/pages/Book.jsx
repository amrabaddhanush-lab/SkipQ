import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Stethoscope, Landmark, Building2, GraduationCap, Headphones, Ticket,
  MapPin, Clock, Phone, Mail, FileText, CheckCircle2,
  Info, X, CheckSquare, Square, Search
} from 'lucide-react'
import { api } from '../lib/api'
import { useLive } from '../lib/uselive'
import { Button, Card } from '../components/ui'
import { Stars } from '../components/stars'
import WhatsAppIcon from '../components/WhatsAppIcon'
export default Book;