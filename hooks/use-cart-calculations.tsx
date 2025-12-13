import { useEffect, useMemo, useState } from 'react';
import { productApi } from '@/lib/api-helper/product-api';
import { CartCustomization, PublicProductDetailsType } from '@/types';
import { CartItem } from '@/store/useCart';
import { toast } from 'sonner';

export interface ProductWithDetails {
  productId: number;
  slug: string;
  details: PublicProductDetailsType | null;
  variants: Array<{
    color: string;
    size: string;
    quantity: number;
    image: string;
    printSide: 'one' | 'two';
    customizations?: CartCustomization[];
  }>;
}

export interface CartCalculations {
  subtotal: number;
  quantityDiscount: number;
  flatDiscount: number;
  totalDiscount: number;
  total: number;
}

export function useCartCalculations(items: CartItem[]) {
  const [productsWithDetails, setProductsWithDetails] = useState<
    ProductWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch product details for all unique products in cart
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Group items by productId
        const groupedByProduct = items.reduce((acc, item) => {
          if (!acc[item.productId]) {
            acc[item.productId] = {
              productId: item.productId,
              slug: item.slug,
              variants: [],
            };
          }
          acc[item.productId].variants.push({
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            image: item.image,
            printSide: item.printSide,
            customizations: item.customizations,
          });
          return acc;
        }, {} as Record<number, Omit<ProductWithDetails, 'details'>>);

        // Fetch details for each unique product
        const productDetailsPromises = Object.values(groupedByProduct).map(
          async (product) => {
            try {
              const response =
                await productApi.public.products.getSingleProduct(product.slug);
              return {
                ...product,
                details: response.data.data,
              };
            } catch (error) {
              console.error(`Failed to fetch product ${product.slug}:`, error);
              return {
                ...product,
                details: null,
              };
            }
          }
        );

        const productsWithDetailsData = await Promise.all(
          productDetailsPromises
        );
        setProductsWithDetails(productsWithDetailsData);
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (items.length > 0) {
      fetchProductDetails();
    } else {
      setProductsWithDetails([]);
      setLoading(false);
    }
  }, [items]);

  // Calculate totals
  const calculations = useMemo(() => {
    let grandTotal = 0;
    let totalQuantityDiscount = 0;
    let totalFlatDiscount = 0;

    productsWithDetails.forEach((product) => {
      if (!product.details) return;

      let productBaseTotal = 0;
      let totalProductQuantity = 0;

      // Calculate base price for all variants (before any discounts)
      product.variants.forEach((variant) => {
        const matchingVariant = product.details!.variants.find(
          (v) => v.color.name === variant.color && v.size.name === variant.size
        );

        let itemPrice = matchingVariant
          ? matchingVariant.price
          : product.details!.minPrice || 0;

        // Add print side price if applicable
        if (variant.printSide === 'two' && product.details!.twoSidePrice) {
          itemPrice += product.details!.twoSidePrice;
        }

        productBaseTotal += itemPrice * variant.quantity;
        totalProductQuantity += variant.quantity;
      });

      let productTotal = productBaseTotal;

      // Apply quantity discount FIRST (direct subtraction, not percentage)
      if (
        product.details.quantityDiscounts &&
        product.details.quantityDiscounts.length > 0
      ) {
        const applicableDiscounts = product.details.quantityDiscounts.filter(
          (discount) => {
            const minQty = discount.minQty;
            const maxQty = discount.maxQty;
            return maxQty
              ? totalProductQuantity >= minQty && totalProductQuantity <= maxQty
              : totalProductQuantity >= minQty;
          }
        );

        if (applicableDiscounts.length > 0) {
          const bestDiscount = applicableDiscounts.reduce((max, current) =>
            current.amount > max.amount ? current : max
          );
          totalQuantityDiscount += bestDiscount.amount;
          productTotal -= bestDiscount.amount; // Direct subtraction
        }
      }

      // Apply flat discount AFTER quantity discount (percentage-based)
      if (product.details.flatDiscount && product.details.flatDiscount > 0) {
        const flatDiscountAmount =
          (productTotal * product.details.flatDiscount) / 100;
        totalFlatDiscount += flatDiscountAmount;
        productTotal -= flatDiscountAmount;
      }

      grandTotal += productTotal;
    });

    const subtotalBeforeDiscounts =
      grandTotal + totalQuantityDiscount + totalFlatDiscount;
    const totalDiscounts = totalQuantityDiscount + totalFlatDiscount;

    return {
      subtotal: subtotalBeforeDiscounts,
      quantityDiscount: totalQuantityDiscount,
      flatDiscount: totalFlatDiscount,
      totalDiscount: totalDiscounts,
      total: grandTotal,
    };
  }, [productsWithDetails]);

  return {
    productsWithDetails,
    calculations,
    loading,
  };
}
