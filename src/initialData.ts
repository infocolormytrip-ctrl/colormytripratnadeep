import { TravelPackage, BlogPost, Review, VideoTestimonial, OfferMarqueeItem } from './types';

export const initialPackages: TravelPackage[] = [
  {
    id: 'sikkim-silk-route',
    title: 'Sikkim Old Silk Route Adventure',
    description: 'Travel through the historical silk trade route. Breathtaking views of Mt. Kanchenjunga, clear mountain lakes, and deep valleys. Explore Gangtok, Zuluk, and Lungthung.',
    category: 'domestic',
    price: 9500,
    duration: '4 Days / 3 Nights',
    location: 'Sikkim, East India',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Arrival at NJP/Siliguri & drive to Zuluk via Rongli. Check in at homestay and enjoy local sunset.',
      'Day 2: Morning ride to Thumbi View Point, Gnathang Valley, Kupup Lake (Elephant Lake), and Baba Mandir. Night stay at Padamchen.',
      'Day 3: Journey to Gangtok via Tsomgo Lake. Spend the evening walking around MG Marg.',
      'Day 4: Gangtok local sightseeing (Rumtek Monastery, Ropeway) & departure back to NJP/Bagdogra.'
    ],
    inclusions: [
      'Standard homestay accommodation on triple-sharing basis',
      'All meals (Breakfast, Lunch, Dinner - delicious local organic food)',
      'Shared Non-AC vehicle (Bolero/Sumo) for transit & sightseeing',
      'Permits and entry fees for restricted areas'
    ],
    exclusions: [
      'Train or Flight tickets',
      'Personal expenses (laundry, beverages, tips)',
      'Any extra meals or beverages ordered separately',
      'Travel Insurance'
    ],
    featured: true
  },
  {
    id: 'kashmir-paradise',
    title: 'Kashmir Paradise Tour',
    description: 'Immerse yourself in the jewel of India. Glide on the tranquil waters of Dal Lake in a Shikara, visit Gulmarg snow valleys, and stroll across Pahalgam meadows.',
    category: 'domestic',
    price: 14500,
    duration: '6 Days / 5 Nights',
    location: 'Kashmir, India',
    image: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Arrival at Srinagar Airport. Transfer to a classic wooden Houseboat. Evening Shikara ride on Dal Lake.',
      'Day 2: Day trip to Sonamarg (Meadow of Gold). Enjoy optional pony ride to Thajiwas Glacier. Back to Srinagar.',
      'Day 3: Drive to Gulmarg (Meadow of Flowers). Experience the high-altitude Gondola cable car ride. Overnight in Gulmarg.',
      'Day 4: Travel from Gulmarg to Pahalgam (Valley of Shepherds). Enroute visit Saffron fields & Awantipora ruins.',
      'Day 5: Pahalgam local sightseeing (Aru Valley, Betaab Valley & Chandanwari). Evening return to Srinagar.',
      'Day 6: Early morning Srinagar Mughal Gardens tour & transfer to Srinagar Airport for departure.'
    ],
    inclusions: [
      '1 Night stay in Premium Houseboat, 4 Nights in 3-star Hotels',
      'MAPI plan (Daily Breakfast and Dinner included)',
      'Private AC Sedan vehicle (Dzire/Etios) for all transfers',
      '1 Hour complimentary Shikara ride'
    ],
    exclusions: [
      'Gondola ride tickets (can be pre-booked online)',
      'Local internal union vehicles in Pahalgam and Sonamarg',
      'Pony rides or camera fees',
      'Lunch and beverages'
    ],
    featured: true
  },
  {
    id: 'andaman-getaway',
    title: 'Andaman Islands Beach Escapade',
    description: 'Relax on the absolute finest beaches of Southern Asia. Swim with colorful coral reefs in Havelock, explore historical Cell Jail in Port Blair, and visit Neil Island.',
    category: 'domestic',
    price: 21000,
    duration: '5 Days / 4 Nights',
    location: 'Andaman & Nicobar Islands',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Arrival at Port Blair Airport. Visit historically famous Cellular Jail & experience the poignant Light and Sound show.',
      'Day 2: Morning cruise to Havelock Island (Swaraj Dweep). Visit world-renowned Radhanagar Beach (Asia\'s cleanest beach).',
      'Day 3: Day trip to Elephant Beach for water activities (Snorkeling, Glass Bottom boat ride, Jet ski). Overnight at Havelock.',
      'Day 4: Take cruise to Neil Island (Shaheed Dweep). Visit Laxmanpur beach & Natural Coral Bridge. Evening return cruise to Port Blair.',
      'Day 5: Check-out and drop at Port Blair airport for onward return flight.'
    ],
    inclusions: [
      'Standard resort accommodation in Port Blair and Havelock',
      'Daily breakfast buffet',
      'Inter-island transfers via luxury high-speed catamaran ferry (Nautika/Makruzz)',
      'Private air-conditioned vehicle for airport and jetty pick-and-drops'
    ],
    exclusions: [
      'Air tickets to/from Port Blair',
      'Water sports charges like Scuba diving or Sea walk',
      'Lunch, dinner and all personal items',
      'Tour guides (available at attractions on direct pay)'
    ],
    featured: false
  },
  {
    id: 'bali-nusa-penida',
    title: 'Explore Bali & Nusa Penida',
    description: 'From spiritual temples and cultural dances in Ubud to breathtaking ocean cliffs in Nusa Penida. The perfect blend of relaxation, adventure, and vibrant island culture.',
    category: 'international',
    price: 34000,
    duration: '6 Days / 5 Nights',
    location: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Welcome to Denpasar Airport. Warm meetup & transfer to Ubud private resort. Evening leisure.',
      'Day 2: Balinese cultural tour (Barong Dance, Kintamani Volcano view, Tegalalang Rice Terraces, Ubud Palace).',
      'Day 3: Ubud swings and Tirta Empul holy spring water purification ritual. Afternoon transfer to Kuta beach-side hotel.',
      'Day 4: Take morning speed boat to Nusa Penida. Visit Kelingking iconic cliff, Broken Beach, and Angel Billabong.',
      'Day 5: Sunset trip to Uluwatu Temple overlooking ocean cliffs. Watch original Kecak Fire Dance.',
      'Day 6: Final Balinese shopping spree & transfer to airport for departure flight.'
    ],
    inclusions: [
      '5 Nights hotel stay (Ubud private villa & Kuta beach resort)',
      'Breakfast every morning',
      'All local ground transfers with private tour guide and AC car',
      'Nusa Penida speed boat tickets and island tour costs'
    ],
    exclusions: [
      'International flights',
      'Indonesian Visa on Arrival (approx $35 USD) & tourist tax',
      'Meals not specified in the plan',
      'Gratuities and tips to driver/guide'
    ],
    featured: true
  },
  {
    id: 'bhutan-cultural',
    title: 'Magical Bhutan Cultural Tour',
    description: 'Enter the land of happiness. Visit Paro, Thimphu, and Punakha. Trek up to the Tiger\'s Nest Monastery perched precariously on a sheer cliff 900 meters above the valley.',
    category: 'international',
    price: 28500,
    duration: '5 Days / 4 Nights',
    location: 'Bhutan',
    image: 'https://images.unsplash.com/photo-1548141267-42721f456108?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Capture flight into stunning Paro Valley or take roadway from Jaigaon/Phuentsholing. Drive to Thimphu capital city.',
      'Day 2: Thimphu sightseeing (Buddha Dordenma 169ft tall bronze statue, Motithang Takin Preserve, Simply Bhutan Heritage Museum, Tashichho Dzong).',
      'Day 3: Drive over high Dochula Pass (108 stupas) to Punakha. Visit Punakha Dzong, the most beautiful fortress in Bhutan.',
      'Day 4: Drive back to Paro and embark on the scenic trek to Taktsang Monastery (Tiger\'s Nest). Enjoy traditional stone bath.',
      'Day 5: Breakfast, brief Paro market shopping, and drive to airport/border for final departure.'
    ],
    inclusions: [
      'Bhutan standard 3-star rated hotel accommodation',
      'All meals daily (Breakfast, traditional Buffet Lunch, Dinner)',
      'Bhutan sustainable development fee (SDF) of $100/night (included if applicable / special rates for SAARC)',
      'Highly professional Bhutanese English-speaking guide and SUV car'
    ],
    exclusions: [
      'Flight tickets to Paro',
      'Personal laundry, alcoholic beverages',
      'Tiger\'s Nest horse rides (optional)',
      'Airport taxes'
    ],
    featured: true
  },
  {
    id: 'thailand-highlights',
    title: 'Thailand Highlights Tour',
    description: 'Explore the energetic capital of Bangkok paired with pristine tropical beaches of Phuket. Go island hopping to Phi Phi Islands and taste scrumptious local street food.',
    category: 'international',
    price: 22500,
    duration: '5 Days / 4 Nights',
    location: 'Thailand',
    image: 'https://images.unsplash.com/photo-1528181304800-2f1702422a53?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Land in Phuket. Check in at beach hotel. Relax along Patong beach & witness famous nightlife.',
      'Day 2: Spectacular Phi Phi Islands tour by luxury speedboat. Enjoy snorkeling and buffet lunch along the beach.',
      'Day 3: Morning domestic flight to Bangkok. Afternoon tour of ancient Golden Buddha & Marble Temple.',
      'Day 4: Free day for shopping in Bangkok (Pratunam, MBK Center, Siam Paragon) or optional Chao Phraya Dinner Cruise.',
      'Day 5: Check-out and drop at Suvarnabhumi Airport for return flight.'
    ],
    inclusions: [
      '2 Nights in Phuket (3-star), 2 Nights in Bangkok (3-star)',
      'Daily breakfast',
      'Phi Phi Island hop speedboat tour with Snorkeling equipment',
      'All general airport-to-hotel transfers'
    ],
    exclusions: [
      'International and domestic flights',
      'National park entry fee at Phi Phi Island (approx 400 THB)',
      'Thai Visa fees (if applicable)',
      'Meals not listed'
    ],
    featured: false
  },
  {
    id: 'sandakphu-trek',
    title: 'Sandakphu Phalut Trek',
    description: 'The highest peak of West Bengal offering panoramic views of the "Sleeping Buddha" - Mt. Everest, Mt. Lhotse, Mt. Makalu and Mt. Kanchenjunga. Walk along rhododendron trails.',
    category: 'trekking',
    price: 10500,
    duration: '6 Days / 5 Nights',
    location: 'West Bengal - Nepal Border',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Meetup at Siliguri. Drive to Manebhanjan base village, then proceed to Chitrey in Land Rover or trek to Tumling.',
      'Day 2: Trek from Tumling to Kalipokhri (13 km). Walk through beautiful Singalila National Park pine trees.',
      'Day 3: Trek from Kalipokhri to Sandakphu (3,636 meters). Witness a gorgeous Himalayan sunset over the peak.',
      'Day 4: Trek along the gorgeous ridge from Sandakphu to Phalut with unobstructed views of the highest mountains.',
      'Day 5: Descend through dense forests and bamboo glades to Gorkhey quiet mountain stream village.',
      'Day 6: Short trek from Gorkhey to Srikhola, board vehicle and drive back to Siliguri/Bagdogra.'
    ],
    inclusions: [
      'Trek logistics: guide, trek permits, national park entry fees',
      'Accommodation in traditional mountain tea-houses or camps',
      'Simple hot vegetarian meals (Breakfast, Packed Lunch, Evening Tea, Dinner)',
      'First-aid medical support, oxygen cylinder on trail'
    ],
    exclusions: [
      'Porters to carry personal backpacks (available on direct pay)',
      'Transportation between Siliguri and base Manebhanjan',
      'Tips or laundry services',
      'Gear rentals (trekking poles, sleeping bags)'
    ],
    featured: true
  },
  {
    id: 'kedarkantha-trek',
    title: 'Kedarkantha Snow Trek',
    description: 'Widely considered India\'s best winter snow trek. Climb to a stunning 12,500ft peak surrounded by a 360-degree panorama of majestic Garhwal Himalayan peaks.',
    category: 'trekking',
    price: 7500,
    duration: '5 Days / 4 Nights',
    location: 'Uttarakhand, India',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Drive from Dehradun to Sankri base village. Pass through Mussoorie and scenic Yamuna river curves.',
      'Day 2: Trek from Sankri to Juda-ka-Talab (frozen high lake). Camp under starry clear winter skies.',
      'Day 3: Trek from Juda-ka-Talab to Kedarkantha Base Camp. Get stunning sights of the peak.',
      'Day 4: Summit day! Early morning 3:00 AM push to Kedarkantha Peak (12,500 ft) for a marvelous sunrise. Descend back to Sankri.',
      'Day 5: Drive from Sankri back to Dehradun railway station/airport.'
    ],
    inclusions: [
      'Tent sharing accommodation (high altitude winter proof)',
      'Expert certified trek leaders and local helpers',
      'All nutritious mountain meals during trek',
      'Permits, forest fee, camping charges'
    ],
    exclusions: [
      'Dehradun to Sankri transport (can be arranged at extra cost)',
      'Personal trekking gear (boots, down jacket, backpack)',
      'Porters for personal bags',
      'Tips to guide staff'
    ],
    featured: true
  },
  {
    id: 'valley-of-flowers',
    title: 'Valley of Flowers trek',
    description: 'Trek inside a protected UNESCO World Heritage Site. Walk in a high alpine valley carpeted with hundreds of species of wild endemic flowers, backdropped by snow peaks.',
    category: 'trekking',
    price: 9200,
    duration: '6 Days / 5 Nights',
    location: 'Uttarakhand Himalayas',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
    itinerary: [
      'Day 1: Drive from Rishikesh to Govindghat. Travel along Ganga-Alaknanda sangam.',
      'Day 2: Short trek to Ghangaria base settlement (13 km alongside beautiful waterfalls).',
      'Day 3: Trek to Valley of Flowers National Park. Explore pristine valleys of natural colorful flora. Return to Ghangaria.',
      'Day 4: Trek up to sacred Hemkund Sahib Gurudwara and holy cold water lake located at 15,200 ft.',
      'Day 5: Descend back to Govindghat, and drive to Joshimath for a relaxing hotel stay.',
      'Day 6: Joshimath back to Rishikesh/Haridwar for onward connection.'
    ],
    inclusions: [
      'Guesthouse accommodation in Joshimath and Ghangaria',
      'Trek guides and national park ticket entry charges',
      'Nutritious meals daily during trek',
      'First-aid and emergency rescue support'
    ],
    exclusions: [
      'Rishikesh to Govindghat transfers',
      'Helicopter or horse rides up to Ghangaria (optional)',
      'Any lunches or personal items',
      'Raincoats or waterproof boots'
    ],
    featured: false
  }
];

