import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, API_BASE } from '@/services/api';
import { 
  Search, Stethoscope, MapPin,
  Star, MessageCircle, Check, Heart, Share2,
  Shield, Globe, DollarSign, Award, Users,
  Menu, X, TrendingDown, Wifi, Car,
  Calendar, Clock, Users as UsersIcon,
  ThermometerSun, Waves, Dumbbell, Utensils, ParkingCircle,
  ChevronLeft, ChevronRight, ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { allCountries } from '@/data/countries';
import { searchCountries, formatCountryCurrency } from '@/services/countrySearch';
import { procedurePriceForCountry, formatPriceRangeUSD } from '@/services/priceIntelligence';

// ==================== DATA ====================
// Full world list (ISO alpha-2 + currency). Used for country selection & currency display.
const countries = allCountries;

// Featured countries used for demo cards and richer comparison signals.
// For countries not listed here, the UI will show “Estimated / Low confidence” until providers/APIs add data.
const featuredCountries = [
  { id: 'TR', name: 'Turkey', flag: '🇹🇷', image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800', avgPrice: 1800, quality: 4.8, bestFor: 'Hair Transplant', languages: ['English', 'Arabic'], visa: 'Easy' },
  { id: 'TH', name: 'Thailand', flag: '🇹🇭', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', avgPrice: 2200, quality: 4.7, bestFor: 'Cosmetic Surgery', languages: ['English', 'Thai'], visa: 'Easy' },
  { id: 'HU', name: 'Hungary', flag: '🇭🇺', image: 'https://images.unsplash.com/photo-1489924679458-fc98ddbec472?w=800', avgPrice: 1500, quality: 4.6, bestFor: 'Dental Care', languages: ['English', 'German'], visa: 'EU' },
  { id: 'MX', name: 'Mexico', flag: '🇲🇽', image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800', avgPrice: 2000, quality: 4.5, bestFor: 'Bariatric', languages: ['English', 'Spanish'], visa: 'Easy' },
  { id: 'IN', name: 'India', flag: '🇮🇳', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', avgPrice: 1200, quality: 4.4, bestFor: 'Cardiac', languages: ['English', 'Hindi'], visa: 'Moderate' },
  { id: 'ES', name: 'Spain', flag: '🇪🇸', image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800', avgPrice: 3500, quality: 4.8, bestFor: 'IVF', languages: ['English', 'Spanish'], visa: 'EU' },
];


const clinics = [
  { id: '1', name: 'Istanbul Aesthetic Center', location: 'Istanbul, Turkey', rating: 4.8, reviews: 324, image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800', price: 1800, jci: true, iso: true, specialties: ['Hair Transplant', 'Rhinoplasty', 'Liposuction'], description: 'Leading aesthetic clinic with 15+ years experience and 50,000+ satisfied patients.', doctors: 12, patients: 50000 },
  { id: '2', name: 'Bangkok Hospital Medical Center', location: 'Bangkok, Thailand', rating: 4.9, reviews: 512, image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800', price: 2500, jci: true, iso: true, specialties: ['Gender Affirmation', 'Cardiac Surgery', 'Orthopedics'], description: 'One of Southeast Asia\'s largest private hospitals with comprehensive medical tourism services.', doctors: 150, patients: 100000 },
  { id: '3', name: 'Budapest Dental Clinic', location: 'Budapest, Hungary', rating: 4.7, reviews: 189, image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800', price: 1200, jci: false, iso: true, specialties: ['Dental Implants', 'Crowns', 'Veneers'], description: 'State-of-the-art dental clinic offering premium dental care at affordable prices.', doctors: 8, patients: 15000 },
  { id: '4', name: 'IVF Spain Barcelona', location: 'Barcelona, Spain', rating: 4.9, reviews: 267, image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800', price: 4500, jci: false, iso: true, specialties: ['IVF', 'Egg Freezing', 'Surrogacy'], description: 'Leading fertility clinic with success rates above European average.', doctors: 20, patients: 25000 },
];

const hotels = [
  { 
    id: '1', 
    name: 'Swissotel The Bosphorus', 
    location: 'Istanbul, Turkey', 
    rating: 4.8, 
    reviews: 2156, 
    stars: 5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 
    price: 120, 
    currency: 'USD',
    amenities: ['Spa', 'Pool', 'WiFi', 'Gym', 'Restaurant', 'Room Service', 'Airport Shuttle'],
    recoveryFriendly: true,
    distanceToClinic: 2.5,
    description: 'Luxury 5-star hotel overlooking the Bosphorus with dedicated recovery suites and medical support services.',
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    rooms: [
      { type: 'Recovery Suite', price: 180, features: ['Nurse on call', 'Medical bed', 'Quiet zone'] },
      { type: 'Deluxe Room', price: 120, features: ['King bed', 'Bosphorus view', 'Mini bar'] },
      { type: 'Standard Room', price: 90, features: ['Queen bed', 'City view', 'Work desk'] }
    ]
  },
  { 
    id: '2', 
    name: 'Grande Centre Point Sukhumvit', 
    location: 'Bangkok, Thailand', 
    rating: 4.7, 
    reviews: 1834, 
    stars: 5,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 
    price: 85, 
    currency: 'USD',
    amenities: ['Spa', 'Pool', 'WiFi', 'Kitchenette', 'Gym', 'Near Hospital'],
    recoveryFriendly: true,
    distanceToClinic: 1.2,
    description: 'Modern serviced residence perfect for extended stays with full kitchen facilities and proximity to top hospitals.',
    photos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
    ],
    rooms: [
      { type: 'One Bedroom Suite', price: 110, features: ['Full kitchen', 'Living room', 'Washer'] },
      { type: 'Studio', price: 85, features: ['Kitchenette', 'Work desk', 'City view'] }
    ]
  },
  { 
    id: '3', 
    name: 'Maverick Lodging Budapest', 
    location: 'Budapest, Hungary', 
    rating: 4.5, 
    reviews: 892, 
    stars: 4,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 
    price: 65, 
    currency: 'USD',
    amenities: ['Kitchenette', 'Laundry', 'WiFi', 'Near Dental District'],
    recoveryFriendly: true,
    distanceToClinic: 0.8,
    description: 'Boutique aparthotel in the heart of Budapest\'s dental district, walking distance to major clinics.',
    photos: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    rooms: [
      { type: 'Apartment', price: 75, features: ['Full kitchen', 'Living area', 'Dishwasher'] },
      { type: 'Standard Room', price: 65, features: ['Kitchenette', 'Work desk'] }
    ]
  },
  { 
    id: '4', 
    name: 'Hotel Arts Barcelona', 
    location: 'Barcelona, Spain', 
    rating: 4.9, 
    reviews: 1523, 
    stars: 5,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 
    price: 180, 
    currency: 'USD',
    amenities: ['Spa', 'Pool', 'Sea View', 'Concierge', 'WiFi', 'Gym', 'Restaurant'],
    recoveryFriendly: true,
    distanceToClinic: 3.0,
    description: 'Iconic waterfront hotel with stunning Mediterranean views and world-class spa facilities for post-treatment recovery.',
    photos: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    ],
    rooms: [
      { type: 'Sea View Suite', price: 250, features: ['Panoramic view', 'Separate living', 'Butler service'] },
      { type: 'Deluxe Room', price: 180, features: ['Sea view', 'King bed', 'Luxury bath'] }
    ]
  },
];

const tours = [
  {
    id: '1',
    name: 'Bosphorus Sunset Cruise',
    location: 'Istanbul, Turkey',
    country: 'Turkey',
    rating: 4.8,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800',
    duration: '3 hours',
    price: 45,
    currency: 'USD',
    difficulty: 'easy',
    category: 'Sightseeing',
    groupSize: 20,
    description: 'Relaxing cruise along the Bosphorus with stunning views of Istanbul\'s landmarks including Dolmabahce Palace, Rumeli Fortress, and the Bosphorus Bridge.',
    itinerary: [
      { time: '17:00', activity: 'Boarding at Eminonu Pier' },
      { time: '17:30', activity: 'Sunset cruise begins' },
      { time: '18:30', activity: 'Pass under Bosphorus Bridge' },
      { time: '19:30', activity: 'Return to pier' }
    ],
    includes: ['Professional guide', 'Welcome drink', 'Hotel pickup', 'Insurance'],
    photos: [
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800',
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800'
    ],
    recoverySuitable: true,
    bestFor: 'Post-treatment relaxation'
  },
  {
    id: '2',
    name: 'Grand Palace & Temples Tour',
    location: 'Bangkok, Thailand',
    country: 'Thailand',
    rating: 4.7,
    reviews: 567,
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800',
    duration: '4 hours',
    price: 55,
    currency: 'USD',
    difficulty: 'moderate',
    category: 'Cultural',
    groupSize: 15,
    description: 'Visit Bangkok\'s most sacred temples and the magnificent Grand Palace. Experience Thai culture and Buddhism in this immersive tour.',
    itinerary: [
      { time: '08:00', activity: 'Hotel pickup' },
      { time: '08:30', activity: 'Grand Palace & Emerald Buddha' },
      { time: '10:30', activity: 'Wat Pho (Reclining Buddha)' },
      { time: '12:00', activity: 'Return to hotel' }
    ],
    includes: ['English guide', 'Entrance fees', 'Water', 'Transport'],
    photos: [
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'
    ],
    recoverySuitable: false,
    bestFor: 'Cultural experience'
  },
  {
    id: '3',
    name: 'Budapest Thermal Bath Experience',
    location: 'Budapest, Hungary',
    country: 'Hungary',
    rating: 4.9,
    reviews: 423,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    duration: '3 hours',
    price: 35,
    currency: 'USD',
    difficulty: 'easy',
    category: 'Wellness',
    groupSize: 10,
    description: 'Healing thermal waters in historic Art Nouveau surroundings. Perfect for post-dental treatment relaxation.',
    itinerary: [
      { time: '14:00', activity: 'Meet at Szechenyi Bath' },
      { time: '14:15', activity: 'Thermal pool experience' },
      { time: '15:30', activity: 'Sauna and steam room' },
      { time: '17:00', activity: 'End of experience' }
    ],
    includes: ['Bath entry', 'Private cabin', 'Towel', 'Mineral water'],
    photos: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1489924679458-fc98ddbec472?w=800'
    ],
    recoverySuitable: true,
    bestFor: 'Post-treatment wellness'
  },
  {
    id: '4',
    name: 'Sagrada Familia & Park Guell',
    location: 'Barcelona, Spain',
    country: 'Spain',
    rating: 4.8,
    reviews: 678,
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    duration: '5 hours',
    price: 65,
    currency: 'USD',
    difficulty: 'moderate',
    category: 'Architecture',
    groupSize: 12,
    description: 'Discover Gaudi\'s masterpieces with skip-the-line access. A must-see for art and architecture lovers.',
    itinerary: [
      { time: '09:00', activity: 'Hotel pickup' },
      { time: '09:30', activity: 'Sagrada Familia guided tour' },
      { time: '11:30', activity: 'Transfer to Park Guell' },
      { time: '12:00', activity: 'Park Guell exploration' },
      { time: '14:00', activity: 'Return to hotel' }
    ],
    includes: ['Skip-the-line tickets', 'Expert guide', 'Transport', 'Radio guide'],
    photos: [
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800'
    ],
    recoverySuitable: true,
    bestFor: 'Light activity post-treatment'
  },
  {
    id: '5',
    name: 'Private Yacht Cruise',
    location: 'Antalya, Turkey',
    country: 'Turkey',
    rating: 4.9,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800',
    duration: '6 hours',
    price: 120,
    currency: 'USD',
    difficulty: 'easy',
    category: 'Luxury',
    groupSize: 8,
    description: 'Private yacht cruise along the Turquoise Coast with swimming stops and onboard lunch. Ultimate relaxation experience.',
    itinerary: [
      { time: '10:00', activity: 'Board at marina' },
      { time: '10:30', activity: 'Cruise to hidden bays' },
      { time: '12:00', activity: 'Swimming & snorkeling' },
      { time: '13:00', activity: 'Gourmet lunch onboard' },
      { time: '15:00', activity: 'Relaxation & sunbathing' },
      { time: '16:00', activity: 'Return to marina' }
    ],
    includes: ['Private yacht', 'Captain & crew', 'Gourmet lunch', 'Drinks', 'Snorkeling gear'],
    photos: [
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800',
      'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800'
    ],
    recoverySuitable: true,
    bestFor: 'Luxury recovery experience'
  },
  {
    id: '6',
    name: 'Chiang Mai Elephant Sanctuary',
    location: 'Chiang Mai, Thailand',
    country: 'Thailand',
    rating: 4.8,
    reviews: 445,
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
    duration: 'Full day',
    price: 85,
    currency: 'USD',
    difficulty: 'easy',
    category: 'Nature',
    groupSize: 12,
    description: 'Ethical elephant experience at a rescue sanctuary. Feed, bathe, and learn about these magnificent creatures.',
    itinerary: [
      { time: '08:00', activity: 'Hotel pickup' },
      { time: '09:30', activity: 'Arrive at sanctuary' },
      { time: '10:00', activity: 'Feed elephants' },
      { time: '11:00', activity: 'Mud bath with elephants' },
      { time: '12:30', activity: 'Thai lunch' },
      { time: '14:00', activity: 'River bathing' },
      { time: '15:30', activity: 'Return to hotel' }
    ],
    includes: ['Transport', 'English guide', 'Lunch', 'Photos', 'Conservation fee'],
    photos: [
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'
    ],
    recoverySuitable: true,
    bestFor: 'Gentle activity, nature therapy'
  }
];

const packages = [
  { id: '1', name: 'Istanbul Hair Transplant Package', country: 'Turkey', duration: 5, price: 2450, savings: 450, image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800', includes: ['FUE Procedure (3000 grafts)', 'Swissotel (4 nights)', 'Airport Transfers', 'Bosphorus Cruise'] },
  { id: '2', name: 'Budapest Dental Vacation', country: 'Hungary', duration: 7, price: 1850, savings: 320, image: 'https://images.unsplash.com/photo-1489924679458-fc98ddbec472?w=800', includes: ['8 Zirconia Crowns', 'Boutique Hotel (6 nights)', 'Thermal Bath', 'Airport Transfers'] },
  { id: '3', name: 'Barcelona Fertility Journey', country: 'Spain', duration: 14, price: 5200, savings: 680, image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800', includes: ['IVF Full Cycle', 'Hotel Arts (13 nights)', 'Concierge Service', 'Airport Transfers'] },
];

const testimonials = [
  { id: '1', name: 'Ahmed Hassan', location: 'Dubai, UAE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', rating: 5, procedure: 'Hair Transplant', content: 'Amazing experience! The AI assistant helped me choose the right clinic, and the results exceeded my expectations.' },
  { id: '2', name: 'Sarah Johnson', location: 'London, UK', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', rating: 5, procedure: 'Dental Crowns', content: 'I saved over £5,000 on my dental work compared to UK prices. The clinic was modern and professional.' },
  { id: '3', name: 'Mohammed Al-Rashid', location: 'Riyadh, Saudi Arabia', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', rating: 5, procedure: 'Rhinoplasty', content: 'World-class medical care combined with a tropical vacation. The platform made everything so easy.' },
];

// ==================== COMPONENTS ====================

function Navbar({ onPageChange, user, onLogout, onAuth }: { onPageChange: (page: string) => void; user: any | null; onLogout: () => void; onAuth: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button onClick={() => onPageChange('home')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1A5F7A] to-[#159895] flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient">MediTravel</span>
              <span className="text-[10px] text-gray-500 -mt-1">Global Health Tourism</span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {[
              { name: 'Home', page: 'home' },
              { name: 'Clinics', page: 'clinics' },
              { name: 'Hotels', page: 'hotels' },
              { name: 'Tours', page: 'tours' },
              { name: 'Packages', page: 'packages' },
              { name: 'Compare', page: 'compare' },
              { name: 'Countries', page: 'countries' },
              { name: 'Admin', page: 'admin' },
              { name: 'Provider', page: 'provider' },
            ].map((item) => (
              <button key={item.name} onClick={() => onPageChange(item.page)} className="text-gray-600 hover:text-[#1A5F7A] transition-colors font-medium">
                {item.name}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
  {!user ? (
    <>
      <Button variant="ghost" onClick={onAuth}>Sign In</Button>
      <Button className="btn-primary" onClick={onAuth}>Get Started</Button>
    </>
  ) : (
    <>
      <span className="text-sm text-gray-600">Hi, {user.fullName}</span>
      <Button variant="ghost" onClick={onLogout}>Logout</Button>
    </>
  )}
</div>

<button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="py-4 space-y-2">
              {['Home', 'Clinics', 'Hotels', 'Tours', 'Packages', 'Compare', 'Countries', 'Admin', 'Provider'].map((item) => (
                <button key={item} onClick={() => { onPageChange(item.toLowerCase()); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">
                  {item}
                </button>
              ))}
              <div className="border-t pt-3 mt-3">
                {!user ? (
                  <Button className="w-full btn-primary" onClick={() => { onAuth(); setIsMobileMenuOpen(false); }}>Sign In / Get Started</Button>
                ) : (
                  <Button className="w-full" variant="ghost" onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}>Logout</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection({ onPageChange }: { onPageChange: (page: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative min-h-screen gradient-hero pt-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#57C5B6]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#1A5F7A]/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)] py-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm">
              <Award className="w-5 h-5 text-[#1A5F7A]" />
              <span className="text-sm font-medium text-gray-700">#1 Medical Tourism Platform</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Journey to <span className="text-gradient">Better Health</span> Starts Here
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-xl">
                Discover world-class medical care combined with unforgettable travel experiences. Compare prices, book procedures, and plan your recovery vacation.
              </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-xl max-w-xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    placeholder="What are you looking for?"
                    className="pl-10 h-12 border-0 focus-visible:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="btn-primary h-12 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#1A5F7A]/10 to-[#57C5B6]/10 rounded-xl border border-[#1A5F7A]/20">
              <div className="w-12 h-12 rounded-full bg-[#1A5F7A] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Not sure where to start?</p>
                <p className="text-sm text-gray-600">Ask our AI Assistant for personalized recommendations</p>
              </div>
              <Button variant="outline" className="border-[#1A5F7A] text-[#1A5F7A]">Chat Now</Button>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4">
              {[{v: '50K+', l: 'Patients'}, {v: '200+', l: 'Providers'}, {v: '15', l: 'Countries'}, {v: '4.8', l: 'Rating'}].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-[#1A5F7A]">{s.v}</p>
                  <p className="text-xs md:text-sm text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800" alt="Istanbul" className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="px-3 py-1 bg-[#1A5F7A] text-white text-sm rounded-full">Featured Destination</span>
                  <h3 className="text-2xl font-bold text-white mt-2 mb-1">Istanbul, Turkey</h3>
                  <p className="text-white/80 text-sm mb-3">World leader in hair transplants</p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-white">$1,800</span>
                    <Button onClick={() => onPageChange('clinics')} className="btn-secondary">Explore</Button>
                  </div>
                </div>
              </div>
              <div className="absolute -left-8 top-20 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">JCI Accredited</p>
                    <p className="text-xs text-gray-500">50+ Hospitals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HotelCard({ hotel, onClick }: { hotel: typeof hotels[0]; onClick: () => void }) {
  return (
    <Card className="card-hover overflow-hidden cursor-pointer" onClick={onClick}>
      <div className="relative">
        <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
        {hotel.recoveryFriendly && (
          <Badge className="absolute top-3 left-3 bg-[#57C5B6]">
            <Heart className="w-3 h-3 mr-1" />
            Recovery Friendly
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 flex gap-1">
          {[...Array(hotel.stars)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          ))}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{hotel.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {hotel.location}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-sm">{hotel.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {hotel.amenities.slice(0, 4).map((a) => (
            <span key={a} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{a}</span>
          ))}
        </div>

        {hotel.distanceToClinic && (
          <p className="text-sm text-[#57C5B6] mb-2">{hotel.distanceToClinic} km from nearest clinic</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-xs text-gray-500">Per night</span>
            <p className="text-lg font-bold text-[#1A5F7A]">${hotel.price}</p>
          </div>
          <Button className="btn-primary text-sm">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HotelDetail({ hotel, onBack }: { hotel: typeof hotels[0]; onBack: () => void }) {
  const [selectedRoom, setSelectedRoom] = useState(hotel.rooms[0]);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-[#1A5F7A] mb-6">
          <ChevronLeft className="w-5 h-5" />
          Back to Hotels
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={hotel.photos[currentPhoto]} alt={hotel.name} className="w-full h-[400px] object-cover" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {hotel.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${i === currentPhoto ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setCurrentPhoto((p) => (p - 1 + hotel.photos.length) % hotel.photos.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentPhoto((p) => (p + 1) % hotel.photos.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{hotel.name}</h1>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {hotel.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{hotel.rating}</span>
                    </div>
                    <button className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {[...Array(hotel.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                  <span className="text-gray-500 ml-2">{hotel.stars}-star Hotel</span>
                </div>

                <p className="text-gray-700 mb-6">{hotel.description}</p>

                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {hotel.amenities.map((amenity) => {
                      const Icon = amenity === 'Spa' ? ThermometerSun :
                                   amenity === 'Pool' ? Waves :
                                   amenity === 'Gym' ? Dumbbell :
                                   amenity === 'WiFi' ? Wifi :
                                   amenity === 'Restaurant' ? Utensils :
                                   amenity === 'Airport Shuttle' ? Car :
                                   amenity === 'Parking' ? ParkingCircle :
                                   Check;
                      return (
                        <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                          <Icon className="w-4 h-4 text-[#1A5F7A]" />
                          {amenity}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Select Room Type</h3>
                <div className="space-y-4">
                  {hotel.rooms.map((room) => (
                    <div 
                      key={room.type}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRoom.type === room.type 
                          ? 'border-[#1A5F7A] bg-[#1A5F7A]/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{room.type}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {room.features.map((f) => (
                              <span key={f} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{f}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#1A5F7A]">${room.price}</p>
                          <p className="text-xs text-gray-500">per night</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-[#1A5F7A]">${selectedRoom.price}</p>
                    <p className="text-sm text-gray-500">per night</p>
                  </div>
                  {hotel.recoveryFriendly && (
                    <Badge className="bg-[#57C5B6]">
                      <Heart className="w-3 h-3 mr-1" />
                      Recovery Friendly
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Check-in / Check-out dates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="Check-in" />
                    <Input type="date" placeholder="Check-out" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span>Guests</span>
                  </div>
                  <select className="w-full p-2 border rounded-lg">
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">${selectedRoom.price} x 5 nights</span>
                    <span>${selectedRoom.price * 5}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service fee</span>
                    <span>$50</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-[#1A5F7A]">${selectedRoom.price * 5 + 50}</span>
                  </div>
                </div>

                <Button className="w-full btn-primary mb-3">Book Now</Button>
                <Button variant="outline" className="w-full">Contact Hotel</Button>

                {hotel.distanceToClinic && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {hotel.distanceToClinic} km from nearest clinic
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function TourCard({ tour, onClick }: { tour: typeof tours[0]; onClick: () => void }) {
  return (
    <Card className="card-hover overflow-hidden cursor-pointer" onClick={onClick}>
      <div className="relative">
        <img src={tour.image} alt={tour.name} className="w-full h-48 object-cover" />
        <Badge className="absolute top-3 left-3 bg-[#159895]">{tour.category}</Badge>
        {tour.recoverySuitable && (
          <Badge className="absolute top-3 right-3 bg-green-500">
            <Heart className="w-3 h-3 mr-1" />
            Recovery Suitable
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{tour.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {tour.location}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-sm">{tour.rating}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tour.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tour.duration}</span>
          <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4" />Max {tour.groupSize}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-xs text-gray-500">Per person</span>
            <p className="text-lg font-bold text-[#1A5F7A]">${tour.price}</p>
          </div>
          <Button className="btn-primary text-sm">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TourDetail({ tour, onBack }: { tour: typeof tours[0]; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-[#1A5F7A] mb-6">
          <ChevronLeft className="w-5 h-5" />
          Back to Tours
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={tour.image} alt={tour.name} className="w-full h-[400px] object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-[#159895]">{tour.category}</Badge>
                {tour.recoverySuitable && (
                  <Badge className="bg-green-500">
                    <Heart className="w-3 h-3 mr-1" />
                    Recovery Suitable
                  </Badge>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{tour.name}</h1>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">{tour.rating}</span>
                    <span className="text-sm text-gray-500">({tour.reviews})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#1A5F7A]" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UsersIcon className="w-4 h-4 text-[#1A5F7A]" />
                    <span>Max {tour.groupSize} people</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ThumbsUp className="w-4 h-4 text-[#1A5F7A]" />
                    <span className="capitalize">{tour.difficulty}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">{tour.description}</p>

                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4">Itinerary</h3>
                  <div className="space-y-3">
                    {tour.itinerary.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-16 text-sm font-medium text-[#1A5F7A]">{item.time}</div>
                        <div className="flex-1 pb-3 border-b">
                          <p className="text-gray-700">{item.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">What's Included</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {tour.includes.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-3xl font-bold text-[#1A5F7A]">${tour.price}</p>
                  <p className="text-sm text-gray-500">per person</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Select Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Number of People</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>1 person</option>
                      <option>2 people</option>
                      <option>3 people</option>
                      <option>4+ people</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#1A5F7A]">${tour.price}</span>
                  </div>
                </div>

                <Button className="w-full btn-primary mb-3">Book Now</Button>
                <Button variant="outline" className="w-full">Contact Guide</Button>

                {tour.recoverySuitable && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <Heart className="w-4 h-4 inline mr-1" />
                      This tour is suitable for post-treatment recovery
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelsPage({ onHotelClick }: { onHotelClick: (hotel: typeof hotels[0]) => void }) {
  const [filter, setFilter] = useState('all');

  const filteredHotels = filter === 'all' 
    ? hotels 
    : filter === 'recovery' 
    ? hotels.filter(h => h.recoveryFriendly)
    : hotels.filter(h => h.stars >= 5);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Recovery-Friendly <span className="text-gradient">Hotels</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Handpicked accommodations perfect for your post-treatment recovery, with medical support and comfort amenities.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Hotels' },
            { id: 'recovery', label: 'Recovery Friendly' },
            { id: 'luxury', label: '5-Star Luxury' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.id ? 'bg-[#1A5F7A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} onClick={() => onHotelClick(hotel)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToursPage({ onTourClick }: { onTourClick: (tour: typeof tours[0]) => void }) {
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('all');

  let filteredTours = tours;
  if (filter === 'recovery') filteredTours = tours.filter(t => t.recoverySuitable);
  if (category !== 'all') filteredTours = filteredTours.filter(t => t.category === category);

  const categories = ['all', ...Array.from(new Set(tours.map(t => t.category)))];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Recovery & Leisure <span className="text-gradient">Tours</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Carefully selected experiences perfect for your recovery period or leisure time during your medical journey.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {[
            { id: 'all', label: 'All Tours' },
            { id: 'recovery', label: 'Recovery Suitable' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.id ? 'bg-[#1A5F7A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === c ? 'bg-[#57C5B6] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} onClick={() => onTourClick(tour)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClinicsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Verified <span className="text-gradient">Clinics</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">JCI-accredited and verified healthcare providers across 15 countries.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="card-hover overflow-hidden">
              <div className="relative">
                <img src={clinic.image} alt={clinic.name} className="w-full h-48 object-cover" />
                {clinic.jci && (
                  <Badge className="absolute bottom-3 left-3 bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    JCI Accredited
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{clinic.name}</h3>
                    <p className="text-sm text-gray-500">{clinic.location}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-sm">{clinic.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {clinic.specialties.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{s}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{clinic.description}</p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <p className="text-lg font-bold text-[#1A5F7A]">${clinic.price}</p>
                  <Button className="btn-primary text-sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All-Inclusive <span className="text-gradient">Packages</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Complete medical tourism packages including procedure, hotel, transfers, and tours.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="card-hover overflow-hidden border-2 border-[#1A5F7A]/20">
              <div className="relative">
                <img src={pkg.image} alt={pkg.name} className="w-full h-56 object-cover" />
                <Badge className="absolute top-3 left-3 bg-orange-500">Featured</Badge>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white font-semibold">{pkg.duration} Days</p>
                  <p className="text-white/80 text-sm">{pkg.country}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                <div className="space-y-1 mb-4">
                  {pkg.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-lg font-bold text-[#1A5F7A]">${pkg.price}</span>
                    <span className="text-xs text-green-600 ml-2">Save ${pkg.savings}</span>
                  </div>
                  <Button className="btn-secondary text-sm">View Package</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}



function CountriesDirectoryPage({ onExplore }: { onExplore: (countryName: string) => void }) {
  const [q, setQ] = useState('');
  const results = q ? searchCountries(countries, q, 260) : countries;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Countries <span className="text-gradient">Directory</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            All countries are available from day one — with their official currency. Prices are shown as Exact or Estimated depending on available data sources.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6 bg-white p-2 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              placeholder="Search by country name, ISO code (TR), or currency (EUR, USD, Dinar...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((c) => (
            <Card key={c.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl">{c.flag}</div>
                    <div className="font-semibold mt-1">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.id}</div>
                  </div>
                  <Badge className="bg-gray-100 text-gray-700">{c.currencyCode}</Badge>
                </div>
                <div className="text-sm text-gray-600 mt-3">{formatCountryCurrency(c)}</div>

                <div className="mt-4 flex items-center justify-between">
                  <Button variant="outline" className="border-[#1A5F7A] text-[#1A5F7A]" onClick={() => onExplore(c.name)}>
                    Explore
                  </Button>
                  <span className="text-xs text-gray-500">Compare • Clinics • Hotels</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

type ProviderKind = 'Clinic' | 'Hotel' | 'Tour' | 'Transport';
type ProviderStatus = 'Pending' | 'Verified' | 'Rejected';

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'verification' | 'pricing' | 'quotes' | 'docs' | 'payouts' | 'audit'>('verification');

  const [providers, setProviders] = useState<Array<{ id: string; name: string; kind: ProviderKind; country: string; status: ProviderStatus; submittedDocs: string[]; lastUpdated: string }>>([]);

  const [quotes, setQuotes] = useState<Array<{ id: string; visitor: string; procedure: string; country: string; status: 'New' | 'In review' | 'Sent'; createdAt: string }>>([]);

  const [adminDocs, setAdminDocs] = useState<any[]>([]);
  const [adminPayouts, setAdminPayouts] = useState<any[]>([]);
  const [adminAudit, setAdminAudit] = useState<any[]>([]);


const [syncing, setSyncing] = useState(false);
const [syncError, setSyncError] = useState<string | null>(null);

const syncFromApi = async () => {
  setSyncing(true);
  setSyncError(null);
  try {
    // Pending providers (admin)
    const pending = await api.providersPending();
    setProviders(pending.map((pp: any) => ({
      id: pp.id,
      name: pp.displayName,
      kind: (pp.type === 'CLINIC' ? 'Clinic' : pp.type === 'HOTEL' ? 'Hotel' : pp.type === 'TOUR' ? 'Tour' : 'Transport') as ProviderKind,
      country: pp.countryCode,
      status: pp.verified ? 'Verified' : 'Pending',
      submittedDocs: ['Submitted via portal'],
      lastUpdated: 'Just now'
    })));

    // Quotations (admin uses /quotations/me which returns all for ADMIN)
    const qs = await api.quotationsMe();
    setQuotes(qs.map((q: any) => ({
      id: q.id,
      visitor: q.user?.fullName || 'Visitor',
      procedure: q.procedure?.name || 'Procedure',
      country: q.provider?.countryCode || '—',
      status: q.status === 'OPEN' ? 'New' : q.status === 'IN_REVIEW' ? 'In review' : 'Sent',
      createdAt: new Date(q.createdAt).toLocaleString()
    })));


    const docs = await api.adminVerificationDocs('PENDING');
    setAdminDocs(docs);

    const payouts = await api.adminPayouts();
    setAdminPayouts(payouts);

    const logs = await api.adminAuditLogs(80);
    setAdminAudit(logs);
  } catch (e: any) {
    setSyncError(e?.error || 'Failed to sync from API');
  } finally {
    setSyncing(false);
  }
};

useEffect(() => {
  syncFromApi();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



  const updateProviderStatus = async (id: string, status: ProviderStatus) => {
    try {
      await api.verifyProvider(id, { verified: status === 'Verified', note: status === 'Rejected' ? 'Rejected by admin' : undefined });
      await syncFromApi();
    } catch {
      setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, status, lastUpdated: 'Just now' } : p)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Verification, pricing rules, and quotation flow.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={syncFromApi} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync from API'}
            </Button>
            <Badge className="bg-[#1A5F7A] text-white">Admin</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'verification', label: 'Provider Verification' },
            { id: 'pricing', label: 'Pricing Rules' },
            { id: 'quotes', label: 'Health Quotations' },
            { id: 'docs', label: 'Verification Docs' },
            { id: 'payouts', label: 'Payouts' },
            { id: 'audit', label: 'Audit Log' },
            { id: 'docs', label: 'Verification Docs' },
            { id: 'payouts', label: 'Payouts' },
            { id: 'audit', label: 'Audit Log' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-[#1A5F7A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {syncError && <div className="text-sm text-red-600 mb-4">{syncError}</div>}

        {activeTab === 'verification' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Provider Verification Queue</h2>
              <div className="space-y-3">
                {providers.map((p) => (
                  <div key={p.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-600">{p.kind} • {p.country}</div>
                      <div className="text-xs text-gray-500 mt-1">Docs: {p.submittedDocs.join(', ')}</div>
                      <div className="text-xs text-gray-400 mt-1">Updated: {p.lastUpdated}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={p.status === 'Verified' ? 'bg-green-100 text-green-700' : p.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}>
                        {p.status}
                      </Badge>
                      <Button
                        disabled={p.status === 'Verified'}
                        onClick={() => updateProviderStatus(p.id, 'Verified')}
                        className="btn-secondary text-sm"
                      >
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        disabled={p.status === 'Rejected'}
                        onClick={() => updateProviderStatus(p.id, 'Rejected')}
                        className="text-sm"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Compliance note: verification must rely on provider-submitted documents and/or official partner APIs. No scraping.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'pricing' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Commission Rules</h2>
                <p className="text-sm text-gray-600 mb-4">Example rules (editable in real backend).</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Hotels</span><span className="font-semibold">10%</span></div>
                  <div className="flex justify-between"><span>Tours</span><span className="font-semibold">12%</span></div>
                  <div className="flex justify-between"><span>Health (Quotation)</span><span className="font-semibold">15%</span></div>
                  <div className="flex justify-between"><span>Transport</span><span className="font-semibold">8%</span></div>
                </div>
                <div className="mt-4">
                  <Badge className="bg-blue-50 text-blue-700">Price Intelligence Engine: Exact vs Estimated + Confidence</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Pricing Governance</h2>
                <ul className="text-sm text-gray-600 space-y-2 mt-3">
                  <li>• Exact prices only from provider listings or official APIs.</li>
                  <li>• Health final price requires clinic quotation (no instant medical booking).</li>
                  <li>• Estimated ranges must show confidence level and explanation.</li>
                  <li>• Log every price answer with source category for audit.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'quotes' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Health Quotation Requests</h2>
              <div className="space-y-3">
                {quotes.map((q) => (
                  <div key={q.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">{q.procedure}</div>
                      <div className="text-sm text-gray-600">{q.visitor} • {q.country}</div>
                      <div className="text-xs text-gray-400 mt-1">{q.createdAt}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={q.status === 'New' ? 'bg-yellow-100 text-yellow-800' : q.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                        {q.status}
                      </Badge>
                      <Button
                        onClick={() => setQuotes((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: 'In review' } : x)))}
                        className="btn-primary text-sm"
                      >
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setQuotes((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: 'Sent' } : x)))}
                        className="text-sm"
                      >
                        Mark Sent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Reminder: Health flow is quotation-based. No medical diagnosis is provided by the platform or AI.
              </p>
            </CardContent>
          </Card>
        )}


        {activeTab === 'docs' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Verification Documents Queue</h2>
              <div className="space-y-3">
                {adminDocs.map((d) => (
                  <div key={d.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">{d.provider?.displayName || 'Provider'} • {d.docType}</div>
                      <div className="text-sm text-gray-600">{d.fileName} • {new Date(d.createdAt).toLocaleString()}</div>
                      {d.provider?.user?.email && <div className="text-xs text-gray-500 mt-1">{d.provider.user.email}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">{d.status}</Badge>
                      <Button variant="outline" className="text-sm" onClick={() => {
                        window.open(`${API_BASE}/providers/admin/verification-docs/${d.id}/file`, '_blank');
                      }}>Download</Button>
                      <Button className="btn-secondary text-sm" onClick={async () => {
                        await api.adminReviewVerificationDoc(d.id, { decision: 'APPROVE' });
                        const docs = await api.adminVerificationDocs('PENDING');
                        setAdminDocs(docs);
                      }}>Approve</Button>
                      <Button variant="outline" className="text-sm" onClick={async () => {
                        const note = window.prompt('Rejection note (optional)') || undefined;
                        await api.adminReviewVerificationDoc(d.id, { decision: 'REJECT', note });
                        const docs = await api.adminVerificationDocs('PENDING');
                        setAdminDocs(docs);
                      }}>Reject</Button>
                    </div>
                  </div>
                ))}
                {!adminDocs.length && <div className="text-sm text-gray-500">No pending documents.</div>}
              </div>
              <p className="text-xs text-gray-500 mt-4">Downloads are for verification review only. All actions are audit-logged.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'payouts' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Payouts</h2>
                <Button variant="outline" onClick={async () => {
                  const list = await api.adminPayouts();
                  setAdminPayouts(list);
                }}>Refresh</Button>
              </div>

              <div className="space-y-3">
                {adminPayouts.map((p) => (
                  <div key={p.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.provider?.displayName || 'Provider'} • {(p.amountCents / 100).toFixed(2)} {p.currency}</div>
                      <div className="text-sm text-gray-600">Scheduled: {new Date(p.scheduledAt).toLocaleString()}</div>
                      {p.externalRef && <div className="text-xs text-gray-500 mt-1">Transfer: {p.externalRef}</div>}
                      {p.error && <div className="text-xs text-red-600 mt-1">Error: {p.error}</div>}
                    </div>
                    <Badge className={p.status === 'PAID' ? 'bg-green-100 text-green-700' : p.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
                {!adminPayouts.length && <div className="text-sm text-gray-500">No payouts yet.</div>}
              </div>

              <p className="text-xs text-gray-500 mt-4">In production, payouts are handled by the server cron job (no manual endpoint needed). Manual run endpoint remains for ops.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'audit' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Audit Log</h2>
                <Button variant="outline" onClick={async () => {
                  const logs = await api.adminAuditLogs(100);
                  setAdminAudit(logs);
                }}>Refresh</Button>
              </div>

              <div className="space-y-2 text-sm">
                {adminAudit.map((l) => (
                  <div key={l.id} className="border rounded-xl p-3">
                    <div className="font-semibold">{l.action}</div>
                    <div className="text-gray-600">{l.entityType} • {l.entityId || ''}</div>
                    <div className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleString()} • {l.actor?.email || 'system'}</div>
                  </div>
                ))}
                {!adminAudit.length && <div className="text-sm text-gray-500">No logs.</div>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProviderDashboardPage() {
  const [tab, setTab] = useState<'listings' | 'pricing' | 'quotes' | 'verification' | 'payments'>('listings');

  const [myStatus, setMyStatus] = useState<'Pending' | 'Verified'>('Pending');

  const [listings, setListings] = useState<Array<{ id: string; type: ProviderKind; title: string; country: string; priceFromUSD?: number; verified: boolean }>>([]);

  const [incomingQuotes, setIncomingQuotes] = useState<Array<{ id: string; procedure: string; visitor: string; budgetUSD: number; notes: string; status: 'New' | 'Replied' }>>([]);

  const [verificationDocs, setVerificationDocs] = useState<any[]>([]);
  const [docType, setDocType] = useState('Business License');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [stripeConnect, setStripeConnect] = useState<any | null>(null);
const [syncing, setSyncing] = useState(false);
const [syncError, setSyncError] = useState<string | null>(null);

const syncFromApi = async () => {
  setSyncing(true);
  setSyncError(null);
  try {
    const me = await api.me();
    setMyStatus(me?.providerProfile?.verified ? 'Verified' : 'Pending');

    const procs = await api.proceduresMe();
    setListings(procs.map((pr: any) => ({
      id: pr.id,
      type: 'Clinic',
      title: pr.name,
      country: me?.providerProfile?.countryCode || '—',
      priceFromUSD: pr.priceMinUSD,
      verified: me?.providerProfile?.verified || false
    })));

    const qs = await api.quotationsMe();
    setIncomingQuotes(qs.map((q: any) => ({
      id: q.id,
      procedure: q.procedure?.name || 'Procedure',
      visitor: q.user?.fullName || 'Visitor',
      budgetUSD: 0,
      notes: q.notes || '',
      status: q.status === 'OPEN' ? 'New' : 'Replied'
    })));

    // Verification docs + payouts + Stripe Connect status
    try {
      const docs = await api.providerVerificationDocsMe();
      setVerificationDocs(docs);
    } catch {}

    try {
      const st = await api.stripeConnectStatus();
      setStripeConnect(st);
    } catch {}

    try {
      const po = await api.providerPayouts();
      setPayouts(po);
    } catch {}

  } catch (e: any) {
    setSyncError(e?.error || 'Failed to sync from API');
  } finally {
    setSyncing(false);
  }
};

useEffect(() => {
  syncFromApi();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);



  const addListing = async () => {
    try {
      await api.procedureUpsert({ name: 'New Procedure', category: 'General', priceMinUSD: 0, priceMaxUSD: 0, description: '' });

      await syncFromApi();
    } catch {
      setListings((prev) => [
        ...prev,
        { id: `tmp-${prev.length + 1}`, type: 'Clinic', title: 'New Procedure', country: '—', priceFromUSD: undefined, verified: myStatus === 'Verified' },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Provider Dashboard</h1>
            <p className="text-gray-600">Manage listings, set prices, and respond to quotations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={syncFromApi} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync from API'}
            </Button>
            <Badge className={myStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}>
            {myStatus} Provider
          </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'listings', label: 'Listings' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'quotes', label: 'Quotations' },
            { id: 'verification', label: 'Verification Docs' },
            { id: 'payments', label: 'Payouts & Stripe' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tab === t.id ? 'bg-[#1A5F7A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {syncError && <div className="text-sm text-red-600 mb-4">{syncError}</div>}

        {tab === 'listings' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Listings</h2>
                <Button onClick={addListing} className="btn-secondary text-sm">Add Listing</Button>
              </div>
              <div className="space-y-3">
                {listings.map((l) => (
                  <div key={l.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">{l.title}</div>
                      <div className="text-sm text-gray-600">{l.type} • {l.country}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={l.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}>
                        {l.verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Button variant="outline" className="text-sm" onClick={() => setListings((prev) => prev.filter((x) => x.id !== l.id))}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'pricing' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Set Price Ranges</h2>
              <p className="text-sm text-gray-600 mb-4">
                Exact prices are sourced from your listings. For health, you can publish "Starting from" and handle final price via quotation.
              </p>

              <div className="space-y-3">
                {listings.map((l) => (
                  <div key={l.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">{l.title}</div>
                      <div className="text-sm text-gray-600">{l.country}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        value={l.priceFromUSD?.toString() ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          setListings((prev) => prev.map((x) => (x.id === l.id ? { ...x, priceFromUSD: val } : x)));
                        }}
                        placeholder="From (USD)"
                        className="w-36"
                      />
                      <Button className="btn-primary text-sm" onClick={async () => {
                        const min = Number(l.priceFromUSD || 0);
                        const max = Math.max(min, Math.round(min * 1.3));
                        try {
                          await api.procedureUpsert({ id: l.id.startsWith('tmp-') ? undefined : l.id, name: l.title, category: 'General', priceMinUSD: min, priceMaxUSD: max, description: '' });
                          await syncFromApi();
                        } catch (e) {
                          console.error(e);
                        }
                      }}>Save</Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Prices must be truthful and reflect real provider offerings. Estimated ranges shown to visitors are generated by the platform when exact data is missing.
              </p>
            </CardContent>
          </Card>
        )}

        {tab === 'quotes' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Incoming Quotation Requests</h2>
              <div className="space-y-3">
                {incomingQuotes.map((q) => (
                  <div key={q.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">{q.procedure}</div>
                      <div className="text-sm text-gray-600">{q.visitor} • Budget ${q.budgetUSD.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-1">{q.notes}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={q.status === 'New' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}>
                        {q.status}
                      </Badge>
                      <Button className="btn-secondary text-sm">Reply</Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Replying to quotations should never include medical diagnosis. Provide pricing, inclusions, and required in-person evaluation steps.
              </p>
            </CardContent>
          </Card>
        )}

        {tab === 'verification' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Verification Documents</h2>
              <p className="text-sm text-gray-600 mb-4">Upload legal verification documents (KYC). Admin reviews them and every action is logged (audit).</p>

              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="Document type" />
                <Input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                <Button className="btn-primary" onClick={async () => {
                  if (!docFile) return;
                  try {
                    await api.uploadProviderVerificationDoc(docType, docFile);
                    setDocFile(null);
                    const docs = await api.providerVerificationDocsMe();
                    setVerificationDocs(docs);
                  } catch (e) {
                    console.error(e);
                  }
                }}>Upload</Button>
              </div>

              <div className="space-y-3">
                {verificationDocs.map((d) => (
                  <div key={d.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-semibold">{d.docType}</div>
                      <div className="text-sm text-gray-600">{d.fileName} • {new Date(d.createdAt).toLocaleString()}</div>
                      {d.reviewNote && <div className="text-xs text-gray-500 mt-1">Note: {d.reviewNote}</div>}
                    </div>
                    <Badge className={d.status === 'APPROVED' ? 'bg-green-100 text-green-700' : d.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}>
                      {d.status}
                    </Badge>
                  </div>
                ))}
                {!verificationDocs.length && <div className="text-sm text-gray-500">No docs uploaded yet.</div>}
              </div>

              <p className="text-xs text-gray-500 mt-4">No scraping. Verification relies on provider-submitted documents and official partner data only.</p>
            </CardContent>
          </Card>
        )}

        {tab === 'payments' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Stripe Connect</h2>
                <p className="text-sm text-gray-600 mb-4">To receive marketplace payouts, complete Stripe Connect onboarding.</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Connect enabled</span><span className="font-semibold">{stripeConnect?.stripeConnectEnabled ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span>Account</span><span className="font-semibold">{stripeConnect?.stripeAccountId || '—'}</span></div>
                  <div className="flex justify-between"><span>Charges enabled</span><span className="font-semibold">{stripeConnect?.stripeChargesEnabled ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span>Payouts enabled</span><span className="font-semibold">{stripeConnect?.stripePayoutsEnabled ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span>Details submitted</span><span className="font-semibold">{stripeConnect?.stripeDetailsSubmitted ? 'Yes' : 'No'}</span></div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="btn-secondary" onClick={async () => {
                    try {
                      await api.stripeConnectCreateAccount();
                      const link = await api.stripeConnectOnboardingLink();
                      window.open(link.url, '_blank');
                      const st = await api.stripeConnectStatus();
                      setStripeConnect(st);
                    } catch (e) {
                      console.error(e);
                    }
                  }}>Start / Continue Onboarding</Button>
                  <Button variant="outline" onClick={async () => {
                    const st = await api.stripeConnectStatus();
                    setStripeConnect(st);
                  }}>Refresh Status</Button>
                </div>

                <p className="text-xs text-gray-500 mt-4">If Stripe Connect is disabled, payouts will not be executed automatically.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payouts</h2>
                <div className="space-y-3">
                  {payouts.map((p) => (
                    <div key={p.id} className="border rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{(p.amountCents / 100).toFixed(2)} {p.currency}</div>
                        <Badge className={p.status === 'PAID' ? 'bg-green-100 text-green-700' : p.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}>{p.status}</Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Scheduled: {new Date(p.scheduledAt).toLocaleString()}</div>
                      {p.externalRef && <div className="text-xs text-gray-500">Ref: {p.externalRef}</div>}
                      {p.error && <div className="text-xs text-red-600">Error: {p.error}</div>}
                    </div>
                  ))}
                  {!payouts.length && <div className="text-sm text-gray-500">No payouts yet.</div>}
                </div>
                <Button variant="outline" className="mt-4" onClick={async () => {
                  const po = await api.providerPayouts();
                  setPayouts(po);
                }}>Refresh Payouts</Button>
              </CardContent>
            </Card>
          </div>
        )}


      </div>
    </div>
  );
}


function ComparePage({ initialCountries }: { initialCountries?: string[] }) {
  // Store selected as ISO codes for stability
  const initialIds = (initialCountries ?? ['Turkey', 'Thailand'])
    .map((n) => countries.find((c) => c.name === n)?.id)
    .filter(Boolean) as string[];

  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>(initialIds.length ? initialIds : ['TR', 'TH']);
  const [selectedProcedure, setSelectedProcedure] = useState('Hair Transplant');
  const [countryQuery, setCountryQuery] = useState('');

  useEffect(() => {
    if (initialCountries && initialCountries.length >= 1) {
      const ids = initialCountries
        .map((n) => countries.find((c) => c.name === n)?.id)
        .filter(Boolean) as string[];
      if (ids.length) setSelectedCountryIds(ids.slice(0, 3));
    }
  }, [initialCountries?.join('|')]);

  const procedures = ['Hair Transplant', 'Rhinoplasty', 'Dental Crown', 'IVF Cycle', 'Gastric Sleeve'];

  const toggleCountry = (countryId: string) => {
    if (selectedCountryIds.includes(countryId)) {
      setSelectedCountryIds(selectedCountryIds.filter((c) => c !== countryId));
    } else if (selectedCountryIds.length < 3) {
      setSelectedCountryIds([...selectedCountryIds, countryId]);
    }
  };

  const featuredAvgByCountryName: Record<string, number | undefined> = Object.fromEntries(
    featuredCountries.map((c) => [c.name, c.avgPrice])
  );

  const visibleCountries = countryQuery
    ? searchCountries(countries, countryQuery, 60)
    : countries.slice(0, 30);

  const selectedCountries = selectedCountryIds
    .map((id) => countries.find((c) => c.id === id))
    .filter((c): c is (typeof countries)[number] => Boolean(c));

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Compare <span className="text-gradient">Countries & Prices</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Legal, transparent comparison. Prices are shown as <b>Exact</b> (provider data) or <b>Estimated</b> with a confidence level.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">Select Procedure</p>
          <div className="flex flex-wrap justify-center gap-2">
            {procedures.map((proc) => (
              <button
                key={proc}
                onClick={() => setSelectedProcedure(proc)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedProcedure === proc ? 'bg-[#1A5F7A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {proc}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-sm border">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <Input
                placeholder="Search country by name, ISO code (e.g., TR), or currency (e.g., EUR)..."
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                className="border-0 focus-visible:ring-0"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Tip: you can search by <b>currency</b> too (EUR, USD, Dinar, etc.). Select up to 3 countries.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 max-h-[180px] overflow-auto py-2">
            {visibleCountries.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleCountry(c.id)}
                disabled={!selectedCountryIds.includes(c.id) && selectedCountryIds.length >= 3}
                title={formatCountryCurrency(c)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedCountryIds.includes(c.id)
                    ? 'bg-[#57C5B6] text-white border-[#57C5B6]'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <span>{c.flag}</span>
                {c.name}
                <span className="text-xs opacity-70">({c.id})</span>
              </button>
            ))}
          </div>
        </div>

        {selectedCountries.length >= 2 && (
          <Card className="overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left">Metric</th>
                    {selectedCountries.map((country) => (
                      <th key={country.id} className="px-6 py-4 text-center">
                        <span className="text-2xl block">{country.flag}</span>
                        <span className="font-semibold">{country.name}</span>
                        <div className="text-xs text-gray-500">{country.currencyCode}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4 font-medium">
                      {selectedProcedure} price
                      <div className="text-xs text-gray-500">Exact vs Estimated</div>
                    </td>
                    {selectedCountries.map((country) => {
                      const featured = featuredCountries.find((c) => c.name === country.name);
                      const res = procedurePriceForCountry({
                        procedure: selectedProcedure,
                        country,
                        providerPricesUSD: undefined,
                        ctx: { featuredAvgByCountryName },
                      });

                      return (
                        <td key={country.id} className="px-6 py-4 text-center">
                          <div className="font-bold text-lg text-[#1A5F7A]">{formatPriceRangeUSD(res)}</div>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <Badge className={res.kind === 'EXACT' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}>
                              {res.kind}
                            </Badge>
                            <span className="text-xs text-gray-500">{res.confidence} confidence</span>
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1 max-w-[220px] mx-auto">{res.note}</div>
                          {featured?.avgPrice ? null : (
                            <div className="text-[11px] text-gray-400 mt-1">Final price requires clinic quotation.</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="px-6 py-4 font-medium">Quality Score</td>
                    {selectedCountries.map((country) => {
                      const featured = featuredCountries.find((c) => c.name === country.name);
                      return (
                        <td key={country.id} className="px-6 py-4 text-center">
                          {featured?.quality ? (
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{featured.quality}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="px-6 py-4 font-medium">Best For</td>
                    {selectedCountries.map((country) => {
                      const featured = featuredCountries.find((c) => c.name === country.name);
                      return <td key={country.id} className="px-6 py-4 text-center">{featured?.bestFor ?? '—'}</td>;
                    })}
                  </tr>

                  <tr>
                    <td className="px-6 py-4 font-medium">Languages</td>
                    {selectedCountries.map((country) => {
                      const featured = featuredCountries.find((c) => c.name === country.name);
                      return (
                        <td key={country.id} className="px-6 py-4 text-center">
                          {featured?.languages?.length ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {featured.languages.map((l) => (
                                <span key={l} className="text-xs px-2 py-1 bg-gray-100 rounded">{l}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="px-6 py-4 font-medium">Visa</td>
                    {selectedCountries.map((country) => {
                      const featured = featuredCountries.find((c) => c.name === country.name);
                      return (
                        <td key={country.id} className="px-6 py-4 text-center">
                          {featured?.visa ? (
                            <Badge className={featured.visa === 'Easy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {featured.visa}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Transparent Pricing</p>
                <p className="font-semibold text-green-800">Exact vs Estimated</p>
                <p className="text-sm text-green-600">Confidence shown</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Legal Sources Only</p>
                <p className="font-semibold text-blue-800">No Scraping</p>
                <p className="text-sm text-blue-600">API / Providers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Health Reality</p>
                <p className="font-semibold text-purple-800">Quotation-based</p>
                <p className="text-sm text-purple-600">Final price by clinic</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


function FeaturesSection() {
  const features = [
    { icon: Shield, title: 'Verified Providers', desc: 'Every clinic is thoroughly vetted with document verification', color: 'bg-green-100 text-green-600' },
    { icon: Globe, title: '15+ Countries', desc: 'Access world-class healthcare across top destinations', color: 'bg-blue-100 text-blue-600' },
    { icon: DollarSign, title: 'Transparent Pricing', desc: 'See exact or estimated prices with confidence indicators', color: 'bg-yellow-100 text-yellow-600' },
    { icon: MessageCircle, title: 'AI Assistant', desc: 'Get instant answers and personalized recommendations', color: 'bg-purple-100 text-purple-600' },
    { icon: Award, title: 'JCI Accredited', desc: 'Partner with internationally accredited hospitals', color: 'bg-[#1A5F7A]/10 text-[#1A5F7A]' },
    { icon: Users, title: '50K+ Patients', desc: 'Join thousands of satisfied medical tourists', color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-gradient">MediTravel</span>?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We've built the most comprehensive platform for medical tourism.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all">
              <div className={`w-14 h-14 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories from <span className="text-gradient">Real Patients</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="border-2 border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-gray-700 mb-4">"{t.content}"</p>
                <Badge className="bg-green-100 text-green-700"><Check className="w-3 h-3 mr-1" />Verified</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1a3a47] text-white">
      <div className="border-b border-white/10">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Get Medical Travel Tips</h3>
              <p className="text-white/70">Subscribe for exclusive deals and destination guides.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Input placeholder="Enter your email" className="bg-white/10 border-white/20 text-white w-full md:w-80" />
              <Button className="btn-secondary">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container-custom py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#57C5B6] flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">MediTravel</span>
            </div>
            <p className="text-white/70 text-sm mb-6">Your trusted platform for medical tourism.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {['Clinics', 'Hotels', 'Tours', 'Packages'].map((l) => (
                <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Procedures</h4>
            <ul className="space-y-2">
              {['Hair Transplant', 'Dental Care', 'Cosmetic Surgery', 'IVF'].map((l) => (
                <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Contact Us', 'Privacy Policy'].map((l) => (
                <li key={l}><a href="#" className="text-sm text-white/70 hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <p className="text-sm text-white/60 text-center">&copy; 2025 MediTravel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================

function AuthPage({ onDone }: { onDone: () => void }) {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'USER' | 'PROVIDER'>('USER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (auth.user) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Sign in</h2>
        <p className="text-gray-600 mb-6">Use the demo accounts (see README) or create a new one.</p>

        <div className="flex gap-2 mb-4">
          <Button variant={mode === 'login' ? 'default' : 'ghost'} onClick={() => setMode('login')}>Login</Button>
          <Button variant={mode === 'register' ? 'default' : 'ghost'} onClick={() => setMode('register')}>Register</Button>
        </div>

        {mode === 'register' && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="text-sm text-gray-600">Role</label>
              <div className="flex gap-2 mt-1">
                <Button variant={role === 'USER' ? 'default' : 'ghost'} onClick={() => setRole('USER')}>User</Button>
                <Button variant={role === 'PROVIDER' ? 'default' : 'ghost'} onClick={() => setRole('PROVIDER')}>Provider</Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Full name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <Button className="w-full btn-primary" onClick={async () => {
            setErr(null);
            try {
              if (mode === 'login') {
                await auth.login(email, password);
              } else {
                await auth.register(fullName || 'New User', email, password, role);
              }
            } catch (e: any) {
              setErr(e?.error || 'Authentication failed');
            }
          }}>
            Continue
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Tip: After you login, go to Admin/Provider pages from the menu.
        </div>
      </Card>
    </div>
  );
}

function App() {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<typeof hotels[0] | null>(null);
  const [selectedTour, setSelectedTour] = useState<typeof tours[0] | null>(null);
  const [compareInitCountries, setCompareInitCountries] = useState<string[] | undefined>(undefined);

  const renderPage = () => {
    if (showAuth) {
      return <AuthPage onDone={() => setShowAuth(false)} />;
    }

    if (selectedHotel) {
      return <HotelDetail hotel={selectedHotel} onBack={() => setSelectedHotel(null)} />;
    }
    if (selectedTour) {
      return <TourDetail tour={selectedTour} onBack={() => setSelectedTour(null)} />;
    }

    switch (currentPage) {
      case 'home':
        return (
          <>
            <HeroSection onPageChange={setCurrentPage} />
            <div id="clinics"><ClinicsPage /></div>
            <HotelsPage onHotelClick={setSelectedHotel} />
            <ToursPage onTourClick={setSelectedTour} />
            <PackagesPage />
            <ComparePage initialCountries={compareInitCountries} />
            <FeaturesSection />
            <TestimonialsSection />
          </>
        );
      case 'clinics': return <ClinicsPage />;
      case 'hotels': return <HotelsPage onHotelClick={setSelectedHotel} />;
      case 'tours': return <ToursPage onTourClick={setSelectedTour} />;
      case 'packages': return <PackagesPage />;
      case 'compare': return <ComparePage initialCountries={compareInitCountries} />;

      case 'countries':
        return (
          <CountriesDirectoryPage
            onExplore={(countryName) => {
              // Pre-fill compare with selected country + a strong baseline destination
              const fallback = countryName === 'Turkey' ? 'Thailand' : 'Turkey';
              setCompareInitCountries([countryName, fallback]);
              setCurrentPage('compare');
            }}
          />
        );
      case 'admin':
        if (!auth.user || auth.user.role !== 'ADMIN') return <AuthPage onDone={() => setCurrentPage('admin')} />;
        return <AdminDashboardPage />;
      case 'provider':
        if (!auth.user || auth.user.role !== 'PROVIDER') return <AuthPage onDone={() => setCurrentPage('provider')} />;
        return <ProviderDashboardPage />;
      default: return <HeroSection onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onPageChange={setCurrentPage} user={auth.user} onLogout={auth.logout} onAuth={() => setShowAuth(true)} />
      <main>{renderPage()}</main>
      {currentPage === 'home' && <Footer />}
    </div>
  );
}

export default App;
