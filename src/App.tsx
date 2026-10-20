import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "@/layout"
import Home from "@/features/Home"
import ProductList from "@/features/product/ProductList";
import ProductFormPage from "@/features/product/ProductFormPage";
import Order from "@/features/order/Order";
import Login from "@/features/auth/Login";
import ResetPassword from "@/features/auth/ResetPassword";
import OrderConfirm from '@/features/order/OrderConfirm';
import User from "@/features/user/User";
import Chatbot from "./features/chatbot/Chatbot";
import { AiAnswer } from "./features/aiAnswer/AiAnswer";
import { Usage } from "./features/usage/Usage";
import { UsageGraph } from "./features/usage/UsageGraph";
import { LineChat } from "./features/LineChat/LineChat";
import { RichMenuSetting } from "./features/richMenu/RichMenuSetting";
import { OwnerRegister } from "./features/auth/register/OwnerRegister";
import { Bill } from "./features/bill/Bill";
import { AdminList } from "./features/adminList/AdminList";
import { OverallSetting } from "./features/setting/overallSetting/OverAllSetting";
import { SelectMenu } from "./features/setting/selectMenu/SelectMenu";
import { AiSetting } from "./features/setting/aiSetting/AiSetting";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import GuestRoute from "@/features/auth/components/GuestRoute";


import InternalCustomerChat from "./features/internalCustomerChat/InternalCustomerChat";

function App() {

  return (
    <Routes>
      {/* ---------- ต้อง login ก่อนถึงจะเห็นข้อมูลข้างในได้ ---------- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="/rich-menu/setting" element={<RichMenuSetting />} />

          <Route path="/product" element={<ProductList />} />
          <Route path="/product/add" element={<ProductFormPage />} />
          <Route path="/product/:id/edit" element={<ProductFormPage />} />

          <Route path="/order" element={<Order />} />
          <Route path="/order/confirm/:id" element={<OrderConfirm />} />

          <Route path="/users" element={<User />} />

          <Route path="/chat/line" element={<LineChat />} />

          <Route path="/ai-answer" element={<AiAnswer />} />

          <Route path="/ai-chat" element={<Chatbot />} />
          <Route path="/ai/internal-customer-chat" element={<InternalCustomerChat />} />

          <Route path="/usage" element={<Usage />} />
          <Route path="/usage/Graph" element={<UsageGraph />} />
          <Route path="/bill" element={<Bill />} />
          <Route path="/admin-list" element={<AdminList />} />
          <Route path="/setting/admin/over-all" element={<OverallSetting />} />
          <Route path="/setting/admin/select-menu" element={<SelectMenu />} />
          <Route path="/setting/admin/ai-setting" element={<AiSetting />} />
        </Route>
      </Route>

      {/* ---------- เข้าได้เฉพาะตอนยังไม่ login ---------- */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/owner-register" element={<OwnerRegister />} />
      </Route>

      {/* เปิดได้ทั้งสองสถานะ เผื่อกดมาจากลิงก์ในอีเมลตอน session เก่ายังค้างอยู่ */}
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
