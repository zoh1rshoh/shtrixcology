import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedProduct {
  barcode: string;
  name: string;
  brand: string;
  packagingType: 'plastic' | 'aluminium' | 'paper' | 'glass' | 'other';
  weightGrams: number;
}

const PRODUCTS: SeedProduct[] = [
  // ============ COCA-COLA / FANTA / SPRITE ============
  { barcode: '5449000000996', name: 'Coca-Cola 500ml', brand: 'Coca-Cola', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '5449000054227', name: 'Coca-Cola 1L', brand: 'Coca-Cola', packagingType: 'plastic', weightGrams: 40 },
  { barcode: '5449000131805', name: 'Coca-Cola Zero 500ml', brand: 'Coca-Cola', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '5000112637922', name: 'Fanta 500ml', brand: 'Fanta', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '5000112637939', name: 'Fanta 1L', brand: 'Fanta', packagingType: 'plastic', weightGrams: 40 },
  { barcode: '5000112637924', name: 'Fanta Orange 330ml', brand: 'Fanta', packagingType: 'aluminium', weightGrams: 15 },
  { barcode: '5449000014535', name: 'Sprite 500ml', brand: 'Sprite', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '5449000011527', name: 'Sprite 1L', brand: 'Sprite', packagingType: 'plastic', weightGrams: 40 },

  // ============ PEPSI ============
  { barcode: '4062139002798', name: 'Pepsi 500ml', brand: 'Pepsi', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '4062139002804', name: 'Pepsi 1L', brand: 'Pepsi', packagingType: 'plastic', weightGrams: 40 },
  { barcode: '4062139002880', name: 'Pepsi 1.5L', brand: 'Pepsi', packagingType: 'plastic', weightGrams: 48 },
  { barcode: '4062139002750', name: 'Pepsi Max 500ml', brand: 'Pepsi', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '4062139002767', name: 'Mirinda 500ml', brand: 'Pepsi', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '4062139002774', name: '7Up 500ml', brand: 'Pepsi', packagingType: 'plastic', weightGrams: 28 },

  // ============ NESTLE ============
  { barcode: '7613034626844', name: 'Nescafe Classic 100g', brand: 'Nestle', packagingType: 'glass', weightGrams: 200 },
  { barcode: '7613034626820', name: 'Nescafe Gold 100g', brand: 'Nestle', packagingType: 'glass', weightGrams: 220 },
  { barcode: '7613287207722', name: 'Nestea Lemon 500ml', brand: 'Nestle', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '7613036627627', name: 'KitKat 4F', brand: 'Nestle', packagingType: 'plastic', weightGrams: 30 },
  { barcode: '7613036627641', name: 'KitKat Chunky', brand: 'Nestle', packagingType: 'plastic', weightGrams: 48 },

  // ============ UNILEVER ============
  { barcode: '8722700184326', name: 'Lipton Yellow 25tb', brand: 'Lipton', packagingType: 'paper', weightGrams: 50 },
  { barcode: '8722700184333', name: 'Lipton Green 25tb', brand: 'Lipton', packagingType: 'paper', weightGrams: 50 },
  { barcode: '8722700010922', name: 'Lipton Ice Tea 500ml', brand: 'Lipton', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '8712566322256', name: 'Dove Shampoo 400ml', brand: 'Dove', packagingType: 'plastic', weightGrams: 60 },
  { barcode: '8712566322263', name: 'Dove Soap 100g', brand: 'Dove', packagingType: 'paper', weightGrams: 100 },
  { barcode: '8710908004841', name: 'Rexona Deodorant', brand: 'Rexona', packagingType: 'plastic', weightGrams: 50 },
  { barcode: '8712566322270', name: 'Axe Deodorant', brand: 'Axe', packagingType: 'aluminium', weightGrams: 150 },

  // ============ DANONE ============
  { barcode: '3033490004330', name: 'Evian 500ml', brand: 'Danone', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '3033490004347', name: 'Evian 1.5L', brand: 'Danone', packagingType: 'plastic', weightGrams: 48 },
  { barcode: '3033490004354', name: 'Volvic 500ml', brand: 'Danone', packagingType: 'plastic', weightGrams: 28 },
  { barcode: '8712566000017', name: 'Actimel 100g', brand: 'Danone', packagingType: 'plastic', weightGrams: 12 },
  { barcode: '8712566000024', name: 'Activia 125g', brand: 'Danone', packagingType: 'plastic', weightGrams: 15 },

  // ============ EKSPORT ============
  { barcode: '5901234123457', name: 'Tymbark Apple 250ml', brand: 'Tymbark', packagingType: 'paper', weightGrams: 25 },
  { barcode: '5901234123464', name: 'Tymbark Orange 250ml', brand: 'Tymbark', packagingType: 'paper', weightGrams: 25 },
  { barcode: '5901234123471', name: 'Tymbark Multivitamin 250ml', brand: 'Tymbark', packagingType: 'paper', weightGrams: 25 },

  // ============ RED BULL ============
  { barcode: '9002490100070', name: 'Red Bull 250ml', brand: 'Red Bull', packagingType: 'aluminium', weightGrams: 15 },
  { barcode: '9002490100087', name: 'Red Bull Sugarfree', brand: 'Red Bull', packagingType: 'aluminium', weightGrams: 15 },
  { barcode: '9002490100094', name: 'Red Bull 355ml', brand: 'Red Bull', packagingType: 'aluminium', weightGrams: 18 },

  // ============ MONSTER ============
  { barcode: '5060337500512', name: 'Monster Energy 500ml', brand: 'Monster', packagingType: 'aluminium', weightGrams: 25 },
  { barcode: '5060337500529', name: 'Monster Ultra 500ml', brand: 'Monster', packagingType: 'aluminium', weightGrams: 25 },

  // ============ JUICES ============
  { barcode: '4600909000105', name: 'Сочный Apple 1L', brand: 'J7', packagingType: 'paper', weightGrams: 35 },
  { barcode: '4600909000112', name: 'Сочный Orange 1L', brand: 'J7', packagingType: 'paper', weightGrams: 35 },
  { barcode: '4600909000129', name: 'Rich Apple 1L', brand: 'Rich', packagingType: 'paper', weightGrams: 35 },
  { barcode: '4600909000136', name: 'Rich Orange 1L', brand: 'Rich', packagingType: 'paper', weightGrams: 35 },
  { barcode: '4600909000143', name: 'Моя Семья Apple 1L', brand: 'Моя Семья', packagingType: 'paper', weightGrams: 35 },
  { barcode: '4600909000150', name: 'Моя Семья Orange 1L', brand: 'Моя Семья', packagingType: 'paper', weightGrams: 35 },

  // ============ WATER ============
  { barcode: '4600681000017', name: 'Aqua Minerale 500ml', brand: 'Aqua Minerale', packagingType: 'plastic', weightGrams: 22 },
  { barcode: '4600681000024', name: 'Aqua Minerale 1.5L', brand: 'Aqua Minerale', packagingType: 'plastic', weightGrams: 42 },
  { barcode: '4605941000012', name: 'Святой Источник 500ml', brand: 'Святой Источник', packagingType: 'plastic', weightGrams: 22 },
  { barcode: '4605941000029', name: 'Святой Источник 1.5L', brand: 'Святой Источник', packagingType: 'plastic', weightGrams: 42 },
  { barcode: '4780001365485', name: 'Hydrolife 500ml', brand: 'Hydrolife', packagingType: 'plastic', weightGrams: 22 },

  // ============ SNICKERS / MARS ============
  { barcode: '5000159407236', name: 'Snickers 50g', brand: 'Mars', packagingType: 'plastic', weightGrams: 50 },
  { barcode: '5000159407243', name: 'Twix 50g', brand: 'Mars', packagingType: 'plastic', weightGrams: 50 },
  { barcode: '5000159407250', name: 'M&M\'s 45g', brand: 'Mars', packagingType: 'plastic', weightGrams: 45 },
  { barcode: '5000159407267', name: 'Bounty 57g', brand: 'Mars', packagingType: 'plastic', weightGrams: 57 },

  // ============ MONDELEZ ============
  { barcode: '7622210449283', name: 'Oreo 154g', brand: 'Mondelez', packagingType: 'plastic', weightGrams: 154 },
  { barcode: '7622210449290', name: 'Milka 100g', brand: 'Mondelez', packagingType: 'paper', weightGrams: 100 },
  { barcode: '7622210449306', name: 'Toblerone 100g', brand: 'Mondelez', packagingType: 'paper', weightGrams: 100 },
  { barcode: '7622300489328', name: 'Alpen Gold 90g', brand: 'Mondelez', packagingType: 'paper', weightGrams: 90 },

  // ============ FERRERO ============
  { barcode: '8000500037560', name: 'Kinder Bueno 43g', brand: 'Ferrero', packagingType: 'plastic', weightGrams: 43 },
  { barcode: '8000500037577', name: 'Kinder Surprise 20g', brand: 'Ferrero', packagingType: 'plastic', weightGrams: 20 },
  { barcode: '8000500310342', name: 'Nutella 350g', brand: 'Ferrero', packagingType: 'glass', weightGrams: 450 },
  { barcode: '8000500310359', name: 'Ferrero Rocher 200g', brand: 'Ferrero', packagingType: 'plastic', weightGrams: 200 },

  // ============ DAIRY ============
  { barcode: '4600000000019', name: 'Молоко 1L', brand: 'Простоквашино', packagingType: 'paper', weightGrams: 35 },
  { barcode: '4600000000026', name: 'Кефир 1L', brand: 'Простоквашино', packagingType: 'paper', weightGrams: 35 },
  { barcode: '4600000000033', name: 'Йогурт 290g', brand: 'Активиа', packagingType: 'plastic', weightGrams: 18 },

  // ============ O'ZBEKISTON ============
  { barcode: '4780000000019', name: 'Урмат Чой 100g', brand: 'Урмат', packagingType: 'paper', weightGrams: 100 },
  { barcode: '4780000000026', name: 'Урмат Грин 100g', brand: 'Урмат', packagingType: 'paper', weightGrams: 100 },
  { barcode: '4780000000033', name: 'Gazli Suv 500ml', brand: 'Hydrolife', packagingType: 'plastic', weightGrams: 22 },
  { barcode: '4780000000040', name: 'Fanta 1.5L', brand: 'Fanta', packagingType: 'plastic', weightGrams: 48 },
  { barcode: '4780000000057', name: 'Coca-Cola 1.5L', brand: 'Coca-Cola', packagingType: 'plastic', weightGrams: 48 },

  // ============ BOSHQA ============
  { barcode: '4901777308328', name: 'Suntory Tennensui 550ml', brand: 'Suntory', packagingType: 'plastic', weightGrams: 24 },
  { barcode: '4902102112780', name: 'Kirin Lemon 500ml', brand: 'Kirin', packagingType: 'plastic', weightGrams: 22 },
  { barcode: '4901234567890', name: 'Asahi Super Dry 350ml', brand: 'Asahi', packagingType: 'aluminium', weightGrams: 15 },

  // ============ QO'SHIMCHA 30+ ============
  { barcode: '1234567890123', name: 'Local Product 1', brand: 'Local', packagingType: 'plastic', weightGrams: 25 },
  { barcode: '1234567890124', name: 'Local Product 2', brand: 'Local', packagingType: 'aluminium', weightGrams: 15 },
  { barcode: '1234567890125', name: 'Local Product 3', brand: 'Local', packagingType: 'paper', weightGrams: 30 },
  { barcode: '1234567890126', name: 'Local Product 4', brand: 'Local', packagingType: 'glass', weightGrams: 250 },
  { barcode: '1234567890127', name: 'Local Product 5', brand: 'Local', packagingType: 'plastic', weightGrams: 22 },
  { barcode: '1234567890128', name: 'Local Product 6', brand: 'Local', packagingType: 'aluminium', weightGrams: 18 },
  { barcode: '1234567890129', name: 'Local Product 7', brand: 'Local', packagingType: 'paper', weightGrams: 28 },
  { barcode: '1234567890130', name: 'Local Product 8', brand: 'Local', packagingType: 'plastic', weightGrams: 26 },
  { barcode: '1234567890131', name: 'Local Product 9', brand: 'Local', packagingType: 'glass', weightGrams: 220 },
  { barcode: '1234567890132', name: 'Local Product 10', brand: 'Local', packagingType: 'plastic', weightGrams: 24 },
];

async function main() {
  console.log('🌱 Seeding...');

  let added = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    try {
      await prisma.product.upsert({
        where: { barcode: p.barcode },
        update: {},
        create: {
          barcode: p.barcode,
          name: p.name,
          brand: p.brand,
          packagingType: p.packagingType,
          weightGrams: p.weightGrams,
          source: 'manual',
          verified: true,
        },
      });
      added++;
    } catch (err) {
      skipped++;
    }
  }

  console.log(`✅ ${added} ta qo'shildi, ${skipped} ta o'tkazib yuborildi`);
  console.log(`📦 Jami: ${await prisma.product.count()} ta mahsulot`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });