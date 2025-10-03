import useNetworkStatus from "./useNetworkStatus";
import { syncPendingCheckouts, syncPendingRefunds } from "@src/database/offlineCheckout";
import { syncOfflineShifts } from "@src/database/offlineShifts";
import { EPresetTimes } from "@src/shared/types";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { syncOfflineTransactions } from "@src/database/offlineTransaction";

export const QKOfflineSync = "sync-items";

const useOfflineSync = () => {
  const isOnline = useNetworkStatus();

  return useQuery({
    queryKey: [QKOfflineSync],
    queryFn: async () => {
      await syncPendingCheckouts();
      await syncPendingRefunds();
      await syncOfflineShifts();
      await syncOfflineTransactions();

      return dayjs().toISOString();
    },
    staleTime: EPresetTimes.MINUTE,
    gcTime: EPresetTimes.MINUTE + EPresetTimes.SECOND * 10,
    refetchInterval: EPresetTimes.MINUTE,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    enabled: isOnline,
    networkMode: "online",
  });
};

export default useOfflineSync;
