import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  console.log('Seeding database...');

  // 1. Create Permissions
  const permissionsData = [
    'products.create', 'products.edit', 'products.delete', 'products.view',
    'orders.view', 'orders.update', 'orders.cancel',
    'inventory.view', 'inventory.update',
    'customers.view',
    'reports.view',
    'customizations.review'
  ];

  const permissions: any[] = [];
  for (const permName of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName },
    });
    permissions.push(perm);
  }
  console.log(`Seeded ${permissions.length} permissions.`);

  // 2. Create Roles
  const roles = {
    SUPER_ADMIN: await prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        permissions: {
          connect: permissions.map(p => ({ id: p.id })),
        },
      },
    }),
    CUSTOMER: await prisma.role.upsert({
      where: { name: 'CUSTOMER' },
      update: {},
      create: {
        name: 'CUSTOMER',
        permissions: {
          connect: permissions.filter(p => p.name === 'products.view').map(p => ({ id: p.id })),
        },
      },
    }),
  };
  console.log('Seeded Roles: SUPER_ADMIN, CUSTOMER.');

  // 3. Create Super Admin User
  const adminEmail = 'admin@diyacreation.com';
  const hashedPassword = await bcrypt.hash('Password@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Diya Admin',
      roleId: roles.SUPER_ADMIN.id,
    },
  });
  console.log(`Seeded admin user: ${adminUser.email}`);

  // 4. Create Categories
  const categoriesData = [
    { name: 'Chocolates', slug: 'chocolates', description: 'Handmade luxury chocolates and truffles' },
    { name: 'Personalized Gifts', slug: 'personalized-gifts', description: 'Custom printed and engraved gifts' },
    { name: 'Gift Hampers', slug: 'gift-hampers', description: 'Curated luxury hampers for celebrations' },
    { name: 'Festivals', slug: 'festivals', description: 'Special collection for Indian festivals' },
    { name: 'Corporate Gifts', slug: 'corporate-gifts', description: 'Branded gift solutions for companies' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Seeded Categories.');

  // 5. Create Products & Custom Options
  // Product 1: Artisanal Chocolate Pralines Box
  const p1 = await prisma.product.upsert({
    where: { sku: 'CHOC-PRAL-09' },
    update: {},
    create: {
      sku: 'CHOC-PRAL-09',
      name: 'Artisanal Chocolate Pralines Box (9 Pcs)',
      slug: 'artisanal-chocolate-pralines-9-pcs',
      description: 'An elegant selection of 9 handcrafted chocolates including Hazelnut Praline, Salted Caramel, and Coffee Ganache. Freshly prepared with premium Belgian chocolate.',
      price: 499.00,
      costPrice: 200.00,
      stock: 250,
      weight: 180.0,
      shelfLife: '3 Months',
      ingredients: 'Cocoa butter, sugar, milk powder, hazelnut paste, coffee bean extract, salted caramel.',
      allergens: 'Contains milk and tree nuts.',
      packaging: 'Premium magnetic cardboard slider box with gold foil lettering.',
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: categories['chocolates'].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1548907040-4d42b52125e0?w=600&auto=format&fit=crop&q=80', isPrimary: true }
        ]
      }
    }
  });

  // Product 2: Personalized Engraved Wooden Photo Frame (Customizable)
  const p2 = await prisma.product.upsert({
    where: { sku: 'GIFT-WD-FRAME' },
    update: {},
    create: {
      sku: 'GIFT-WD-FRAME',
      name: 'Custom Engraved Wooden Photo Frame',
      slug: 'custom-engraved-wooden-photo-frame',
      description: 'Capture beautiful memories in a solid birchwood photo frame, laser engraved with your choice of names, dates, or personal messages.',
      price: 699.00,
      costPrice: 250.00,
      stock: 120,
      weight: 350.0,
      packaging: 'Bubble wrap inside a brown corrugated box.',
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: categories['personalized-gifts'].id,
      customizable: true,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=600&auto=format&fit=crop&q=80', isPrimary: true }
        ]
      },
      customOptions: {
        create: [
          { type: 'TEXT', label: 'Engraved Names / Heading', priceCharge: 0.0 },
          { type: 'TEXT', label: 'Engraved Date or Message (Optional)', priceCharge: 50.0 },
          { type: 'IMAGE', label: 'Upload Photo to Print & Frame', priceCharge: 100.0 }
        ]
      }
    }
  });

  // Product 3: Luxurious Royal Celebration Hamper
  const p3 = await prisma.product.upsert({
    where: { sku: 'HAMP-ROY-CELEB' },
    update: {},
    create: {
      sku: 'HAMP-ROY-CELEB',
      name: 'Luxurious Royal Celebration Hamper',
      slug: 'luxurious-royal-celebration-hamper',
      description: 'Exquisite celebration hamper containing a custom box of 9 pralines, a scented jar candle, roasted almond tin, chocolate wafer rolls, and a personalized greeting card.',
      price: 1999.00,
      costPrice: 900.00,
      stock: 80,
      weight: 1200.0,
      shelfLife: '2 Months',
      packaging: 'Premium velvet leatherette basket with satin ribbon bow tie.',
      status: 'PUBLISHED',
      isFeatured: true,
      categoryId: categories['gift-hampers'].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80', isPrimary: true }
        ]
      }
    }
  });

  console.log('Seeded sample products.');

  // 6. Seed Hamper Boxes
  const hamperBoxes = [
    { name: 'Sleek Obsidian Magnetic Box (Medium)', price: 299.0, capacity: 6, dimensions: '25x20x10 cm', imageUrl: 'obsidian_box' },
    { name: 'Royal Gold Velvet Chest (Large)', price: 499.0, capacity: 10, dimensions: '35x25x12 cm', imageUrl: 'gold_chest' },
    { name: 'Eco-Friendly Pine Wood Box', price: 399.0, capacity: 8, dimensions: '30x22x11 cm', imageUrl: 'wood_box' }
  ];

  for (const box of hamperBoxes) {
    // Use findFirst + create pattern since HamperBox has no unique constraint
    const existing = await prisma.hamperBox.findFirst({ where: { name: box.name } });
    if (!existing) {
      await prisma.hamperBox.create({ data: box });
    }
  }
  console.log('Seeded Hamper Boxes.');

  // 7. Seed Hamper Components
  const components = [
    { name: 'Belgian Dark Chocolate Bar (70% Cocoa)', price: 150.0, stock: 300, type: 'CHOCOLATE', imageUrl: 'dark_choc_bar' },
    { name: 'Hazelnut & Pistachio Dragees Tin', price: 250.0, stock: 150, type: 'CHOCOLATE', imageUrl: 'dragees_tin' },
    { name: 'Scented French Lavender Candle', price: 300.0, stock: 120, type: 'GIFT', imageUrl: 'lavender_candle' },
    { name: 'Custom Engraved Wooden Keychain', price: 199.0, stock: 100, type: 'GIFT', imageUrl: 'wooden_keychain' },
    { name: 'Assorted Gourmet Cookies Box', price: 180.0, stock: 200, type: 'CHOCOLATE', imageUrl: 'cookies_box' },
    { name: 'Gold Foil Personalized Greeting Card', price: 99.0, stock: 500, type: 'ADDON', imageUrl: 'greeting_card' },
    { name: 'Satin Bow & Custom Ribbon Wrapping', price: 50.0, stock: 600, type: 'ADDON', imageUrl: 'ribbon_wrap' }
  ];

  for (const comp of components) {
    const existing = await prisma.hamperComponent.findFirst({ where: { name: comp.name } });
    if (!existing) {
      await prisma.hamperComponent.create({ data: comp });
    }
  }
  console.log('Seeded Hamper Components.');

  // 8. Seed Sample Coupons
  const coupons = [
    {
      code: 'WELCOME10',
      discount: 10.0,
      type: 'PERCENTAGE',
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    {
      code: 'FLAT200',
      discount: 200.0,
      type: 'FIXED',
      isActive: true,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    },
    {
      code: 'DIYACORP',
      discount: 15.0,
      type: 'PERCENTAGE',
      isActive: true,
      expiresAt: null,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }
  console.log('Seeded sample coupons.');

  // 9. Seed Initial Settings
  const settings = [
    { key: 'site.name', value: 'Diya Creation' },
    { key: 'site.tagline', value: 'Luxury Chocolates & Personalized Gifts' },
    { key: 'site.announcement', value: 'Free shipping on orders above ₹1,500 | Use code WELCOME10 for 10% off' },
    { key: 'site.currency', value: 'INR' },
    { key: 'site.phone', value: '+91 98765 43210' },
    { key: 'site.email', value: 'hello@diyacreation.com' },
    { key: 'shipping.free_threshold', value: '1500' },
    { key: 'shipping.standard_fee', value: '150' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('Seeded initial settings.');

  console.log('Database Seeding Completed Successfully.');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
