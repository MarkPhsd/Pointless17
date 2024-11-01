import { Component, Input } from '@angular/core';
// import { IProduct } from 'src/app/_interfaces';
// import { IPriceCategory2, PriceCategories, PriceTiers } from 'src/app/_interfaces/menu/price-categories';

interface FlowNode {
  id: string;
  label: string;
}

interface FlowLink {
  from: string;
  to: string;
}

@Component({
  selector: 'price-tier-nodes',
  templateUrl: './price-tier-nodes.component.html',
  styleUrls: ['./price-tier-nodes.component.scss']
})
export class PriceTierNodesComponent {
  nodes: FlowNode[] = [];
  links: FlowLink[] = [];

  // @Input() products : IProduct[];
  // @Input() priceCategories: PriceCategories[];
  // @Input() priceTiers : PriceTiers[];

 products = [
    { id: 1, name: 'Blue Dream', priceCategory: 1 },
    { id: 2, name: 'Sour Diesel', priceCategory: 2 },
    { id: 3, name: 'OG Kush', priceCategory: 3 },
    { id: 4, name: 'Pineapple Express', priceCategory: 4 },
    { id: 5, name: 'Purple Haze', priceCategory: 5 },
    { id: 6, name: 'Green Crack', priceCategory: 6 }
  ];

  priceCategories = [
    { id: 1, name: 'Indica', productPrices: [{ priceTiers: { id: 1 } }] },
    { id: 2, name: 'Sativa', productPrices: [{ priceTiers: { id: 2 } }] },
    { id: 3, name: 'Hybrid', productPrices: [{ priceTiers: { id: 3 } }] },
    { id: 4, name: 'CBD', productPrices: [{ priceTiers: { id: 4 } }] },
    { id: 5, name: 'THC Heavy', productPrices: [{ priceTiers: { id: 5 } }] },
    { id: 6, name: 'Balanced', productPrices: [{ priceTiers: { id: 6 } }] }
  ];

  priceTiers = [
    { id: 1, name: 'Tier1' },
    { id: 2, name: 'Tier2' },
    { id: 3, name: 'Tier3' },
    { id: 4, name: 'Tier4' },
    { id: 5, name: 'Tier5' },
    { id: 6, name: 'Tier6' }
  ];

  constructor() {
    this.setupNodesAndLinks();
  }

  setupNodesAndLinks() {
    // Add product nodes
    this.products.forEach(product => {
      this.nodes.push({ id: `product-${product.id}`, label: product.name });

      const category = this.priceCategories.find(cat => cat.id === product.priceCategory);
      if (category) {
        this.nodes.push({ id: `category-${category.id}`, label: category.name });
        this.links.push({ from: `product-${product.id}`, to: `category-${category.id}` });

        if (category.productPrices?.length > 0) {
          const firstProductPrice = category.productPrices[0];
          if (firstProductPrice.priceTiers) {
            const tier = this.priceTiers.find(t => t.id === firstProductPrice.priceTiers.id);
            if (tier) {
              this.nodes.push({ id: `tier-${tier.id}`, label: tier.name });
              this.links.push({ from: `category-${category.id}`, to: `tier-${tier.id}` });
            }
          }
        }
      }
    });
  }

  reverseTree() {

    this.priceTiers.forEach(tier => {
      // Start with each tier as the base node
      this.nodes.push({ id: `tier-${tier.id}`, label: tier.name });

      // Find categories associated with this tier
      const categoriesWithTier = this.priceCategories.filter(category =>
        Array.isArray(category.productPrices) && category.productPrices.some(productPrice =>
          productPrice.priceTiers && productPrice.priceTiers.id === tier.id
        )
      );

      categoriesWithTier.forEach(category => {
        // Add each category node and link it to the tier
        this.nodes.push({ id: `category-${category.id}`, label: category.name });
        this.links.push({ from: `tier-${tier.id}`, to: `category-${category.id}` });

        // Find products associated with this category
        const productsInCategory = this.products.filter(product => product.priceCategory === category.id);
        productsInCategory.forEach(product => {
          // Add each product node and link it to the category
          this.nodes.push({ id: `product-${product.id}`, label: product.name });
          this.links.push({ from: `category-${category.id}`, to: `product-${product.id}` });
        });
      });
    });

  }
}
