import { useAppSelector } from "../redux/types";
import { workerSelector } from "../redux/reducers/workerReducer";
import { useEffect, useState } from "react";
import { Permission } from "../types";
import { errorToast } from "@src/utils/toast";
import { useTranslation } from "react-i18next";

const usePermissionCheck = () => {
  const worker = useAppSelector(workerSelector);
  const [scanModal, $scanModal] = useState(false);
  const [pendingAction, $pendingAction] = useState<null | (() => void)>(null);
  const { t } = useTranslation();

  const checkPermissionAndExecute = (permission: Permission, action: () => void) => {
    if (!worker?.permissions) {
      return action();
    }
    const hasPermission = worker?.permissions?.findIndex(item => item.name === permission) > -1; // e.g. returns true/false

    if (hasPermission) {
      action();
    } else {
      $pendingAction(() => action);
      $scanModal(true);
    }
  };

  const close = () => {
    $scanModal(false);
    $pendingAction(null);
  };

  useEffect(() => {
    if (!scanModal) {
      return;
    }

    let scannedCode = "";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Enter" && scannedCode?.length > 0) {
        e.preventDefault();
        let isValid = false;

        if (scannedCode === worker?.sale_point_id) {
          isValid = true;
        }

        if (isValid && pendingAction) {
          pendingAction();
          $pendingAction(null);
          $scanModal(false);
        } else {
          errorToast(t("error"));
        }
        scannedCode = "";
      } else {
        if (e.key.length === 1) {
          scannedCode += e.key;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [scanModal]);

  return {
    scanModal,
    $scanModal,
    checkPermissionAndExecute,
    close,
  };
};

export default usePermissionCheck;
