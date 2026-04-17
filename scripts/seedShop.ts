import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const shopItems = [
  {
    id: 'pot_skin_default',
    type: 'pot_skin',
    name: 'Обычный горшок',
    priceGems: 0,
    priceCoins: 0,
    imageUrl: '',
    data: { skinId: 'default' },
  },
  {
    id: 'pot_skin_clay',
    type: 'pot_skin',
    name: 'Глиняный горшок',
    priceGems: 0,
    priceCoins: 50,
    imageUrl: '',
    data: { skinId: 'clay' },
  },
  {
    id: 'pot_skin_golden',
    type: 'pot_skin',
    name: 'Золотой горшок',
    priceGems: 10,
    priceCoins: null,
    imageUrl: '',
    data: { skinId: 'golden' },
  },
  {
    id: 'pot_skin_crystal',
    type: 'pot_skin',
    name: 'Хрустальный горшок',
    priceGems: 25,
    priceCoins: null,
    imageUrl: '',
    data: { skinId: 'crystal' },
  },
  {
    id: 'pot_skin_rainbow',
    type: 'pot_skin',
    name: 'Радужный горшок',
    priceGems: 50,
    priceCoins: null,
    imageUrl: '',
    data: { skinId: 'rainbow' },
  },
  {
    id: 'seed_rose',
    type: 'seed',
    name: 'Семена розы',
    priceGems: 0,
    priceCoins: 30,
    imageUrl: '',
    data: { flowerType: 'rose', growthTime: 7200 },
  },
  {
    id: 'seed_tulip',
    type: 'seed',
    name: 'Семена тюльпана',
    priceGems: 0,
    priceCoins: 50,
    imageUrl: '',
    data: { flowerType: 'tulip', growthTime: 10800 },
  },
  {
    id: 'gem_pack_small',
    type: 'gem_pack',
    name: 'Маленький мешочек алмазов',
    priceGems: 0,
    priceCoins: null,
    imageUrl: '',
    data: { amount: 50 },
  },
  {
    id: 'gem_pack_medium',
    type: 'gem_pack',
    name: 'Средний мешочек алмазов',
    priceGems: 0,
    priceCoins: null,
    imageUrl: '',
    data: { amount: 150 },
  },
  {
    id: 'gem_pack_large',
    type: 'gem_pack',
    name: 'Большой мешочек алмазов',
    priceGems: 0,
    priceCoins: null,
    imageUrl: '',
    data: { amount: 500 },
  },
];

async function seedShop() {
  console.log('🌱 Starting shop seeding...\n');

  try {
    const shopRef = collection(db, 'shop');

    console.log('📦 Clearing existing shop items...');
    const existingDocs = await getDocs(shopRef);
    const deletePromises = existingDocs.docs.map(docSnap => deleteDoc(doc(db, 'shop', docSnap.id)));
    await Promise.all(deletePromises);
    console.log(`   Deleted ${existingDocs.docs.length} existing items\n`);

    console.log('➕ Adding new items...');
    for (const item of shopItems) {
      await setDoc(doc(shopRef, item.id), item);
      console.log(`   ✓ ${item.name}`);
    }

    console.log('\n✅ Shop seeding completed successfully!');
    console.log(`   Total items: ${shopItems.length}`);

    console.log('\n📋 Summary:');
    console.log(`   - Pot skins: ${shopItems.filter(i => i.type === 'pot_skin').length}`);
    console.log(`   - Seeds: ${shopItems.filter(i => i.type === 'seed').length}`);
    console.log(`   - Gem packs: ${shopItems.filter(i => i.type === 'gem_pack').length}`);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedShop();
