import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lineChannelApi } from "../services/lineChannel.service";
import type {
  ConnectLineChannelInput,
  LineChannelSaveResult,
  LineChannelState,
} from "../type";
import { isForbiddenError, isTransportError } from "../utils/connectionErrors";

export const lineChannelKeys = {
  all: ["line-channel"] as const,
  status: () => [...lineChannelKeys.all, "status"] as const,
  webhook: () => [...lineChannelKeys.all, "webhook"] as const,
};

export function useLineChannelStatus() {
  return useQuery({
    queryKey: lineChannelKeys.status(),
    queryFn: lineChannelApi.getStatus,
    // 403 = ไม่ใช่ owner ลองซ้ำก็ได้ผลเดิม
    retry: (count, error) => !isForbiddenError(error) && count < 1,
  });
}

/**
 * บันทึก credential — ถ้าเน็ตหลุดหรือ timeout กลางทาง server อาจบันทึกไปแล้ว
 * (มันทำงานต่อจนจบแม้ client ตัดการเชื่อมต่อ) จึงถามสถานะจริงก่อนสรุปว่าล้มเหลว
 * เทียบ verifiedAt กับค่าก่อนกดบันทึก ไม่ใช้เวลาของเครื่องเรา เพราะนาฬิกาอาจเดินไม่ตรงกัน
 */
export function useConnectLineChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: ConnectLineChannelInput
    ): Promise<LineChannelSaveResult> => {
      const before =
        queryClient.getQueryData<LineChannelState>(lineChannelKeys.status())
          ?.verifiedAt ?? null;

      try {
        return await lineChannelApi.connect(input);
      } catch (error) {
        if (!isTransportError(error)) throw error;

        const latest = await lineChannelApi.getStatus().catch(() => null);
        if (
          latest?.source === "db" &&
          latest.verifiedAt &&
          latest.verifiedAt !== before
        )
          return { ...latest, webhook: null };

        throw error;
      }
    },
    onSuccess: ({ webhook, ...state }) => {
      void webhook;
      queryClient.setQueryData<LineChannelState>(
        lineChannelKeys.status(),
        state
      );
      // หน้าแรกอ่านข้อมูลบอทจาก LINE ด้วย token เดียวกัน ต้องโหลดใหม่ตามค่าที่เพิ่งบันทึก
      void queryClient.invalidateQueries({ queryKey: ["line-oa"] });
      // credential เปลี่ยน ผลตรวจ webhook เดิมใช้ไม่ได้แล้ว
      void queryClient.invalidateQueries({ queryKey: lineChannelKeys.webhook() });
    },
  });
}
