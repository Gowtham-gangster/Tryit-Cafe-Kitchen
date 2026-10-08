import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:8088/api/v1';

// Read backend/.env to get owner credentials
function loadEnv() {
  const envPath = path.resolve('backend/.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`File not found: ${envPath}`);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [k, ...v] = trimmed.split('=');
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(`${options.method || 'GET'} ${url} failed: ${msg}`);
  }
  return data;
}

async function main() {
  console.log('🚀 Starting Development Dataset Population for Tryit Cafe & Kitchen...');
  const env = loadEnv();

  const ownerPhone = env.OWNER_INITIAL_PHONE || '9999999999';
  const ownerPassword = env.OWNER_INITIAL_PASSWORD || 'Owner@TryIt2026';

  // 1. Owner Login
  console.log(`\n🔑 Authenticating as Owner (${ownerPhone})...`);
  const loginRes = await jsonFetch(`${API_BASE}/auth/owner-login`, {
    method: 'POST',
    body: JSON.stringify({ phone: ownerPhone, password: ownerPassword })
  });
  const token = loginRes.data.token;
  const ownerHeaders = { Authorization: `Bearer ${token}` };
  console.log('✅ Owner authenticated successfully.');

  // 2. Business Settings
  console.log('\n⚙️ Configuring Business Settings...');
  const settingsUpdate = {
    cafeName: 'Tryit Cafe & Kitchen',
    phoneNumber: '8977774885',
    whatsappNumber: '8977774885',
    email: 'tryit.cafekichen@gmail.com',
    instagramUrl: 'https://instagram.com/tryit.cafe_kitchen',
    address: 'Back side Union Bank, H No 3-127/2, Hyderabad - Narsapur Road, Ganesh Nagar, Gandi Maisamma, Hyderabad, Telangana 500043',
    cafeLatitude: 17.57651209843505,
    cafeLongitude: 78.42005183478837,
    onlineOrderingEnabled: true,
    freeDeliveryDistanceKm: 3.0,
    deliveryRatePerKm: 5.00
  };
  const settingsRes = await jsonFetch(`${API_BASE}/owner/settings`, {
    method: 'PUT',
    headers: ownerHeaders,
    body: JSON.stringify(settingsUpdate)
  });
  console.log('✅ Business Settings updated with exact coordinates and store contact info.');

  // 3. Business Hours
  console.log('\n🕒 Configuring Operating Hours (03:00 PM - 11:30 PM for all 7 days)...');
  const currentSettings = settingsRes.data;
  if (currentSettings.businessHours && currentSettings.businessHours.length > 0) {
    const updatedHours = currentSettings.businessHours.map(h => ({
      id: h.id,
      dayOfWeek: h.dayOfWeek,
      openTime: '15:00', // 03:00 PM
      closeTime: '23:30', // 11:30 PM
      closed: false,
      dayOrder: h.dayOrder
    }));
    await jsonFetch(`${API_BASE}/owner/business-hours`, {
      method: 'PUT',
      headers: ownerHeaders,
      body: JSON.stringify({ hours: updatedHours })
    });
    console.log(`✅ ${updatedHours.length} Business Hours updated to 03:00 PM - 11:30 PM (15:00 - 23:30).`);
  }

  // 4. Categories
  console.log('\n📂 Ensuring 10 Standard Categories...');
  const targetCategories = [
    { name: 'Quick Bites', description: 'Crispy fritters, savory rolls, and tea-time snacks', displayOrder: 1 },
    { name: 'Fast Food', description: 'Gourmet burgers, grilled sandwiches, and crispy nuggets', displayOrder: 2 },
    { name: 'Rice Bowls', description: 'Homestyle comforting seasoned rice bowls', displayOrder: 3 },
    { name: 'Fried Rice', description: 'Wok-tossed aromatic rice with fresh veggies and meats', displayOrder: 4 },
    { name: 'Pasta', description: 'Creamy Alfredo and zesty Arrabbiata penne pasta', displayOrder: 5 },
    { name: 'Biryanis', description: 'Slow-cooked fragrant basmati rice biryanis', displayOrder: 6 },
    { name: 'Bagara Rice Combos', description: 'Traditional Bagara rice served with rich curries and fries', displayOrder: 7 },
    { name: 'Combos', description: 'Curated value combos pairing hearty bites with drinks', displayOrder: 8 },
    { name: 'Beverages', description: 'Refreshing iced coolers and soft drinks', displayOrder: 9 },
    { name: 'Shakes', description: 'Decadent thick creamy milkshakes', displayOrder: 10 }
  ];

  const existingCatsRes = await jsonFetch(`${API_BASE}/owner/categories`, { headers: ownerHeaders });
  const categoryMap = new Map();
  for (const c of existingCatsRes.data) {
    categoryMap.set(c.name.toLowerCase().trim(), c);
  }

  let categoriesCreated = 0;
  for (const tc of targetCategories) {
    const key = tc.name.toLowerCase().trim();
    if (!categoryMap.has(key)) {
      const created = await jsonFetch(`${API_BASE}/owner/categories`, {
        method: 'POST',
        headers: ownerHeaders,
        body: JSON.stringify({
          name: tc.name,
          description: tc.description,
          displayOrder: tc.displayOrder,
          active: true
        })
      });
      categoryMap.set(key, created.data);
      categoriesCreated++;
      console.log(`   + Created Category: "${tc.name}"`);
    } else {
      console.log(`   ✓ Category already exists: "${tc.name}"`);
    }
  }
  console.log(`✅ Categories ready (Total: ${categoryMap.size}, Newly Created: ${categoriesCreated}).`);

  // 5. Menu Items
  console.log('\n🍔 Ensuring 36 Menu Items...');
  const existingMenuRes = await jsonFetch(`${API_BASE}/owner/menu`, { headers: ownerHeaders });
  const existingMenuMap = new Map();
  for (const item of existingMenuRes.data) {
    existingMenuMap.set(item.name.toLowerCase().trim(), item);
  }

  const itemsDefinition = [
    // Quick Bites
    { cat: 'Quick Bites', name: 'Onion Pakoda', type: 'VEG', price: 70, desc: 'Crispy golden spiced onion fritters served with tangy chutney.', bestseller: true, popular: true, order: 1 },
    { cat: 'Quick Bites', name: 'Veg Roll', type: 'VEG', price: 80, desc: 'Flaky paratha wrap packed with seasoned sauteed garden vegetables.', bestseller: false, popular: false, order: 2 },
    { cat: 'Quick Bites', name: 'Chicken Pakoda', type: 'NON_VEG', price: 90, desc: 'Crunchy spiced bite-sized chicken tossed in aromatic curry leaves.', bestseller: true, popular: true, order: 3 },
    { cat: 'Quick Bites', name: 'Bread Omelette', type: 'EGG', price: 80, desc: 'Double-egg fluffy spiced omelette folded inside toasted golden bread.', bestseller: false, popular: false, order: 4 },
    { cat: 'Quick Bites', name: 'Egg Roll', type: 'EGG', price: 100, desc: 'Crispy flaky paratha wrapped with seasoned eggs and crunchy onions.', bestseller: true, popular: false, order: 5 },
    { cat: 'Quick Bites', name: 'Chicken Roll', type: 'NON_VEG', price: 120, desc: 'Tender spiced grilled chicken chunks rolled in a hot flaky wrap.', bestseller: true, popular: false, order: 6 },

    // Fast Food
    { cat: 'Fast Food', name: 'Veg Burger', type: 'VEG', price: 110, desc: 'Crispy spiced potato & veggie patty with lettuce, tomatoes, and house mayo.', bestseller: false, popular: false, order: 7 },
    { cat: 'Fast Food', name: 'Veg Sandwich', type: 'VEG', price: 110, desc: 'Toasted sandwich layered with fresh garden veggies, cheese, and herb spread.', bestseller: false, popular: false, order: 8 },
    { cat: 'Fast Food', name: 'Veg Nuggets', type: 'VEG', price: 80, desc: 'Golden crunchy vegetarian nuggets served with signature garlic dip.', bestseller: false, popular: false, order: 9 },
    { cat: 'Fast Food', name: 'Chicken Burger', type: 'NON_VEG', price: 130, desc: 'Crispy seasoned chicken patty topped with fresh slaw and creamy burger mayo.', bestseller: true, popular: true, order: 10 },
    { cat: 'Fast Food', name: 'Chicken Sandwich', type: 'NON_VEG', price: 130, desc: 'Shredded roasted chicken tossed in herb dressing and grilled between golden slices.', bestseller: false, popular: false, order: 11 },
    { cat: 'Fast Food', name: 'Chicken Nuggets', type: 'NON_VEG', price: 100, desc: 'Juicy tender chicken bites fried to a crunchy golden crust with dip.', bestseller: false, popular: false, order: 12 },

    // Rice Bowls
    { cat: 'Rice Bowls', name: 'Curd Rice', type: 'VEG', price: 80, desc: 'Homestyle velvety tempered curd rice with mustard, ginger, and curry leaves.', bestseller: false, popular: false, order: 13 },
    { cat: 'Rice Bowls', name: 'Lemon Rice', type: 'VEG', price: 80, desc: 'Aromatic turmeric rice tempered with crunchy roasted peanuts and lemon juice.', bestseller: false, popular: false, order: 14 },
    { cat: 'Rice Bowls', name: 'Jeera Rice', type: 'VEG', price: 80, desc: 'Fragrant basmati rice gently tempered with roasted cumin seeds and ghee.', bestseller: false, popular: false, order: 15 },
    { cat: 'Rice Bowls', name: 'Gongura Pickle Rice', type: 'VEG', price: 80, desc: 'Tangy and spicy Andhra gongura pickle blended with hot seasoned rice.', bestseller: true, popular: false, order: 16 },
    { cat: 'Rice Bowls', name: 'Avakaya Rice', type: 'VEG', price: 80, desc: 'Traditional fiery mango avakaya pickle mixed with warm rice and ghee.', bestseller: true, popular: false, order: 17 },

    // Fried Rice
    { cat: 'Fried Rice', name: 'Veg Fried Rice', type: 'VEG', price: 100, desc: 'Wok-tossed basmati rice with crunchy carrots, capsicum, beans, and spring onion.', bestseller: false, popular: false, order: 18 },
    { cat: 'Fried Rice', name: 'Mushroom Fried Rice', type: 'VEG', price: 100, desc: 'Tender button mushrooms wok-tossed with aromatic seasoned rice.', bestseller: false, popular: false, order: 19 },
    { cat: 'Fried Rice', name: 'Egg Fried Rice', type: 'EGG', price: 80, desc: 'Fluffy scrambled eggs wok-tossed with fragrant rice and mild soy seasonings.', bestseller: false, popular: false, order: 20 },
    { cat: 'Fried Rice', name: 'Chicken Fried Rice', type: 'NON_VEG', price: 90, desc: 'Juicy chicken bites and scrambled egg tossed in a high-flame wok with rice.', bestseller: true, popular: true, order: 21 },

    // Pasta
    { cat: 'Pasta', name: 'Veg Alfredo Penne Pasta', type: 'VEG', price: 80, desc: 'Penne in rich velvety garlic parmesan cream sauce with sauteed broccoli.', bestseller: false, popular: false, order: 22 },
    { cat: 'Pasta', name: 'Veg Red Sauce Penne Pasta', type: 'VEG', price: 90, desc: 'Al dente penne in tangy sun-ripened tomato basil sauce with garden herbs.', bestseller: false, popular: false, order: 23 },
    { cat: 'Pasta', name: 'Chicken Alfredo Penne Pasta', type: 'NON_VEG', price: 90, desc: 'Creamy rich white sauce penne loaded with tender herb-grilled chicken.', bestseller: true, popular: true, order: 24 },
    { cat: 'Pasta', name: 'Chicken Red Sauce Penne Pasta', type: 'NON_VEG', price: 100, desc: 'Spicy Arrabbiata red sauce pasta tossed with seasoned juicy chicken.', bestseller: false, popular: false, order: 25 },

    // Biryanis
    { cat: 'Biryanis', name: 'Veg Biryani', type: 'VEG', price: 80, desc: 'Layered aromatic basmati rice cooked with fresh seasonal vegetables and saffron.', bestseller: false, popular: false, order: 26 },
    { cat: 'Biryanis', name: 'Mushroom Biryani', type: 'VEG', price: 90, desc: 'Spiced button mushrooms dum-cooked with fragrant basmati rice.', bestseller: false, popular: false, order: 27 },
    { cat: 'Biryanis', name: 'Paneer Biryani', type: 'VEG', price: 90, desc: 'Golden marinated soft paneer cubes cooked in rich aromatic biryani spices.', bestseller: false, popular: false, order: 28 },
    { cat: 'Biryanis', name: 'Chicken Biryani', type: 'NON_VEG', price: 100, desc: 'Authentic Hyderabadi dum biryani with succulent chicken and caramelized onions.', bestseller: true, popular: true, order: 29 },

    // Bagara Rice Combos
    { cat: 'Bagara Rice Combos', name: 'Bagara Rice with Chicken Fry', type: 'NON_VEG', price: 90, desc: 'Traditional spiced Telangana Bagara rice served with fiery Andhra chicken fry.', bestseller: true, popular: false, order: 30 },
    { cat: 'Bagara Rice Combos', name: 'Bagara Rice with Mutton Curry', type: 'NON_VEG', price: 100, desc: 'Aromatic Bagara rice paired with slow-simmered rich mutton masala gravy.', bestseller: true, popular: false, order: 31 },
    { cat: 'Bagara Rice Combos', name: 'Bagara Rice with Mushroom Curry', type: 'VEG', price: 100, desc: 'Flavorful Bagara rice served with aromatic spiced button mushroom curry.', bestseller: false, popular: false, order: 32 },
    { cat: 'Bagara Rice Combos', name: 'Bagara Rice with Paneer Curry', type: 'VEG', price: 100, desc: 'Authentic Bagara rice served with creamy rich cottage cheese gravy.', bestseller: false, popular: false, order: 33 },

    // Combos
    { cat: 'Combos', name: 'Egg Roll with Oreo Shake', type: 'EGG', price: 100, desc: 'Special pairing: One double-egg roll served with a thick chilled Oreo milkshake.', bestseller: true, popular: false, order: 34 },
    { cat: 'Combos', name: 'Chicken Roll with Chicken Nuggets', type: 'NON_VEG', price: 130, desc: 'Satisfying combo: Crispy chicken roll paired with 4 golden chicken nuggets.', bestseller: true, popular: false, order: 35 },
    { cat: 'Combos', name: 'Burger Drink Combo', type: 'NON_VEG', price: 140, desc: 'Deluxe combo: Juicy Chicken Burger served with a cold refreshing drink.', bestseller: true, popular: false, order: 36 }
  ];

  let menuCreated = 0;
  let popularCount = 0;
  for (const item of itemsDefinition) {
    const key = item.name.toLowerCase().trim();
    if (existingMenuMap.has(key)) {
      console.log(`   ✓ Dish already exists: "${item.name}"`);
      continue;
    }
    const cat = categoryMap.get(item.cat.toLowerCase().trim());
    if (!cat) {
      console.error(`   ❌ Missing category: ${item.cat}`);
      continue;
    }

    const isPop = item.popular && popularCount < 6;
    if (isPop) popularCount++;

    const payload = {
      categoryId: cat.id,
      name: item.name,
      description: item.desc,
      price: item.price,
      foodType: item.type,
      available: true,
      bestseller: item.bestseller,
      isNew: false,
      isPopular: isPop,
      popularDisplayOrder: isPop ? popularCount : 0,
      discountEnabled: false,
      displayOrder: item.order
    };

    await jsonFetch(`${API_BASE}/owner/menu`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify(payload)
    });
    menuCreated++;
    console.log(`   + Created Dish: "${item.name}" (₹${item.price}, ${item.type})`);
  }
  console.log(`✅ Menu Items ready (Newly Created: ${menuCreated}).`);

  // 6. Offers
  console.log('\n🎁 Ensuring 4 Development Demo Offers...');
  const existingOffersRes = await jsonFetch(`${API_BASE}/owner/offers`, { headers: ownerHeaders });
  const existingOffersMap = new Map();
  for (const o of existingOffersRes.data) {
    existingOffersMap.set(o.title.toLowerCase().trim(), o);
  }

  const targetOffers = [
    {
      title: 'Chicken Burger Combo',
      description: 'Chicken Burger + Chicken Nuggets + Drink',
      badgeText: 'DEMO DEAL',
      discountType: 'PERCENTAGE',
      discountValue: 15.00,
      minOrderAmount: 200.00,
      displayOrder: 1
    },
    {
      title: 'Evening Snack Deal',
      description: 'Chicken Roll + Chicken Nuggets',
      badgeText: 'DEMO DEAL',
      discountType: 'FLAT_AMOUNT',
      discountValue: 30.00,
      minOrderAmount: 180.00,
      displayOrder: 2
    },
    {
      title: 'Veg Treat',
      description: 'Veg Burger + Drink',
      badgeText: 'DEMO DEAL',
      discountType: 'PERCENTAGE',
      discountValue: 10.00,
      minOrderAmount: 150.00,
      displayOrder: 3
    },
    {
      title: 'Weekend Special',
      description: 'Selected cafe favourites',
      badgeText: 'DEMO DEAL',
      discountType: 'PERCENTAGE',
      discountValue: 20.00,
      minOrderAmount: 250.00,
      displayOrder: 4
    }
  ];

  let offersCreated = 0;
  for (const to of targetOffers) {
    const key = to.title.toLowerCase().trim();
    if (!existingOffersMap.has(key)) {
      await jsonFetch(`${API_BASE}/owner/offers`, {
        method: 'POST',
        headers: ownerHeaders,
        body: JSON.stringify({ ...to, active: true })
      });
      offersCreated++;
      console.log(`   + Created Offer: "${to.title}"`);
    } else {
      console.log(`   ✓ Offer already exists: "${to.title}"`);
    }
  }
  console.log(`✅ Offers ready (Newly Created: ${offersCreated}).`);

  // 7. Reviews
  console.log('\n⭐ Ensuring 4 Development Demo Reviews...');
  const existingReviewsRes = await jsonFetch(`${API_BASE}/owner/reviews`, { headers: ownerHeaders });
  const existingReviewAuthors = new Set(existingReviewsRes.data.map(r => r.customerName.toLowerCase().trim()));

  const demoReviews = [
    { name: 'Demo Customer 1', phone: '9000000001', rating: 5, comment: 'The pasta and pakodas were freshly made and delicious! Quick delivery and great taste.' },
    { name: 'Demo Customer 2', phone: '9000000002', rating: 5, comment: 'Loved the Chicken Biryani and rolls. Clean packaging and easy WhatsApp ordering process.' },
    { name: 'Demo Customer 3', phone: '9000000003', rating: 5, comment: 'Cozy ambience and courteous staff. The burgers and shakes are fantastic value for money.' },
    { name: 'Demo Customer 4', phone: '9000000004', rating: 4, comment: 'Great food quality and piping hot delivery. Highly recommend the Bagara rice combos!' }
  ];

  let reviewsCreated = 0;
  for (const dr of demoReviews) {
    if (existingReviewAuthors.has(dr.name.toLowerCase().trim())) {
      console.log(`   ✓ Review from ${dr.name} already exists.`);
      continue;
    }

    // Register or login customer
    let custToken = null;
    try {
      const regRes = await jsonFetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: dr.name,
          phone: dr.phone,
          password: 'Password@123',
          email: `${dr.phone}@demo.tryitcafe.com`
        })
      });
      custToken = regRes.data.token;
    } catch {
      // If already registered, login
      const logRes = await jsonFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          phone: dr.phone,
          password: 'Password@123'
        })
      });
      custToken = logRes.data.token;
    }

    if (custToken) {
      // Submit review
      const subRes = await jsonFetch(`${API_BASE}/customer/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${custToken}` },
        body: JSON.stringify({
          rating: dr.rating,
          comment: dr.comment
        })
      });

      // Approve review via Owner
      const reviewId = subRes.data.id;
      await jsonFetch(`${API_BASE}/owner/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: ownerHeaders,
        body: JSON.stringify({ status: 'APPROVED' })
      });

      reviewsCreated++;
      console.log(`   + Submitted and Approved Review: "${dr.name}" (${dr.rating} Stars)`);
    }
  }
  console.log(`✅ Reviews ready (Newly Created: ${reviewsCreated}).`);

  // 8. Gallery items
  console.log('\n📸 Checking Gallery Items in Cloudinary / Database...');
  const existingGalleryRes = await jsonFetch(`${API_BASE}/owner/gallery`, { headers: ownerHeaders });
  if (existingGalleryRes.data.length === 0) {
    console.log('   Gallery is empty. Uploading local cafe asset to Cloudinary via Owner upload endpoint...');
    const logoPath = path.resolve('frontend/public/Logo.jpeg');
    if (fs.existsSync(logoPath)) {
      const fileBuffer = fs.readFileSync(logoPath);
      const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, 'Logo.jpeg');
      formData.append('folder', 'gallery');

      const uploadRes = await fetch(`${API_BASE}/owner/upload-media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const uploadJson = await uploadRes.json();
      if (uploadJson.success && uploadJson.data?.url) {
        console.log(`   ✅ Cloudinary media uploaded: ${uploadJson.data.url}`);
        await jsonFetch(`${API_BASE}/owner/gallery`, {
          method: 'POST',
          headers: ownerHeaders,
          body: JSON.stringify({
            mediaType: 'IMAGE',
            mediaUrl: uploadJson.data.url,
            mediaPublicId: uploadJson.data.publicId,
            title: 'Tryit Cafe & Kitchen Branding',
            caption: 'Our culinary sanctuary in Gandi Maisamma, Hyderabad',
            categoryTag: 'AMBIENCE',
            displayOrder: 1,
            active: true
          })
        });
        console.log('   + Added Gallery Item with verified Cloudinary secure URL.');
      }
    }
  } else {
    console.log(`   ✓ Gallery already has ${existingGalleryRes.data.length} item(s).`);
  }

  console.log('\n🎉 POPULATION COMPLETE! All categories, dishes, offers, reviews, and settings are populated and active.');
}

main().catch(err => {
  console.error('\n❌ Error during population:', err);
  process.exit(1);
});
