import React from 'react'
import { Background } from "@/components/BackGround";

const ResetPassword = () => {
  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#fcf8f7]">
      <Background />
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white w-[340px] h-[600px] rounded-4xl">
          <div className="flex justify-center mt-25">
            Reset Password
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
