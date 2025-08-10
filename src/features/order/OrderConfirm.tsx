import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';


import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { orderdetail, ordernotic } from "@/data/order.data"
import {
  AArrowDown,
  Trash,
  ChevronDown,
  Layers2,
  CreditCard,
  PackageSearch,
  Truck,
  Download,
  MessageSquare,
  Copy,
  Phone
} from 'lucide-react';
import ConfirmOrderTable from "./components/ConfirmOrderTable";
import ConfirmOrderShipping from "./components/ConfirmOrderShipping";
import ConfirmOrderPayments from "./components/ConfirmOrderPayments";
import ConfirmOrderCustomer from "./components/ConfirmOrderCustomer";


const orderConfirm = () => {

  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);


  const [currentPage, setCurrentPage] = useState(1);
  const [currentItems, setCurrentItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(4);


  useEffect(() => {
    const order = ordernotic.find(order => order.orderID === id);
    console.log("Received ID from URL:", order);
    setOrderData(order);
    setLoading(false);
  }, [id]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 700) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(6);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentItems(orderdetail.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, itemsPerPage, orderdetail]);


  return (
    <div className='max-w-6xl mx-auto mt-2 mb-6 lg:px-0 md:px-10 px-0'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/order" className="text-xs">Order</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-xs">Confirm Order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-4">
        <p className="text-md">Order Number {id}</p>
      </div>


      <div className="mt-4 grid lg:grid-cols-[70%_30%] grid-cols-1 gap-4">

        {/* Process */}
        <ConfirmOrderShipping />

        {/* Payments Detail */}
        <ConfirmOrderPayments />

      </div>


      <div className="grid lg:grid-cols-[70%_30%] grid-cols-1 gap-4">

        {/* Product Order */}
        <ConfirmOrderTable products={orderdetail} />

        {/* Customer Detail */}
        <ConfirmOrderCustomer />

      </div>
    </div>
  )
}

export default orderConfirm