export const initialBlogs: BlogPost[] = [
  {
    id: 'pack-trek-guide',
    title: 'How to Pack for a High-Altitude Trek in India: Complete Checklist',
    excerpt: 'Packing for a high alpine trek can be daunting. From layering secrets to footwear choices, here is your essential packing list to survive and thrive on snow trails.',
    content: `High-altitude trekking in India, especially trails like Sandakphu, Kedarkantha, or Hampta Pass, is an incredible experience. But the thin air, freezing night temperatures, and rugged terrain demand that you pack efficiently and smart. 

Here is our ultimate packing guide:

### 1. The Rule of Three Layers
Avoid heavy single winter jackets. Instead, pack three smart layers:
- **Base Layer**: Thermal innerwear (strictly moisture-wicking synthetic or merino wool. Never cotton, as cotton retains sweat and makes you freeze!).
- **Mid Layer**: High-density fleece or a lightweight down jacket. This traps your body heat.
- **Outer Shell**: A windproof, waterproof jacket with a hood to block cold mountain gales and unexpected sleet.

### 2. Footwear is First Priority
Do not trek in standard gym sneakers! You need:
- Off-road **Trekking Shoes** with deep lugged rubber soles (Vibram or comparable) and solid ankle support.
- At least 4-5 pairs of technical warm wool socks. Keep one dry pair exclusively for sleeping in tents.

### 3. Crucial Accessories
- **Trekking Poles**: Reduces stress on knees by up to 25% during descents.
- **Headlamp/Flashlight**: Absolutely essential for early morning summit climbs. Keep batteries warm in your pockets.
- **Water Treatment**: Bring chlorine tables or a filter bottle, water freezes and dehydration hits faster in cold mountain air.

ColorMyTrip always provides a complete gear check for our trekkers at the base camps, ensuring safety first!`,
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600',
    author: 'Ratnadeep - Trek Leader',
    tags: ['Trekking', 'Travel Advice', 'Himalayas'],
    createdAt: '2026-05-15T12:00:00Z'
  },
  {
    id: 'kashmir-best-time',
    title: 'Srinagar to Gulmarg: Choosing the Best Season to Visit Paradise on Earth',
    excerpt: 'Is Kashmir prettier in the green wildflower summer or in the pristine snowy winter? We break down the seasons to help you plan the perfect itinerary.',
    content: `Kashmir is known as the "Paradise on Earth" for a reason. Every season paints the valley in a totally unique palette. If you are planning a trip with ColorMyTrip, here is what each season brings to the table:

### 1. Spring (March to May) - The Bloom
If you love colorful floral carpets, spring is your best bet. 
* Srinagar's world-famous **Indira Gandhi Memorial Tulip Garden** opens for just about 25-30 days in April, showing millions of colorful tulips.
* Weather is pleasantly cool (15°C to 22°C), perfect for sightseeing.

### 2. Summer (June to August) - The Meadow Escape
As the rest of India heats up, Kashmir is cool and green.
* Sonamarg and Pahalgam meadows are fully vibrant green with cascading clear meltwater streams.
* Ideal for adventure seekers, angling, and pony rides.

### 3. Autumn (September to November) - Golden Chinar Trees
Autumn in Kashmir is incredibly romantic.
* Chinar trees turn orange, gold, and deep red.
* Walking in the Shalimar or Nishat gardens under falling golden leaves feels like a movie scene.

### 4. Winter (December to February) - The Snow Wonderland
Kashmir turns into an international ski destination.
* Gulmarg is covered in 5 to 6 feet of powdery snow.
* Ride the high-altitude Gondola into freezing snow valleys or sledge around Pahalgam.

Whenever you choose to visit, ColorMyTrip has customized direct packages for every budget!`,
    image: 'https://images.unsplash.com/photo-1588668214407-6797208c9012?auto=format&fit=crop&q=80&w=600',
    author: 'ColorMyTrip Travel Desk',
    tags: ['Domestic Tour', 'Kashmir', 'Destinations'],
    createdAt: '2026-05-20T09:30:00Z'
  },
  {
    id: 'bhutan-happiness',
    title: 'Bhutan Travel Guide: Visas, SDF Taxes, and the Climb to Tiger\'s Nest',
    excerpt: 'Demystifying the Sustainable Development Fee (SDF) and rules for visiting the mysterious Himalayan Kingdom of Bhutan.',
    content: `Bhutan remains one of the world's most pristine, carbon-negative, and culturally preserved countries. However, their unique policy of "High Value, Low Volume" tourism confuses many travelers. Here is what you need to know:

### 1. The Sustainable Development Fee (SDF)
Bhutan mandates a daily state tax on all tourists to preserve forests and provide free healthcare & education to locals:
- **International Tourists**: Currently $100 USD per night per adult.
- **Indian Tourists**: Enjoys a deep subsidy under bilateral relations - currently only ₹1,200 (INR) per night per adult. This makes Bhutan highly affordable for Indian travelers!

### 2. How to Get a Bhutan Permit
You will need your original Passport (minimum 6 months validity) or Voter ID Card (applicable only for Indian tourists). Our team at ColorMyTrip handles 100% of the permit processing and verification seamlessly on your behalf before you enter the gate!

### 3. Climbing Taktsang (Tiger's Nest)
The highlight of any Bhutan trip. Preached on high cliffs at 3,120 meters:
- The total hike is roughly 4.5 km uphill from the parking lot, taking 2.5 to 3.5 hours.
- If you have knee pain, you can rent a horse for the first half of the climb, but descend must be completed manually.
- Make sure to cover your shoulders and knees fully, as it is a highly sacred active temple.

Let ColorMyTrip plan your spiritual journey to Bhutan this season!`,
    image: 'https://images.unsplash.com/photo-1548141267-42721f456108?auto=format&fit=crop&q=80&w=600',
    author: 'Ratnadeep - Director',
    tags: ['International', 'Bhutan', 'Travel Guide'],
    createdAt: '2026-05-28T14:15:00Z'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    name: 'Anirban Sen, Kolkata',
    rating: 5,
    comment: 'We did the Sikkim Silk route with ColorMyTrip. Outstanding homestay selections and the driver was extremely polite and experienced in high altitude terrain. Highly recommended!',
    source: 'Google Review'
  },
  {
    id: 'rev-2',
    name: 'Priya Sharma, Delhi',
    rating: 5,
    comment: 'I joined their Sandakphu trek group. The arrangements, food, and guide briefing were top-notch. Seeing Everest and Kanchenjunga side by side was dreamy.',
    source: 'Verified Customer'
  },
  {
    id: 'rev-3',
    name: 'Vikramjit Singh, Chandigarh',
    rating: 5,
    comment: 'Wonderful Bhutan tour arrangements. The visa processing, SDF management, and hotel bookings were coordinated perfectly by Ratnadeep. Unmatched service.',
    source: 'Facebook'
  },
  {
    id: 'rev-4',
    name: 'Megha Roy, Bengaluru',
    rating: 5,
    comment: 'Booked a custom Kashmir and Gulmarg route with my parents. Hotel selection, transfers, and day planning were smooth throughout. Very responsive support team.',
    source: 'Google Review'
  }
];

