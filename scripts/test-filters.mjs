const base = 'http://localhost:8088/api/v1/public';

async function testFilters() {
  const cats = await fetch(base + '/categories').then(r => r.json());
  const qb = cats.data.find(c => c.name === 'Quick Bites');

  const [veg, nonVeg, egg, best, sBurger, sPakoda, sBiryani, catQb] = await Promise.all([
    fetch(base + '/menu?foodType=VEG').then(r => r.json()),
    fetch(base + '/menu?foodType=NON_VEG').then(r => r.json()),
    fetch(base + '/menu?foodType=EGG').then(r => r.json()),
    fetch(base + '/menu?bestseller=true').then(r => r.json()),
    fetch(base + '/menu?search=burger').then(r => r.json()),
    fetch(base + '/menu?search=pakoda').then(r => r.json()),
    fetch(base + '/menu?search=biryani').then(r => r.json()),
    fetch(base + '/menu?categoryId=' + qb.id).then(r => r.json())
  ]);

  console.log('Filter VEG items count:       ', veg.data.length);
  console.log('Filter NON_VEG items count:   ', nonVeg.data.length);
  console.log('Filter EGG items count:       ', egg.data.length);
  console.log('Filter Bestsellers count:     ', best.data.length);
  console.log('Search "burger" matches:      ', sBurger.data.map(i => i.name));
  console.log('Search "pakoda" matches:      ', sPakoda.data.map(i => i.name));
  console.log('Search "biryani" matches:     ', sBiryani.data.map(i => i.name));
  console.log('Category "Quick Bites" items: ', catQb.data.map(i => i.name));
}

testFilters().catch(console.error);
