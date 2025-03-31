"use client";

import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const { totalQuantity } = useSelector((state) => state.cart);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [prevQuantity, setPrevQuantity] = useState(totalQuantity);

  useEffect(() => {
    if (totalQuantity > prevQuantity) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 1000);

      return () => clearTimeout(timer);
    }

    setPrevQuantity(totalQuantity);
  }, [totalQuantity, prevQuantity]);

  return (
    <Link href="/cart" className="relative">
      <div
        className={`p-2 rounded-full ${
          isHighlighted
            ? "bg-primary bg-opacity-20 animate-pulse"
            : "hover:bg-gray-100"
        } transition-all duration-300`}
      >
        <ShoppingCart
          size={22}
          className={`${isHighlighted ? "text-primary" : "text-gray-700"}`}
        />

        {totalQuantity > 0 && (
          <span
            className={`absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-transform ${
              isHighlighted ? "transform scale-125" : ""
            }`}
          >
            {totalQuantity > 9 ? "9+" : totalQuantity}
          </span>
        )}
      </div>
    </Link>
  );
}