export const initialVideoTestimonials: VideoTestimonial[] = [
  {
    id: 'vid-1',
    name: 'Priya & Family',
    title: 'Sikkim Adventure',
    location: 'Zuluk, Sikkim',
    videoUrl: 'https://www.youtube.com/embed/jNgP6d9HraI',
    duration: 45,
    createdAt: '2024-11-15'
  },
  {
    id: 'vid-2',
    name: 'Vikram Singh',
    title: 'Sandakphu Trek Experience',
    location: 'West Bengal',
    videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
    duration: 52,
    createdAt: '2024-11-10'
  },
  {
    id: 'vid-3',
    name: 'Rajesh Kapoor',
    title: 'Bhutan Cultural Tour',
    location: 'Paro, Bhutan',
    videoUrl: 'https://www.youtube.com/embed/V60nfXaKzPE',
    duration: 38,
    createdAt: '2024-11-05'
  }
];

export const initialGallery = [
  {
    id: 'gal-1',
    title: 'Tiger\'s Nest, Bhutan',
    category: 'international',
    image: 'https://images.unsplash.com/photo-1548141267-42721f456108?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'gal-2',
    title: 'Kashmir Shikara sunset',
    category: 'domestic',
    image: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'gal-3',
    title: 'Snow Ridge in Himalayas',
    category: 'trekking',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'gal-4',
    title: 'Ubud Swing, Bali',
    category: 'international',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'gal-5',
    title: 'Gnathang Valley, Sikkim Route',
    category: 'domestic',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'gal-6',
    title: 'Kedarkantha Alpine Lake campsite',
    category: 'trekking',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600'
  }
];

export const initialOffers: OfferMarqueeItem[] = [
  {
    id: 'offer-1',
    offer_text: '🔥 Meghalaya Group Tour Starting @ ₹8,999',
    is_active: true,
    speed: 28,
    background_color: '#eef6ff',
    text_color: '#334155'
  },
  {
    id: 'offer-2',
    offer_text: '✈️ Early Bird Discount Available',
    is_active: true,
    speed: 28,
    background_color: '#fff7ed',
    text_color: '#7c2d12'
  },
  {
    id: 'offer-3',
    offer_text: '🏔️ Upcoming Kashmir Batch Open',
    is_active: true,
    speed: 28,
    background_color: '#f5f3ff',
    text_color: '#4c1d95'
  }
];
