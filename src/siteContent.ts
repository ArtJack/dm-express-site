import type { LucideIcon } from "lucide-react";
import {
  Handshake,
  KeyRound,
  ParkingCircle,
  Route,
  ShieldCheck,
  Truck,
  UsersRound,
  Wrench,
} from "lucide-react";

export const company = {
  name: "DM Express",
  registeredLocation: "Nicholasville, KY",
  registeredFullLocation: "Nicholasville, Kentucky",
  yardLocation: "Lincoln, CA",
  yardFullLocation: "Lincoln, California",
  mcNumber: `MC#${import.meta.env.VITE_COMPANY_MC_NUM ?? "1234567"}`,
  dotNumber: `DOT#${import.meta.env.VITE_COMPANY_DOT_NUM ?? "1234567"}`,
  phoneDisplay: import.meta.env.VITE_COMPANY_PHONE_DISPLAY ?? "(555) 123-4567",
  phoneHref: import.meta.env.VITE_COMPANY_PHONE_HREF ?? "tel:+15551234567",
  email: import.meta.env.VITE_COMPANY_EMAIL ?? "hello@dmexpress.example.com",
};

export const navItems = [
  { label: "Home", href: "#top" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "Brokers", href: "#brokers" },
  { label: "Yard", href: "#yard" },
  { label: "Apply", href: "#apply" },
];

export type ServiceCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

export const serviceCards: ServiceCard[] = [
  {
    icon: UsersRound,
    title: "Hiring Drivers",
    body: "Competitive pay, steady miles, and supportive dispatch.",
  },
  {
    icon: Handshake,
    title: "Owner Operators",
    body: "Great lanes, on-time pay, and business support.",
  },
  {
    icon: Route,
    title: "Dedicated Lanes",
    body: "Consistent freight and predictable home time.",
  },
  {
    icon: ParkingCircle,
    title: "Truck Parking",
    body: "Secure, well-lit parking in Lincoln, CA.",
  },
  {
    icon: Wrench,
    title: "Truck & Trailer Repair",
    body: "Fast service to minimize downtime and keep you rolling.",
  },
  {
    icon: Truck,
    title: "Trailer Rental",
    body: "Dry vans available for short or long-term needs.",
  },
  {
    icon: KeyRound,
    title: "Lease To Own",
    body: "Flexible path to ownership with real opportunity.",
  },
];

export const stats = [
  { icon: Truck, value: "10+", label: "Years in business" },
  { icon: UsersRound, value: "6", label: "Power units and growing" },
  { icon: ShieldCheck, value: "Safety", label: "Our top priority" },
];
