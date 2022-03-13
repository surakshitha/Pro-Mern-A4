/* global db print */
/* eslint no-restricted-globals: "off" */

db.products.remove({});

const issuesDB = [
  {
    id: 1,
    category: 'Shirts',
    price: 16.99,
    name: 'Blue Shirt',
    image: 'https://www.aeropostale.com/yin-yang-chain-graphic-tee/60068781.html?dwvar_60068781_color=420&cgid=guys-tops-tees#start=11',
  },
  {
    id: 2,
    category: 'Accessories',
    price: 12.99,
    name: 'Logo Hat',
    image: 'https://www.aeropostale.com/aeropostale-script-adjustable-hat/76036715.html?dwvar_76036715_color=377&cgid=#q=hat&lang=default&start=5',
  },
  {
    id: 3,
    category: 'Jeans',
    price: 34.99,
    name: 'Regular Fit Jeans',
    image: 'https://www.aeropostale.com/slim-straight-jean/64114764.html?dwvar_64114764_color=189&cgid=jeans-guys-slimstraight#start=2',
  },
];

db.products.insertMany(issuesDB);

const count = db.products.count();
print('Inserted', count, ' products');

db.counters.remove({ _id: 'products' });
db.counters.insert({ _id: 'products', current: count });

db.products.createIndex({ id: 1 }, { unique: true });
db.products.createIndex({ name: 1 });
