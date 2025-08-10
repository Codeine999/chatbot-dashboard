import { useState, useEffect } from "react";
import { getProducts } from "../services/getProducts";
import { http } from "@/lib/http";
import { IProduct } from "../type";


export function useProducts(initialStatus = {}) {
    const [products, setProducts] = useState<IProduct[]>([]);


      useEffect(() => {
        console.log("HTTP:", http);
        async function fetchProducts() {
          const product = await getProducts();
          setProducts(product);
          console.log(product)
        }
    
        fetchProducts();
      }, []);


}