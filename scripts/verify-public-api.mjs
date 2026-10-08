const API_BASE = 'http://localhost:8088/api/v1/public';

async function verify() {
  const [cats, menu, offers, reviews, gallery, settings] = await Promise.all([
    fetch(`${API_BASE}/categories`).then(r => r.json()),
    fetch(`${API_BASE}/menu`).then(r => r.json()),
    fetch(`${API_BASE}/offers`).then(r => r.json()),
    fetch(`${API_BASE}/reviews`).then(r => r.json()),
    fetch(`${API_BASE}/gallery`).then(r => r.json()),
    fetch(`${API_BASE}/settings`).then(r => r.json())
  ]);

  console.log('=== VERIFICATION SUMMARY ===');
  console.log(`Categories count: ${cats.data?.length}`);
  console.log(`Menu Items count: ${menu.data?.length}`);
  console.log(`Offers count:     ${offers.data?.length}`);
  console.log(`Reviews count:    ${reviews.data?.length}`);
  console.log(`Gallery count:    ${gallery.data?.length}`);
  console.log(`Cafe Name:        ${settings.data?.cafeName}`);
  console.log(`Phone:            ${settings.data?.phoneNumber}`);
  console.log(`WhatsApp:         ${settings.data?.whatsappNumber}`);
  console.log(`Email:            ${settings.data?.email}`);
  console.log(`Instagram:        ${settings.data?.instagramUrl}`);
  console.log(`Address:          ${settings.data?.address}`);
  console.log(`Coordinates:      ${settings.data?.cafeLatitude}, ${settings.data?.cafeLongitude}`);
  console.log(`Online Ordering:  ${settings.data?.onlineOrderingEnabled ? 'OPEN' : 'CLOSED'}`);
  console.log(`Free Radius:      ${settings.data?.freeDeliveryDistanceKm} km`);
  console.log(`Delivery Rate:    ₹${settings.data?.deliveryRatePerKm}/km`);
  console.log(`Sample Hours:     ${settings.data?.businessHours[0]?.dayOfWeek} ${settings.data?.businessHours[0]?.openTime} - ${settings.data?.businessHours[0]?.closeTime}`);

  // Veg/Non-Veg/Egg breakdown
  const vegCount = menu.data?.filter(i => i.foodType === 'VEG').length;
  const nonVegCount = menu.data?.filter(i => i.foodType === 'NON_VEG').length;
  const eggCount = menu.data?.filter(i => i.foodType === 'EGG').length;
  const bestsellers = menu.data?.filter(i => i.bestseller).length;
  const populars = menu.data?.filter(i => i.isPopular).length;

  console.log('\n=== MENU BREAKDOWN ===');
  console.log(`VEG:         ${vegCount}`);
  console.log(`NON_VEG:     ${nonVegCount}`);
  console.log(`EGG:         ${eggCount}`);
  console.log(`Bestsellers: ${bestsellers}`);
  console.log(`Popular (Featured on Home): ${populars}`);
}

verify().catch(console.error);
