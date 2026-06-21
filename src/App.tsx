import { Routes, Route } from "react-router-dom";
import Layout from "@/layout"
import Home from "@/features/Home"
import Product from "@/features/product/Product";
import AddProduct from "@/features/product/Add-product";
import EditProduct from "@/features/product/Edit-product";
import Order from "@/features/order/Order";
import Login from "@/features/auth/Login";
import ResetPassword from "@/features/auth/ResetPassword";
import OrderConfirm from '@/features/order/OrderConfirm';
import User from "@/features/user/User";
import Chatbot from "./features/chatbot/Chatbot";
import { AiAnswer } from "./features/aiAnswer/AiAnswer";
import { Usage } from "./features/usage/Usage";
import { ChartLine } from "lucide-react";
import { LineChat } from "./features/LineChat/LineChat";


function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        
        <Route path="/product" element={<Product />} />
        <Route path="/product/add-product" element={<AddProduct />} />
        <Route path="/product/edit-product/:id" element={<EditProduct />} />

        <Route path="/order" element={<Order />} />
        <Route path="/order/confirm/:id" element={<OrderConfirm />} />

        <Route path="/users" element={<User />} />

        <Route path="/chat/line" element={<LineChat />} />

        <Route path="/ai-answer" element={<AiAnswer />} />

         <Route path="/ai-chat" element={<Chatbot />} />

         <Route path="/usage" element={<Usage />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
