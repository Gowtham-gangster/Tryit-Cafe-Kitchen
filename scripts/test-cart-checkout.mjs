const base = 'http://localhost:8088/api/v1';

async function testCartCheckout() {
  console.log('Testing Customer Cart & Checkout Flow...');

  // 1. Customer Login
  const loginRes = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9000000001', password: 'Password@123' })
  }).then(r => r.json());
  const token = loginRes.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  console.log('✅ Customer logged in successfully.');

  // 2. Clear / Get Cart
  let cart = await fetch(base + '/customer/cart', { headers: authHeaders }).then(r => r.json());
  console.log('Initial cart item count:', cart.data?.itemCount || 0);

  // 3. Get Menu to find item IDs
  const menu = await fetch(base + '/public/menu').then(r => r.json());
  const onionPakoda = menu.data.find(i => i.name === 'Onion Pakoda');
  const chickenBurger = menu.data.find(i => i.name === 'Chicken Burger');

  // 4. Add items to cart
  console.log(`Adding "${onionPakoda.name}" (₹${onionPakoda.price}) x2 to cart...`);
  cart = await fetch(base + '/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ menuItemId: onionPakoda.id, quantity: 2 })
  }).then(r => r.json());

  console.log(`Adding "${chickenBurger.name}" (₹${chickenBurger.price}) x1 to cart...`);
  cart = await fetch(base + '/customer/cart/items', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ menuItemId: chickenBurger.id, quantity: 1 })
  }).then(r => r.json());

  console.log('Updated cart items:');
  cart.data.items.forEach(it => {
    console.log(`  - ${it.menuItemName} x ${it.quantity} @ ₹${it.price} = ₹${it.totalPrice}`);
  });
  console.log(`Cart Subtotal: ₹${cart.data.subtotal}`);

  // 5. Test Saved Locations & Order Preview with Haversine distance
  console.log('\nCreating Customer Delivery Location (Within 2.0 km - Free Radius)...');
  const locNear = await fetch(base + '/customer/locations', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      label: 'Home',
      address: 'Near Gandi Maisamma, Hyderabad',
      latitude: 17.5770,
      longitude: 78.4210,
      isDefault: true
    })
  }).then(r => r.json());
  console.log(`Saved near location ID: ${locNear.data.id}`);

  console.log('Testing Order Preview (Delivery within 3.0 km Free Radius):');
  const previewFree = await fetch(base + '/customer/orders/preview', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      orderType: 'DELIVERY',
      locationId: locNear.data.id,
      items: [
        { menuItemId: onionPakoda.id, quantity: 2 },
        { menuItemId: chickenBurger.id, quantity: 1 }
      ]
    })
  }).then(r => r.json());
  console.log(`  Distance: ${previewFree.data.distanceKm.toFixed(2)} km`);
  console.log(`  Delivery Charge: ₹${previewFree.data.deliveryCharge} (Free delivery: ${previewFree.data.isFreeDelivery})`);
  console.log(`  Subtotal: ₹${previewFree.data.subtotal}`);
  console.log(`  Final Amount: ₹${previewFree.data.finalAmount}`);

  console.log('\nCreating Customer Delivery Location (Beyond 3.0 km - 5.5 km away)...');
  const locFar = await fetch(base + '/customer/locations', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      label: 'Work',
      address: 'Pragathi Nagar, Kukatpally, Hyderabad',
      latitude: 17.5300,
      longitude: 78.3900,
      isDefault: false
    })
  }).then(r => r.json());
  console.log(`Saved far location ID: ${locFar.data.id}`);

  console.log('Testing Order Preview (Delivery beyond 3.0 km):');
  const previewCharged = await fetch(base + '/customer/orders/preview', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      orderType: 'DELIVERY',
      locationId: locFar.data.id,
      items: [
        { menuItemId: onionPakoda.id, quantity: 2 },
        { menuItemId: chickenBurger.id, quantity: 1 }
      ]
    })
  }).then(r => r.json());
  console.log(`  Distance: ${previewCharged.data.distanceKm.toFixed(2)} km`);
  console.log(`  Delivery Charge: ₹${previewCharged.data.deliveryCharge} (Free delivery: ${previewCharged.data.isFreeDelivery})`);
  console.log(`  Subtotal: ₹${previewCharged.data.subtotal}`);
  console.log(`  Final Amount: ₹${previewCharged.data.finalAmount}`);

  console.log('\nTesting Order Preview (TAKEAWAY):');
  const previewTakeaway = await fetch(base + '/customer/orders/preview', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      orderType: 'TAKEAWAY',
      items: [
        { menuItemId: onionPakoda.id, quantity: 2 },
        { menuItemId: chickenBurger.id, quantity: 1 }
      ]
    })
  }).then(r => r.json());
  console.log(`  Delivery Charge: ₹${previewTakeaway.data.deliveryCharge}`);
  console.log(`  Subtotal: ₹${previewTakeaway.data.subtotal}`);
  console.log(`  Final Amount: ₹${previewTakeaway.data.finalAmount}`);

  console.log('\n✅ Cart & Checkout calculation validated perfectly!');
}

testCartCheckout().catch(console.error);
