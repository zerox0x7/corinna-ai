'use client'
import React from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { getUploadcareImageUrl } from '@/lib/utils'

type ProductCardProps = {
  product: {
    id: string
    name: string
    price: number
    image: string
    domainId?: string | null
  }
  domainId: string
  customerId?: string
}

const ProductCard = ({ product, domainId, customerId }: ProductCardProps) => {
  const handleViewProduct = () => {
    // Navigate to payment page
    window.open(
      `${window.location.origin}/portal/${domainId}/payment/${customerId}`,
      '_blank'
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <div className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden max-w-[320px]">
      <div className="flex gap-3 p-3">
        {/* Product Image */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
          <Image
            src={getUploadcareImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-gray-900 mb-2">
            {formatPrice(product.price)}
          </p>

          {/* View Button */}
          <button
            onClick={handleViewProduct}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors duration-200"
          >
            <span>View Product</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

