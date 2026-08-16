import { PresetDog } from '../types';

export const PRESET_DOGS: PresetDog[] = [
  {
    id: 'preset-husky',
    name: 'Apollo',
    breed: 'Siberian Husky',
    imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&q=80',
    suggestedPersonality: 'dramatic-diva',
    description: 'Dramatic side-eye and vocal courtroom-level indignation.',
  },
  {
    id: 'preset-golden',
    name: 'Barnaby',
    breed: 'Golden Retriever',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    suggestedPersonality: 'excited-puppy',
    description: '100% joyful innocence with slight dental shoe-theft intent.',
  },
  {
    id: 'preset-frenchie',
    name: 'Winston',
    breed: 'French Bulldog',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    suggestedPersonality: 'regal-aristocrat',
    description: 'Judging household economics from atop the velvet pillow.',
  },
  {
    id: 'preset-pug',
    name: 'Noodle',
    breed: 'Pug',
    imageUrl: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80',
    suggestedPersonality: 'anxious-overthinker',
    description: 'Existential crisis triggered by the mail carrier opening the slot.',
  },
  {
    id: 'preset-corgi',
    name: 'Boba',
    breed: 'Pembroke Welsh Corgi',
    imageUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=800&q=80',
    suggestedPersonality: 'chill-bro',
    description: 'Sploot posture on cool hardwood, completely unbothered.',
  },
  {
    id: 'preset-shepherd',
    name: 'Detective Shadow',
    breed: 'German Shepherd',
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
    suggestedPersonality: 'undercover-detective',
    description: 'Intense perimeter surveillance and squirrel intelligence unit.',
  },
];

export interface PresetPackScenario {
  id: string;
  title: string;
  dogs: string;
  imageUrl: string;
  description: string;
}

export const PRESET_PACKS: PresetPackScenario[] = [
  {
    id: 'pack-huskies-debate',
    title: 'The Howling Council',
    dogs: 'Two Siberian Huskies',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    description: 'Vocal confrontation over whose turn it is to initiate the 6 AM neighborhood siren aria.',
  },
  {
    id: 'pack-retriever-corgi',
    title: 'The Tennis Ball Standoff',
    dogs: 'Golden Retriever & Welsh Corgi',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    description: 'High-stakes diplomatic summit concerning who dropped the soggy tennis ball.',
  },
  {
    id: 'pack-couch-territory',
    title: 'The Sunbeam Sovereignty Crisis',
    dogs: 'French Bulldog & Pug',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    description: 'Tense negotiation as the carpet sunbeam shifts 4 inches south.',
  },
  {
    id: 'pack-treat-conspiracy',
    title: 'The Kitchen Floor Task Force',
    dogs: 'Beagle & Shepherd',
    imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
    description: 'Two detectives analyzing crumbs fallen during human sandwich preparation.',
  },
];
